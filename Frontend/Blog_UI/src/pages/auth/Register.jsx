import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "react-toastify";
import { api, errorMessage } from "../../lib/api";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { ErrorNote, Notice, Spinner } from "../../Components/ui/Feedback";
import AuthLayout, { PasswordField } from "./AuthLayout";

const USERNAME_PATTERN = /^[A-Za-z0-9_.]{3,30}$/;

function strengthOf(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

const STRENGTH = [
  { label: "Too short", color: "bg-rose-500" },
  { label: "Weak", color: "bg-rose-500" },
  { label: "Fair", color: "bg-amber-500" },
  { label: "Good", color: "bg-emerald-500" },
  { label: "Strong", color: "bg-emerald-600" },
];

function OtpInput({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] || "");

  const update = (index, char) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join("").slice(0, 6));
  };

  return (
    <div
      className="flex justify-between gap-2"
      onPaste={(event) => {
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted) {
          event.preventDefault();
          onChange(pasted);
          refs.current[Math.min(pasted.length, 5)]?.focus();
        }
      }}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => (refs.current[index] = node)}
          value={digit}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => {
            const char = event.target.value.replace(/\D/g, "").slice(-1);
            update(index, char);
            if (char) refs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digits[index]) refs.current[index - 1]?.focus();
          }}
          className="input h-12 w-full text-center text-lg font-bold"
        />
      ))}
    </div>
  );
}

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("details");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  usePageTitle(step === "verify" ? "Verify email" : "Create account");

  const strength = strengthOf(form.password);
  const usernameInvalid = form.username && !USERNAME_PATTERN.test(form.username);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const register = async (event) => {
    event.preventDefault();
    if (usernameInvalid || form.password.length < 8) return;
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/register", {
        ...form,
        email: form.email.trim(),
        username: form.username.trim(),
      });
      setStep("verify");
      toast.success("Check your inbox for a 6-digit code");
    } catch (err) {
      setError(errorMessage(err, "Could not create the account"));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    if (otp.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/verify-otp", { email: form.email.trim(), otp });
      try {
        await login(form.email.trim(), form.password);
        toast.success("Welcome to NXTHREADS!");
        navigate("/settings", { replace: true });
      } catch {
        toast.success("Email verified. Please sign in.");
        navigate("/login", { replace: true, state: { email: form.email.trim() } });
      }
    } catch (err) {
      setError(errorMessage(err, "Verification failed"));
      setOtp("");
    } finally {
      setBusy(false);
    }
  };

  if (step === "verify") {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle={`We sent a 6-digit code to ${form.email}. It expires in 10 minutes.`}
        footer={
          <button
            type="button"
            onClick={() => setStep("details")}
            className="link inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Use a different email
          </button>
        }
      >
        <form onSubmit={verify} className="space-y-4">
          <ErrorNote message={error} />
          <OtpInput value={otp} onChange={setOtp} disabled={busy} />
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={busy || otp.length !== 6}
          >
            {busy ? <Spinner /> : <MailCheck className="h-4 w-4" />} Verify and continue
          </button>
          <Notice icon={MailCheck} tone="brand">
            Can&apos;t find it? Check spam. After 10 minutes you can register again to get a new
            code.
          </Notice>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join a community of writers and readers."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="link">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={register} className="space-y-4">
        <ErrorNote message={error} />
        <div>
          <label htmlFor="username" className="label">
            Username
          </label>
          <input
            id="username"
            className="input h-11"
            autoComplete="username"
            value={form.username}
            onChange={set("username")}
            placeholder="jane.doe"
            maxLength={30}
            required
          />
          {usernameInvalid && (
            <p className="mt-1 text-[11px] text-rose-600">
              3–30 characters: letters, numbers, dots or underscores
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input h-11"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <PasswordField
            id="password"
            value={form.password}
            onChange={set("password")}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            show={show}
            onToggle={() => setShow((value) => !value)}
          />
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className={`h-1 flex-1 rounded-full ${strength >= level ? STRENGTH[strength].color : "bg-slate-200 dark:bg-white/10"}`}
                  />
                ))}
              </div>
              <span className="text-[11px] muted">
                {form.password.length < 8 ? STRENGTH[0].label : STRENGTH[strength].label}
              </span>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={busy || usernameInvalid || form.password.length < 8}
        >
          {busy && <Spinner />} Create account
        </button>
        <p className="text-center text-[11px] muted">
          By joining you agree to our{" "}
          <Link to="/privacy" className="link">
            privacy policy
          </Link>
          .
        </p>
      </form>
    </AuthLayout>
  );
}
