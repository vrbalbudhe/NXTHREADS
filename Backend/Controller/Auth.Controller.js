require("dotenv").config();
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../lib/prisma");
const jwt = require("jsonwebtoken");

// Utility function to send OTP email
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "privatebriefs7@gmail.com",
      pass: "rwws hhyq khav zevm",
    },
  });

  const mailOptions = {
    from: "privatebriefs7@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

// Register function
const register = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are mandatory",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const NewUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verified: false,
      },
    });

    if (NewUser) {
      const otp = crypto.randomInt(100000, 999999);
      await sendOtpEmail(email, otp);

      await prisma.otp.upsert({
        where: { email },
        update: { otp },
        create: {
          email,
          otp,
        },
      });

      return res.status(201).json({
        message: "User Successfully Created. Please check your email for OTP.",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(501).json({
      message: "Register Failed",
      success: false,
    });
  }
});

// OTP finalization function
const optFinalization = asyncHandler(async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        message: "All fields are mandatory",
        success: false,
      });
    }

    const otps = parseInt(otp, 10);
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email,
        otp: otps,
      },
    });

    if (otpRecord) {
      await prisma.user.update({
        where: { email },
        data: { verified: true },
      });

      // Delete OTP record after successful verification
      await prisma.otp.deleteMany({ where: { email } });

      return res.status(200).json({
        message: "OTP Verified Successfully",
        success: true,
      });
    } else {
      // Delete user if OTP is invalid or expired
      await prisma.user.delete({ where: { email } });
      await prisma.otp.deleteMany({ where: { email } });

      return res.status(400).json({
        message: "Invalid or expired OTP",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(501).json({
      message: "Verification Failed",
      success: false,
    });
  }
});

// Login function
const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are mandatory",
        success: false,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "User Does Not Exist",
        success: false,
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        message: "Password Incorrect",
        success: false,
      });
    }

    // Generating the Token Data
    const tokenData = {
      userId: user.id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      avatar: user.avatar,
      gender: user.gender,
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // Cookie options
    const CookieOptions = {
      httpOnly: true,
      maxAge: 1000 * 60 * 105, // 105 minutes
      sameSite: "Strict", // Corrected to "sameSite"
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    };

    const { password: userPassword, ...userInfo } = user;
    return res.status(200).cookie("token", token, CookieOptions).json({
      message: "Login Successful",
      success: true,
      userInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({
      message: "Login Failed",
      success: false,
    });
  }
});

// Logout function
const logout = asyncHandler(async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      message: "Logout Successful",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({
      message: "Logout Failed",
      success: false,
    });
  }
});

module.exports = { register, login, logout, optFinalization };
