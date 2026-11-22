import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import { api, errorMessage } from "../../lib/api";
import { usePageTitle } from "../../hooks/usePageTitle";
import { ErrorNote, Spinner } from "../../Components/ui/Feedback";
import OtpInput from "../../Components/ui/OtpInput";
import AuthLayout, { AuthForm } from "./AuthLayout";
import { FieldHint, MIN_PASSWORD, PasswordField, PasswordStrength, ResendButton } from "./fields";

const backToSignIn = (
  <Link to="/login" className="link inline-flex items-center gap-1">
    <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
  </Link>
);

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  usePageTitle(step === "email" ? "Forgot password" : "Reset password");

  const requestCode = () => api.post("/auth/password/forgot", { email: email.trim() });

  const start = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await requestCode();
      setStep("reset");
      toast.success("If that email has an account, a code is on its way");
    } catch (err) {
      setError(errorMessage(err, "Could not send the reset code"));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await requestCode();
      toast.success("A new code is on its way");
      return true;
    } catch (err) {
      toast.error(errorMessage(err, "Could not resend the code"));
      return false;
    }
  };

  const tooShort = password.length > 0 && password.length < MIN_PASSWORD;
  const mismatch = confirm && password !== confirm;
  const ready = code.length === 6 && password.length >= MIN_PASSWORD && password === confirm;

  const reset = async (event) => {
    event.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/password/reset", { email: email.trim(), code, password });
      toast.success("Password updated. Sign in with your new password");
      navigate("/login", { replace: true, state: { email: email.trim() } });
    } catch (err) {
      setError(errorMessage(err, "Could not reset your password"));
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  if (step === "reset") {
    return (
      <AuthLayout
        step={{ current: 2, total: 2 }}
        icon={<KeyRound className="h-5 w-5" />}
        title="Choose a new password"
        subtitle={`Enter the 6-digit code sent to ${email.trim()} and pick a new password.`}
        footer={
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep("email");
            }}
            className="link inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Use a different email
          </button>
        }
      >
        <AuthForm onSubmit={reset}>
          <ErrorNote message={error} />
          <div>
            <span className="label">Reset code</span>
            <OtpInput value={code} onChange={setCode} disabled={busy} />
            <div className="mt-2 flex justify-end text-[12px]">
              <ResendButton onResend={resend} />
            </div>
          </div>
          <div>
            <label htmlFor="new-password" className="label">
              New password
            </label>
            <PasswordField
              id="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder={`At least ${MIN_PASSWORD} characters`}
              show={show}
              onToggle={() => setShow((value) => !value)}
            />
            <PasswordStrength password={password} />
          </div>
          <div>
            <label htmlFor="confirm-password" className="label">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type={show ? "text" : "password"}
              className="input h-11"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              maxLength={72}
              required
            />
            <FieldHint>{mismatch && "Passwords don't match"}</FieldHint>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={busy || !ready || tooShort}
          >
            {busy && <Spinner />} Reset password
          </button>
          <p className="text-center text-[11px] muted">
            You&apos;ll be signed out on every device. Two-step verification stays on.
          </p>
        </AuthForm>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      step={{ current: 1, total: 2 }}
      icon={<KeyRound className="h-5 w-5" />}
      title="Forgot your password?"
      subtitle="Enter your account email and we'll send you a 6-digit reset code."
      footer={backToSignIn}
    >
      <AuthForm onSubmit={start}>
        <ErrorNote message={error} />
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input h-11"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoFocus
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={busy}>
          {busy && <Spinner />} Send reset code
        </button>
      </AuthForm>
    </AuthLayout>
  );
}
