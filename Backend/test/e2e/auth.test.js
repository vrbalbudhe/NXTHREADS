/**
 * Email-OTP sign-up, forgot password and two-step verification, end to end against the
 * real server and database. Creates one throwaway account and deletes it at the end.
 */
const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { startServer, uniqueEmail } = require("../helpers/server");
const mfa = require("../../lib/mfa");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const wrongCode = (code) => (code === "000000" ? "111111" : "000000");

describe("auth", { concurrency: false }, () => {
  let server;
  let api;
  let userId;
  const email = uniqueEmail("auth");
  const username = `t_auth_${Date.now().toString(36)}`;
  let password = "Password-123";

  before(async () => {
    server = await startServer();
    api = server.client();
  });

  after(async () => {
    if (userId) {
      // Reuse the signed-in session: another login could hit the 10-per-15-minutes limit.
      let removed = await api.del(`/user/${userId}`, { password });
      if (removed.status === 401) {
        await api.post("/auth/login", { email, password });
        removed = await api.del(`/user/${userId}`, { password });
      }
      if (removed.status !== 200) {
        console.error(`Could not delete test account ${email}: ${JSON.stringify(removed.data)}`);
      }
    }
    await server?.stop();
  });

  describe("sign-up with email OTP", { concurrency: false }, () => {
    let code;
    let signupToken;

    test("start sends a code (email is normalised)", async () => {
      const r = await api.post("/auth/register/start", { email: email.toUpperCase() });
      assert.equal(r.status, 200);
      code = await server.lastCode(email);
      assert.match(code, /^\d{6}$/);
    });

    test("resending inside the cooldown is refused", async () => {
      const r = await api.post("/auth/register/start", { email });
      assert.equal(r.status, 429);
    });

    test("wrong code is refused", async () => {
      const r = await api.post("/auth/register/verify", { email, code: wrongCode(code) });
      assert.equal(r.status, 400);
    });

    test("a bogus sign-up ticket is reported as expired", async () => {
      const r = await api.post("/auth/register/complete", {
        signupToken: "x".repeat(40),
        username,
        password,
      });
      assert.equal(r.status, 400);
      assert.equal(r.data.expired, true);
    });

    test("right code returns a sign-up ticket, and works only once", async () => {
      const r = await api.post("/auth/register/verify", { email, code });
      assert.equal(r.status, 200);
      signupToken = r.data.signupToken;
      assert.ok(signupToken);
      const again = await api.post("/auth/register/verify", { email, code });
      assert.equal(again.status, 400);
    });

    test("complete creates a verified account and signs in", async () => {
      const r = await api.post("/auth/register/complete", {
        signupToken,
        username,
        fullname: "Test User",
        password,
      });
      assert.equal(r.status, 201, JSON.stringify(r.data));
      userId = r.data.userInfo.id;
      assert.ok(api.hasSession());
      for (const secret of ["password", "mfaSecret", "mfaRecoveryCodes"]) {
        assert.ok(!(secret in r.data.userInfo), `${secret} must not be returned`);
      }
      const me = await api.get("/auth/isLogin");
      assert.equal(me.status, 200);
      assert.equal(me.data.payload.email, email);
    });

    test("the ticket cannot be reused", async () => {
      const r = await api.post("/auth/register/complete", {
        signupToken,
        username: `${username}x`,
        password,
      });
      assert.equal(r.status, 400);
    });

    test("an existing email gets a reminder instead of a code, same response", async () => {
      await sleep(1600); // test cooldown is 1.5s
      const r = await server.client().post("/auth/register/start", { email });
      assert.equal(r.status, 200);
      const mail = await server.lastMail(email);
      assert.match(mail.subject, /already have/);
      assert.equal(mail.code, null);
    });

    test("old endpoints are gone", async () => {
      const r = await api.post("/auth/register", { email, username, password });
      assert.equal(r.status, 404);
    });
  });

  describe("forgot password", { concurrency: false }, () => {
    let code;

    test("unknown and known emails get the same response", async () => {
      await api.post("/auth/logout");
      const unknown = await api.post("/auth/password/forgot", { email: `nobody-${email}` });
      const known = await api.post("/auth/password/forgot", { email });
      assert.equal(unknown.status, 200);
      assert.equal(known.status, 200);
      assert.equal(unknown.data.message, known.data.message);
      code = await server.lastCode(email);
      assert.match(code, /^\d{6}$/);
    });

    test("wrong code is refused", async () => {
      const r = await api.post("/auth/password/reset", {
        email,
        code: wrongCode(code),
        password: "NewPassword-456",
      });
      assert.equal(r.status, 400);
    });

    test("reset changes the password", async () => {
      const r = await api.post("/auth/password/reset", {
        email,
        code,
        password: "NewPassword-456",
      });
      assert.equal(r.status, 200);
      const old = await api.post("/auth/login", { email, password });
      assert.equal(old.status, 401);
      password = "NewPassword-456";
      const fresh = await api.post("/auth/login", { email: email.toUpperCase(), password });
      assert.equal(fresh.status, 200, "new password works, email is case-insensitive");
    });
  });

  describe("two-step verification", { concurrency: false }, () => {
    let secret;
    let counter;
    let recoveryCodes;

    const loginChallenge = async () => {
      const r = await api.post("/auth/login", { email, password });
      assert.equal(r.status, 200);
      assert.equal(r.data.mfaRequired, true);
      return r.data;
    };

    test("starts off", async () => {
      const r = await api.get("/auth/mfa");
      assert.equal(r.data.mfa.enabled, false);
    });

    test("authenticator setup returns a QR code and key", async () => {
      const r = await api.post("/auth/mfa/totp/setup");
      assert.equal(r.status, 200);
      assert.match(r.data.qrCode, /^data:image\/png/);
      assert.match(r.data.otpauthUrl, /^otpauth:\/\/totp\//);
      secret = r.data.secret;
    });

    test("enabling needs a correct code and returns 10 recovery codes", async () => {
      counter = Math.floor(Date.now() / 30000);
      const bad = await api.post("/auth/mfa/totp/enable", {
        code: wrongCode(mfa.hotp(secret, counter)),
      });
      assert.equal(bad.status, 400);
      const r = await api.post("/auth/mfa/totp/enable", { code: mfa.hotp(secret, counter) });
      assert.equal(r.status, 200, JSON.stringify(r.data));
      recoveryCodes = r.data.recoveryCodes;
      assert.equal(recoveryCodes.length, 10);
      assert.equal((await api.get("/auth/isLogin")).status, 200, "this session survives");
    });

    test("sign-in asks for a code instead of creating a session", async () => {
      await api.post("/auth/logout");
      const challenge = await loginChallenge();
      assert.equal(challenge.method, "TOTP");
      assert.ok(!api.hasSession());

      const replay = await api.post("/auth/mfa/challenge", {
        mfaToken: challenge.mfaToken,
        code: mfa.hotp(secret, counter),
      });
      assert.equal(replay.status, 400, "a code already used is refused");

      const ok = await api.post("/auth/mfa/challenge", {
        mfaToken: challenge.mfaToken,
        code: mfa.hotp(secret, counter + 1),
      });
      assert.equal(ok.status, 200);
      assert.ok(api.hasSession());

      const reuse = await api.post("/auth/mfa/challenge", {
        mfaToken: challenge.mfaToken,
        code: mfa.hotp(secret, counter + 1),
      });
      assert.equal(reuse.status, 401, "challenge is single use");
    });

    test("recovery codes work once each", async () => {
      await api.post("/auth/logout");
      let challenge = await loginChallenge();
      const r = await api.post("/auth/mfa/challenge", {
        mfaToken: challenge.mfaToken,
        code: recoveryCodes[0].toUpperCase(),
      });
      assert.equal(r.status, 200);
      assert.equal(r.data.recoveryCodesLeft, 9);

      await api.post("/auth/logout");
      challenge = await loginChallenge();
      const again = await api.post("/auth/mfa/challenge", {
        mfaToken: challenge.mfaToken,
        code: recoveryCodes[0],
      });
      assert.equal(again.status, 400);
    });

    test("five wrong codes end the sign-in attempt", async () => {
      const challenge = await loginChallenge();
      for (let i = 0; i < 5; i += 1) {
        await api.post("/auth/mfa/challenge", { mfaToken: challenge.mfaToken, code: "999999" });
      }
      const r = await api.post("/auth/mfa/challenge", {
        mfaToken: challenge.mfaToken,
        code: recoveryCodes[1],
      });
      assert.equal(r.status, 401);
      assert.equal(r.data.expired, true);
    });

    test("new recovery codes need the password", async () => {
      const challenge = await loginChallenge();
      await api.post("/auth/mfa/challenge", {
        mfaToken: challenge.mfaToken,
        code: recoveryCodes[2],
      });
      const bad = await api.post("/auth/mfa/recovery-codes", { password: "wrong" });
      assert.equal(bad.status, 401);
      const r = await api.post("/auth/mfa/recovery-codes", { password });
      assert.equal(r.status, 200);
      assert.equal(r.data.mfa.recoveryCodesLeft, 10);
    });

    test("turning off needs the password", async () => {
      const r = await api.post("/auth/mfa/disable", { password });
      assert.equal(r.status, 200);
      assert.equal(r.data.mfa.enabled, false);
    });

    test("email codes: reopening setup inside the cooldown keeps the sent code usable", async () => {
      const first = await api.post("/auth/mfa/email/setup");
      assert.equal(first.status, 200);
      const code = await server.lastCode(email);

      const reopened = await api.post("/auth/mfa/email/setup");
      assert.equal(reopened.status, 200, JSON.stringify(reopened.data));
      assert.equal(reopened.data.alreadySent, true);

      const r = await api.post("/auth/mfa/email/enable", { code });
      assert.equal(r.status, 200);
      assert.equal(r.data.mfa.method, "EMAIL");
    });

    test("email codes: sign-in sends a code that completes it", async () => {
      await api.post("/auth/logout");
      const challenge = await loginChallenge();
      assert.equal(challenge.method, "EMAIL");
      const code = await server.lastCode(email);
      const r = await api.post("/auth/mfa/challenge", { mfaToken: challenge.mfaToken, code });
      assert.equal(r.status, 200);
      assert.ok(api.hasSession());
      const off = await api.post("/auth/mfa/disable", { password });
      assert.equal(off.status, 200);
    });
  });
});
