const nodemailer = require("nodemailer");
const { smtp, isProduction } = require("../Config/env");

const configured = Boolean(smtp.user && smtp.pass);

const transporter = configured
  ? nodemailer.createTransport({
      service: smtp.service,
      auth: { user: smtp.user, pass: smtp.pass },
    })
  : null;

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );

const layout = ({ heading, intro, code, outro }) => `
<div style="font-family:Inter,Segoe UI,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
  <p style="font-size:13px;font-weight:700;letter-spacing:.08em;color:#2563eb;margin:0 0 16px">NXTHREADS</p>
  <h1 style="font-size:20px;margin:0 0 8px">${escapeHtml(heading)}</h1>
  <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 20px">${escapeHtml(intro)}</p>
  ${
    code
      ? `<p style="font-size:30px;font-weight:700;letter-spacing:.3em;background:#f1f5f9;border-radius:12px;padding:16px;text-align:center;margin:0 0 20px">${escapeHtml(code)}</p>`
      : ""
  }
  <p style="font-size:12px;line-height:1.6;color:#64748b;margin:0">${escapeHtml(outro)}</p>
</div>`;

const sendMail = async ({ to, subject, heading, intro, code, outro }) => {
  const text = [intro, code, outro].filter(Boolean).join("\n\n");
  if (!transporter) {
    if (isProduction) {
      throw new Error("SMTP is not configured");
    }
    process.stdout.write(`[dev mail] to=${to} subject="${subject}"\n${text}\n`);
    return;
  }
  await transporter.sendMail({
    from: smtp.from,
    to,
    subject,
    text,
    html: layout({ heading, intro, code, outro }),
  });
};

const IGNORE =
  "If you didn't request this, you can ignore this email. Never share this code with anyone.";

const templates = {
  REGISTER: (code) => ({
    subject: "Your NXTHREADS sign-up code",
    heading: "Confirm your email",
    intro: "Use this code to finish creating your NXTHREADS account. It expires in 10 minutes.",
    code,
    outro: IGNORE,
  }),
  RESET_PASSWORD: (code) => ({
    subject: "Reset your NXTHREADS password",
    heading: "Reset your password",
    intro: "Use this code to choose a new password. It expires in 10 minutes.",
    code,
    outro: IGNORE,
  }),
  MFA_LOGIN: (code) => ({
    subject: "Your NXTHREADS sign-in code",
    heading: "Two-step verification",
    intro: "Someone signed in with your password. Enter this code to finish signing in.",
    code,
    outro: "If this wasn't you, reset your password right away.",
  }),
  MFA_SETUP: (code) => ({
    subject: "Turn on two-step verification",
    heading: "Confirm two-step verification",
    intro: "Enter this code in Settings to turn on email two-step verification.",
    code,
    outro: IGNORE,
  }),
  ACCOUNT_EXISTS: () => ({
    subject: "You already have a NXTHREADS account",
    heading: "You already have an account",
    intro:
      "Someone tried to sign up with this email address, but an account already exists. Sign in instead, or use “Forgot password” if you can't remember it.",
    outro: "If this wasn't you, no action is needed.",
  }),
};

const sendTemplate = (to, name, code) => sendMail({ to, ...templates[name](code) });

module.exports = { sendMail, sendTemplate };
