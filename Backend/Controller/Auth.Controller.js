const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const QRCode = require("qrcode");
const prisma = require("../lib/prisma");
const { getValue, setValue, removeKeys } = require("../lib/store");
const { sendTemplate } = require("../lib/mailer");
const {
  CodeError,
  claimSendSlot,
  issueCode,
  consumeCode,
  clearCodes,
  hasActiveCode,
} = require("../lib/codes");
const mfa = require("../lib/mfa");
const {
  issueSession,
  clearSessionCookie,
  verifySessionToken,
  revokeSession,
  revokeAllSessions,
} = require("../lib/session");

const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), 10);
const SIGNUP_TICKET_TTL_MS = 30 * 60 * 1000;

const toUserInfo = (user) => {
  const {
    password: _password,
    mfaSecret: _secret,
    mfaRecoveryCodes: _codes,
    mfaMethod: _method,
    mfaEnabledAt: _enabledAt,
    ...info
  } = user;
  return info;
};

const findUserByEmail = (email) =>
  prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });

const sendCodeError = (res, error) => {
  if (error instanceof CodeError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  throw error;
};

// ---------------------------------------------------------------------------
// Registration: email -> 6-digit code -> username + password. No account row
// exists until the email is proven, so there are no unverified accounts.
// ---------------------------------------------------------------------------

const signupKey = (token) =>
  `signup:ticket:${crypto.createHash("sha256").update(token).digest("hex")}`;

const GENERIC_REGISTER_MESSAGE =
  "If this email can be used, a 6-digit code is on its way. It expires in 10 minutes";

const registerStart = asyncHandler(async (req, res) => {
  const { email } = req.valid.body;
  try {
    await claimSendSlot(email, "REGISTER");
    const existing = await findUserByEmail(email);
    if (existing?.verified) {
      await sendTemplate(existing.email, "ACCOUNT_EXISTS").catch((error) =>
        console.error(`Failed to send account-exists email: ${error.message}`)
      );
    } else {
      await issueCode(email, "REGISTER");
    }
  } catch (error) {
    return sendCodeError(res, error);
  }
  return res.status(200).json({ success: true, message: GENERIC_REGISTER_MESSAGE });
});

const registerVerify = asyncHandler(async (req, res) => {
  const { email, code } = req.valid.body;
  if (!(await consumeCode(email, "REGISTER", code))) {
    return res.status(400).json({
      success: false,
      message: "That code is wrong or has expired. Check it, or request a new one",
    });
  }
  const signupToken = crypto.randomBytes(32).toString("base64url");
  await setValue(signupKey(signupToken), email, SIGNUP_TICKET_TTL_MS);
  return res.status(200).json({ success: true, message: "Email verified", signupToken });
});

const registerComplete = asyncHandler(async (req, res) => {
  const { signupToken, username, fullname, password } = req.valid.body;
  const email = await getValue(signupKey(signupToken));
  if (!email) {
    return res.status(400).json({
      success: false,
      expired: true,
      message: "Your sign-up session expired. Verify your email again",
    });
  }

  const [userWithEmail, userWithUsername] = await Promise.all([
    findUserByEmail(email),
    prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
      select: { id: true },
    }),
  ]);
  if (userWithEmail?.verified) {
    await removeKeys(signupKey(signupToken));
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists. Sign in instead",
    });
  }
  if (userWithUsername && userWithUsername.id !== userWithEmail?.id) {
    return res.status(409).json({ success: false, message: "That username is taken" });
  }

  const data = {
    username,
    password: await bcrypt.hash(password, 10),
    verified: true,
    ...(fullname && { fullname }),
  };
  // A legacy unverified row may exist from the old flow: claim it instead of duplicating.
  const user = userWithEmail
    ? await prisma.user.update({ where: { id: userWithEmail.id }, data })
    : await prisma.user.create({ data: { ...data, email } });

  await removeKeys(signupKey(signupToken));
  await clearCodes(email, "REGISTER");
  issueSession(res, user);
  return res
    .status(201)
    .json({ success: true, message: "Account created", userInfo: toUserInfo(user) });
});

// ---------------------------------------------------------------------------
// Sign in, with a second step when MFA is on.
// ---------------------------------------------------------------------------

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.valid.body;

  const user = await findUserByEmail(email);
  const passwordMatches = await bcrypt.compare(password, user?.password || DUMMY_HASH);

  if (!user || !passwordMatches) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }
  if (!user.verified) {
    return res.status(403).json({
      success: false,
      message: "This email was never confirmed. Create your account again to finish sign-up",
    });
  }

  if (user.mfaEnabled && user.mfaMethod) {
    const mfaToken = await mfa.createChallenge(user);
    if (user.mfaMethod === "EMAIL") {
      try {
        await issueCode(user.email.toLowerCase(), "MFA_LOGIN");
      } catch (error) {
        await mfa.finishChallenge(mfaToken);
        return sendCodeError(res, error);
      }
    }
    return res.status(200).json({
      success: true,
      mfaRequired: true,
      method: user.mfaMethod,
      mfaToken,
      message:
        user.mfaMethod === "EMAIL"
          ? "Enter the code we emailed you"
          : "Enter the code from your authenticator app",
    });
  }

  issueSession(res, user);
  return res
    .status(200)
    .json({ success: true, message: "Login successful", userInfo: toUserInfo(user) });
});

const mfaChallenge = asyncHandler(async (req, res) => {
  const { mfaToken, code } = req.valid.body;
  const challenge = await mfa.readChallenge(mfaToken);
  const expired = () =>
    res.status(401).json({
      success: false,
      expired: true,
      message: "Your sign-in attempt expired. Sign in again",
    });

  if (!challenge) return expired();
  if (!(await mfa.countChallengeAttempt(mfaToken))) return expired();

  const user = await prisma.user.findUnique({ where: { id: challenge.userId } });
  if (!user || !user.mfaEnabled) {
    await mfa.finishChallenge(mfaToken);
    return expired();
  }

  let accepted = false;
  let remainingRecoveryCodes = null;
  if (/^\d{6}$/.test(code)) {
    if (user.mfaMethod === "TOTP" && user.mfaSecret) {
      accepted = await mfa.verifyTotp(user.id, mfa.decryptSecret(user.mfaSecret), code);
    } else if (user.mfaMethod === "EMAIL") {
      accepted = await consumeCode(user.email.toLowerCase(), "MFA_LOGIN", code);
    }
  } else {
    remainingRecoveryCodes = mfa.useRecoveryCode(user.mfaRecoveryCodes, code);
    accepted = remainingRecoveryCodes !== null;
  }

  if (!accepted) {
    return res.status(400).json({ success: false, message: "That code didn't work. Try again" });
  }

  if (remainingRecoveryCodes) {
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaRecoveryCodes: remainingRecoveryCodes },
    });
  }
  await mfa.finishChallenge(mfaToken);
  issueSession(res, user);
  return res.status(200).json({
    success: true,
    message: "Login successful",
    userInfo: toUserInfo(user),
    ...(remainingRecoveryCodes && { recoveryCodesLeft: remainingRecoveryCodes.length }),
  });
});

const mfaResend = asyncHandler(async (req, res) => {
  const challenge = await mfa.readChallenge(req.valid.body.mfaToken);
  if (!challenge) {
    return res
      .status(401)
      .json({ success: false, expired: true, message: "Your sign-in attempt expired" });
  }
  if (challenge.method !== "EMAIL") {
    return res.status(400).json({ success: false, message: "Use your authenticator app" });
  }
  const email = challenge.email.toLowerCase();
  try {
    await claimSendSlot(email, "MFA_LOGIN");
    await issueCode(email, "MFA_LOGIN");
  } catch (error) {
    return sendCodeError(res, error);
  }
  return res.status(200).json({ success: true, message: "A new code is on its way" });
});

const logout = asyncHandler(async (req, res) => {
  const session = await verifySessionToken(req.cookies?.token);
  if (session) await revokeSession(session);
  clearSessionCookie(res);
  return res.status(200).json({ success: true, message: "Logout successful" });
});

// ---------------------------------------------------------------------------
// Forgot password: emailed 6-digit code, then a new password. Signs out
// every session; MFA stays on, so the user must sign in again normally.
// ---------------------------------------------------------------------------

const GENERIC_FORGOT_MESSAGE =
  "If an account uses this email, a 6-digit reset code is on its way. It expires in 10 minutes";

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.valid.body;
  try {
    await claimSendSlot(email, "RESET_PASSWORD");
    const user = await findUserByEmail(email);
    if (user?.verified) {
      await issueCode(email, "RESET_PASSWORD");
    }
  } catch (error) {
    if (error instanceof CodeError && error.status === 502) {
      // Don't reveal whether an account exists through a delivery failure.
      return res.status(200).json({ success: true, message: GENERIC_FORGOT_MESSAGE });
    }
    return sendCodeError(res, error);
  }
  return res.status(200).json({ success: true, message: GENERIC_FORGOT_MESSAGE });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, password } = req.valid.body;
  const invalid = () =>
    res.status(400).json({
      success: false,
      message: "That code is wrong or has expired. Request a new one",
    });

  if (!(await consumeCode(email, "RESET_PASSWORD", code))) return invalid();
  const user = await findUserByEmail(email);
  if (!user?.verified) return invalid();

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(password, 10) },
  });
  await revokeAllSessions(user.id);
  clearSessionCookie(res);
  return res
    .status(200)
    .json({ success: true, message: "Password updated. Sign in with your new password" });
});

// ---------------------------------------------------------------------------
// MFA management (signed-in user)
// ---------------------------------------------------------------------------

const loadSelf = (req) => prisma.user.findUnique({ where: { id: req.userId } });

const mfaStatus = (user) => ({
  enabled: Boolean(user.mfaEnabled),
  method: user.mfaEnabled ? user.mfaMethod : null,
  enabledAt: user.mfaEnabled ? user.mfaEnabledAt : null,
  recoveryCodesLeft: user.mfaEnabled ? (user.mfaRecoveryCodes || []).length : 0,
});

const getMfa = asyncHandler(async (req, res) => {
  const user = await loadSelf(req);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return res.status(200).json({ success: true, mfa: mfaStatus(user) });
});

const alreadyEnabled = (res) =>
  res
    .status(409)
    .json({ success: false, message: "Two-step verification is already on. Turn it off first" });

const enableMfa = async (req, res, user, method, secret) => {
  const { codes, hashes } = mfa.generateRecoveryCodes();
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaEnabled: true,
      mfaMethod: method,
      mfaSecret: secret ? mfa.encryptSecret(secret) : null,
      mfaRecoveryCodes: hashes,
      mfaEnabledAt: new Date(),
    },
  });
  // Sign out every other device; keep this one.
  await revokeAllSessions(user.id);
  issueSession(res, updated);
  return res.status(200).json({
    success: true,
    message: "Two-step verification is on",
    mfa: mfaStatus(updated),
    recoveryCodes: codes,
  });
};

const totpSetup = asyncHandler(async (req, res) => {
  const user = await loadSelf(req);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (user.mfaEnabled) return alreadyEnabled(res);

  const secret = mfa.generateSecret();
  await mfa.savePendingSecret(user.id, secret);
  const url = mfa.otpauthUrl(secret, user.email);
  const qrCode = await QRCode.toDataURL(url, { margin: 1, width: 220 });
  return res.status(200).json({ success: true, secret, otpauthUrl: url, qrCode });
});

const totpEnable = asyncHandler(async (req, res) => {
  const user = await loadSelf(req);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (user.mfaEnabled) return alreadyEnabled(res);

  const secret = await mfa.readPendingSecret(user.id);
  if (!secret) {
    return res
      .status(400)
      .json({ success: false, message: "Setup expired. Start again to get a new QR code" });
  }
  if (!(await mfa.verifyTotp(user.id, secret, req.valid.body.code))) {
    return res.status(400).json({
      success: false,
      message: "That code didn't match. Check your phone's clock and try the newest code",
    });
  }
  await mfa.clearPendingSecret(user.id);
  return enableMfa(req, res, user, "TOTP", secret);
});

const emailSetup = asyncHandler(async (req, res) => {
  const user = await loadSelf(req);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (user.mfaEnabled) return alreadyEnabled(res);
  const email = user.email.toLowerCase();
  try {
    await claimSendSlot(email, "MFA_SETUP");
    await issueCode(email, "MFA_SETUP");
  } catch (error) {
    // Reopened within the resend window: the code already sent still works, so let them use it.
    if (
      error instanceof CodeError &&
      error.status === 429 &&
      (await hasActiveCode(email, "MFA_SETUP"))
    ) {
      return res.status(200).json({
        success: true,
        alreadySent: true,
        message: `We already emailed a code to ${user.email}. It is still valid`,
      });
    }
    return sendCodeError(res, error);
  }
  return res
    .status(200)
    .json({ success: true, message: `We emailed a 6-digit code to ${user.email}` });
});

const emailEnable = asyncHandler(async (req, res) => {
  const user = await loadSelf(req);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (user.mfaEnabled) return alreadyEnabled(res);
  if (!(await consumeCode(user.email.toLowerCase(), "MFA_SETUP", req.valid.body.code))) {
    return res
      .status(400)
      .json({ success: false, message: "That code is wrong or has expired. Send a new one" });
  }
  return enableMfa(req, res, user, "EMAIL", null);
});

const checkPassword = async (res, user, password) => {
  if (await bcrypt.compare(password, user.password)) return true;
  res.status(401).json({ success: false, message: "Password is incorrect" });
  return false;
};

const disableMfa = asyncHandler(async (req, res) => {
  const user = await loadSelf(req);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (!(await checkPassword(res, user, req.valid.body.password))) return undefined;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaEnabled: false,
      mfaMethod: null,
      mfaSecret: null,
      mfaRecoveryCodes: [],
      mfaEnabledAt: null,
    },
  });
  await clearCodes(user.email.toLowerCase(), "MFA_LOGIN");
  return res
    .status(200)
    .json({ success: true, message: "Two-step verification is off", mfa: mfaStatus(updated) });
});

const regenerateRecoveryCodes = asyncHandler(async (req, res) => {
  const user = await loadSelf(req);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (!user.mfaEnabled) {
    return res.status(400).json({ success: false, message: "Turn on two-step verification first" });
  }
  if (!(await checkPassword(res, user, req.valid.body.password))) return undefined;

  const { codes, hashes } = mfa.generateRecoveryCodes();
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { mfaRecoveryCodes: hashes },
  });
  return res.status(200).json({
    success: true,
    message: "New recovery codes created. The old ones no longer work",
    mfa: mfaStatus(updated),
    recoveryCodes: codes,
  });
});

module.exports = {
  registerStart,
  registerVerify,
  registerComplete,
  login,
  mfaChallenge,
  mfaResend,
  logout,
  forgotPassword,
  resetPassword,
  getMfa,
  totpSetup,
  totpEnable,
  emailSetup,
  emailEnable,
  disableMfa,
  regenerateRecoveryCodes,
};
