const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const {
  smtp,
  jwtSecret,
  jwtExpiresIn,
  sessionMaxAgeMs,
  sessionCookieOptions,
} = require("../Config/env");

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), 10);

const transporter = nodemailer.createTransport({
  service: smtp.service,
  auth: { user: smtp.user, pass: smtp.pass },
});

const sendOtpEmail = (email, otp) =>
  transporter.sendMail({
    from: smtp.from,
    to: email,
    subject: "Your NXTHREADS verification code",
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
  });

const hasActiveOtp = (record) =>
  Boolean(
    record &&
    record.expiresAt &&
    record.expiresAt > new Date() &&
    record.attempts < MAX_OTP_ATTEMPTS
  );

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.valid.body;

  const [userWithEmail, userWithUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username } }),
  ]);

  if (userWithEmail?.verified) {
    return res.status(409).json({
      success: false,
      message: "An account with this email or username already exists",
    });
  }
  if (userWithUsername && userWithUsername.email !== email) {
    return res.status(409).json({
      success: false,
      message: "An account with this email or username already exists",
    });
  }

  if (userWithEmail) {
    const pendingOtp = await prisma.otp.findUnique({ where: { email } });
    if (hasActiveOtp(pendingOtp)) {
      return res.status(409).json({
        success: false,
        message:
          "A verification code was already sent. Check your email or try again in 10 minutes",
      });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (userWithEmail) {
    await prisma.user.update({
      where: { id: userWithEmail.id },
      data: { username, password: hashedPassword, verified: false },
    });
  } else {
    await prisma.user.create({
      data: { username, email, password: hashedPassword, verified: false },
    });
  }

  const otp = crypto.randomInt(100000, 1000000);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.otp.upsert({
    where: { email },
    update: { otp, attempts: 0, expiresAt, createdAt: new Date() },
    create: { email, otp, attempts: 0, expiresAt },
  });

  try {
    await sendOtpEmail(email, otp);
  } catch (error) {
    console.error("Failed to send verification email", error.message);
    await prisma.otp.deleteMany({ where: { email } });
    return res.status(502).json({
      success: false,
      message: "Could not send the verification email. Please try again later",
    });
  }

  return res.status(201).json({
    success: true,
    message: "Account created. Check your email for the verification code",
  });
});

const optFinalization = asyncHandler(async (req, res) => {
  const { email, otp } = req.valid.body;

  const now = new Date();
  const { count } = await prisma.otp.updateMany({
    where: { email, expiresAt: { gt: now }, attempts: { lt: MAX_OTP_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });

  if (count === 0) {
    await prisma.otp.deleteMany({ where: { email } });
    return res.status(400).json({
      success: false,
      message: "Code expired or too many attempts. Register again to get a new code",
    });
  }

  const record = await prisma.otp.findUnique({ where: { email } });
  const expected = Buffer.from(String(record?.otp ?? ""));
  const received = Buffer.from(otp);
  const matches = expected.length === received.length && crypto.timingSafeEqual(expected, received);

  if (!matches) {
    return res.status(400).json({ success: false, message: "Invalid or expired code" });
  }

  await prisma.user.updateMany({
    where: { email, verified: false },
    data: { verified: true },
  });
  await prisma.otp.deleteMany({ where: { email } });

  return res.status(200).json({ success: true, message: "Email verified successfully" });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.valid.body;

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = await bcrypt.compare(password, user?.password || DUMMY_HASH);

  if (!user || !passwordMatches) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }
  if (!user.verified) {
    return res.status(403).json({
      success: false,
      message: "Verify your email before logging in",
    });
  }

  const tokenData = {
    userId: user.id,
    username: user.username,
    fullname: user.fullname,
    email: user.email,
    avatar: user.avatar,
    gender: user.gender,
  };
  const token = jwt.sign(tokenData, jwtSecret, {
    expiresIn: jwtExpiresIn,
    algorithm: "HS256",
  });

  const { password: _password, ...userInfo } = user;

  return res
    .status(200)
    .cookie("token", token, { ...sessionCookieOptions, maxAge: sessionMaxAgeMs })
    .json({ success: true, message: "Login successful", userInfo });
});

const logout = (req, res) => {
  res.clearCookie("token", sessionCookieOptions);
  return res.status(200).json({ success: true, message: "Logout successful" });
};

module.exports = { register, login, logout, optFinalization };
