const { test } = require("node:test");
const assert = require("node:assert/strict");
const mfa = require("../../lib/mfa");

// RFC 6238 / RFC 4226 test secret: ASCII "12345678901234567890".
const RFC_SECRET = mfa.base32Encode(Buffer.from("12345678901234567890"));

test("HOTP matches RFC 4226 test vectors", () => {
  const expected = ["755224", "287082", "359152", "969429", "338314"];
  expected.forEach((code, counter) => assert.equal(mfa.hotp(RFC_SECRET, counter), code));
});

test("TOTP matches RFC 6238 vectors (6-digit form)", () => {
  // T = 59s -> counter 1, T = 1111111109s -> counter 37037036, T = 1234567890 -> 41152263
  assert.equal(mfa.hotp(RFC_SECRET, 1), "287082");
  assert.equal(mfa.hotp(RFC_SECRET, 37037036), "081804");
  assert.equal(mfa.hotp(RFC_SECRET, 41152263), "005924");
});

test("base32 round-trips", () => {
  const bytes = Buffer.from([0, 1, 2, 250, 251, 252, 253, 254, 255, 7]);
  assert.deepEqual(mfa.base32Decode(mfa.base32Encode(bytes)), bytes);
  assert.throws(() => mfa.base32Decode("not*base32"));
});

test("generated secrets are 160-bit base32", () => {
  const secret = mfa.generateSecret();
  assert.match(secret, /^[A-Z2-7]{32}$/);
  assert.equal(mfa.base32Decode(secret).length, 20);
});

test("current TOTP code verifies once, replay is refused", async () => {
  const secret = mfa.generateSecret();
  const code = mfa.hotp(secret, Math.floor(Date.now() / 30000));
  const user = `unit-${Date.now()}`;
  assert.equal(await mfa.verifyTotp(user, secret, code), true);
  assert.equal(await mfa.verifyTotp(user, secret, code), false);
});

test("codes outside the ±1 step window are refused", () => {
  const secret = mfa.generateSecret();
  const now = Math.floor(Date.now() / 30000);
  assert.notEqual(mfa.matchTotp(secret, mfa.hotp(secret, now + 1)), null);
  assert.equal(mfa.matchTotp(secret, mfa.hotp(secret, now + 5)), null);
});

test("secrets are encrypted at rest and tamper-evident", () => {
  const secret = mfa.generateSecret();
  const stored = mfa.encryptSecret(secret);
  assert.ok(!stored.includes(secret));
  assert.notEqual(mfa.encryptSecret(secret), stored, "random IV per encryption");
  assert.equal(mfa.decryptSecret(stored), secret);
  const [version, iv, tag, data] = stored.split(".");
  const flipped = data.slice(0, -2) + (data.endsWith("A") ? "BB" : "AA");
  assert.throws(() => mfa.decryptSecret([version, iv, tag, flipped].join(".")));
});

test("recovery codes: 10 unique, single use, case and dash insensitive", () => {
  const { codes, hashes } = mfa.generateRecoveryCodes();
  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, 10);
  codes.forEach((code) => assert.match(code, /^[a-z2-9]{5}-[a-z2-9]{5}$/));
  assert.ok(
    hashes.every((hash) => !codes.includes(hash)),
    "only hashes are stored"
  );

  const remaining = mfa.useRecoveryCode(hashes, codes[3].toUpperCase().replace("-", " "));
  assert.equal(remaining.length, 9);
  assert.equal(mfa.useRecoveryCode(remaining, codes[3]), null);
  assert.equal(mfa.useRecoveryCode(hashes, "zzzzz-zzzzz"), null);
});

test("otpauth URL carries issuer and parameters", () => {
  const url = mfa.otpauthUrl("ABCDEF", "jane@example.com");
  assert.match(url, /^otpauth:\/\/totp\/NXTHREADS%3Ajane%40example\.com\?/);
  const params = new URL(url).searchParams;
  assert.equal(params.get("secret"), "ABCDEF");
  assert.equal(params.get("issuer"), "NXTHREADS");
  assert.equal(params.get("digits"), "6");
  assert.equal(params.get("period"), "30");
});
