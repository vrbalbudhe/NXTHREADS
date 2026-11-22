/**
 * Starts the real backend (app.js) in a child process for end-to-end tests.
 *
 * - Uses the DATABASE_URL from backend/.env, so run it against a dev/test database.
 * - SMTP is blanked, so emails (and their codes) are printed to the child's stdout,
 *   where `lastCode()` reads them.
 * - Redis is off, so rate limits and caches start empty on every run.
 */
const { spawn } = require("node:child_process");
const path = require("node:path");

const BACKEND_DIR = path.resolve(__dirname, "..", "..");

const startServer = async ({ env = {} } = {}) => {
  const port = 20000 + Math.floor(Math.random() * 20000);
  const child = spawn(process.execPath, ["app.js"], {
    cwd: BACKEND_DIR,
    env: {
      ...process.env,
      PORT: String(port),
      SMTP_USER: "",
      SMTP_PASS: "",
      REDIS_URL: "",
      NODE_ENV: "test",
      CODE_RESEND_COOLDOWN_MS: "1500",
      ...env,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server did not start:\n${output}`)), 30000);
    const check = setInterval(() => {
      if (output.includes(`Server running on port ${port}`)) {
        clearInterval(check);
        clearTimeout(timer);
        resolve();
      }
    }, 50);
    child.on("exit", (code) => {
      clearInterval(check);
      clearTimeout(timer);
      reject(new Error(`Server exited with ${code}:\n${output}`));
    });
  });

  const base = `http://127.0.0.1:${port}/api`;

  /** Small fetch wrapper with its own cookie jar (one per simulated browser). */
  const client = () => {
    let cookie = "";
    const call = async (method, url, body) => {
      const res = await fetch(base + url, {
        method,
        headers: { "content-type": "application/json", ...(cookie && { cookie }) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const set = res.headers.get("set-cookie");
      if (set) {
        const token = set.split(";")[0];
        cookie = token.endsWith("=") ? "" : token;
      }
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      return { status: res.status, data };
    };
    return {
      call,
      get: (url) => call("GET", url),
      post: (url, body) => call("POST", url, body),
      put: (url, body) => call("PUT", url, body),
      del: (url, body) => call("DELETE", url, body),
      hasSession: () => Boolean(cookie),
    };
  };

  /** Latest email printed for an address: { subject, code } (code is null if none). */
  const lastMail = async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const lines = output.split(/\r?\n/);
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      if (lines[i].includes(`to=${email}`)) {
        const code = lines.slice(i + 1, i + 6).find((line) => /^\d{6}$/.test(line)) || null;
        return { subject: lines[i], code };
      }
    }
    return { subject: null, code: null };
  };
  const lastCode = async (email) => (await lastMail(email)).code;

  const stop = () =>
    new Promise((resolve) => {
      if (child.exitCode !== null) return resolve();
      child.removeAllListeners("exit");
      child.once("exit", () => resolve());
      child.kill();
    });

  return { base, client, lastMail, lastCode, stop };
};

const uniqueEmail = (label) =>
  `nx-test-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

/** Runs the full email-OTP sign-up and returns a signed-in client. */
const registerUser = async (server, { label = "user", password = "Password-123" } = {}) => {
  const email = uniqueEmail(label);
  const username = `t_${label}_${Date.now().toString(36)}`.slice(0, 30);
  const api = server.client();
  await api.post("/auth/register/start", { email });
  const code = await server.lastCode(email);
  const verified = await api.post("/auth/register/verify", { email, code });
  const done = await api.post("/auth/register/complete", {
    signupToken: verified.data.signupToken,
    username,
    password,
  });
  if (done.status !== 201) throw new Error(`Sign-up failed: ${JSON.stringify(done.data)}`);
  return { api, email, username, password, id: done.data.userInfo.id };
};

module.exports = { startServer, registerUser, uniqueEmail };
