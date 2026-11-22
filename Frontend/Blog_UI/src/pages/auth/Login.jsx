import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LifeBuoy, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { api, errorMessage } from "../../lib/api";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { ErrorNote, Spinner } from "../../Components/ui/Feedback";
import OtpInput from "../../Components/ui/OtpInput";
import AuthLayout, { AuthForm } from "./AuthLayout";
import { PasswordField, ResendButton } from "./fields";

function MfaStep({ challenge, onDone, onRestart }) {
  const { completeMfa } = useAuth();
  const [useRecovery, setUseRecovery] = useState(false);
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const isEmail = challenge.method === "EMAIL";

  const submit = async (value) => {
    const entered = useRecovery ? recovery.trim() : value;
    if (busy || (!useRecovery && entered.length !== 6) || (useRecovery && entered.length < 10)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await completeMfa(challenge.mfaToken, entered);
      if (result.recoveryCodesLeft !== undefined) {
        toast.info(
          `Recovery code used. ${result.recoveryCodesLeft} left — create new ones in Settings.`
        );
      }
      onDone(result.user);
    } catch (err) {
      if (err?.response?.data?.expired) {
        toast.error(errorMessage(err));
        onRestart();
        return;
      }
      setError(errorMessage(err, "That code didn't work"));
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await api.post("/auth/mfa/challenge/resend", { mfaToken: challenge.mfaToken });
      toast.success("A new code is on its way");
      return true;
    } catch (err) {
      toast.error(errorMessage(err, "Could not resend the code"));
      if (err?.response?.data?.expired) onRestart();
      return false;
    }
  };

  return (
    <AuthLayout
      icon={useRecovery ? <LifeBuoy className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
      title={useRecovery ? "Use a recovery code" : "Two-step verification"}
      subtitle={
        useRecovery
          ? "Enter one of the 10 recovery codes you saved when you turned on two-step verification. Each works once."
          : isEmail
            ? "Enter the 6-digit code we just emailed you."
            : "Enter the 6-digit code from your authenticator app."
      }
      footer={
        <button type="button" onClick={onRestart} className="link inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </button>
      }
    >
      <AuthForm
        onSubmit={(event) => {
          event.preventDefault();
          submit(code);
        }}
      >
        <ErrorNote message={error} />
        {useRecovery ? (
          <div>
            <label htmlFor="recovery" className="label">
              Recovery code
            </label>
            <input
              id="recovery"
              className="input h-11 font-mono tracking-wider"
              value={recovery}
              onChange={(event) => setRecovery(event.target.value)}
              placeholder="xxxxx-xxxxx"
              autoComplete="off"
              maxLength={20}
              autoFocus
              required
            />
          </div>
        ) : (
          <OtpInput value={code} onChange={setCode} disabled={busy} onComplete={submit} />
        )}
        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={busy || (useRecovery ? recovery.trim().length < 10 : code.length !== 6)}
        >
          {busy && <Spinner />} Verify and sign in
        </button>
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <button
            type="button"
            className="link"
            onClick={() => {
              setError(null);
              setUseRecovery((value) => !value);
            }}
          >
            {useRecovery ? "Use a 6-digit code" : "Use a recovery code"}
          </button>
          {isEmail && !useRecovery && <ResendButton onResend={resend} />}
        </div>
      </AuthForm>
    </AuthLayout>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [challenge, setChallenge] = useState(null);
  usePageTitle(challenge ? "Two-step verification" : "Sign in");

  const finish = (user) => {
    toast.success(`Welcome back${user?.fullname ? `, ${user.fullname.split(" ")[0]}` : ""}!`);
    navigate(location.state?.from || "/", { replace: true });
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await login(email.trim(), password);
      if (result.mfaRequired) {
        setChallenge(result);
        return;
      }
      finish(result.user);
    } catch (err) {
      setError(errorMessage(err, "Could not sign in"));
    } finally {
      setBusy(false);
    }
  };

  if (challenge) {
    return (
      <MfaStep
        challenge={challenge}
        onDone={finish}
        onRestart={() => {
          setChallenge(null);
          setPassword("");
        }}
      />
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your feed."
      footer={
        <>
          New to NXTHREADS?{" "}
          <Link to="/register" className="link">
            Create an account
          </Link>
        </>
      }
    >
      <AuthForm onSubmit={submit}>
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
            required
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="label mb-0">
              Password
            </label>
            <Link to="/forgot-password" state={{ email: email.trim() }} className="link text-xs">
              Forgot password?
            </Link>
          </div>
          <PasswordField
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Your password"
            show={show}
            onToggle={() => setShow((value) => !value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={busy}>
          {busy && <Spinner />} Sign in
        </button>
        <Link to="/" className="btn btn-ghost w-full">
          Continue as guest
        </Link>
      </AuthForm>
    </AuthLayout>
  );
}
