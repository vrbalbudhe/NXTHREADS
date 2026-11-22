import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MailCheck, Mail, Sparkles, UserRoundPlus } from "lucide-react";
import { toast } from "react-toastify";
import { api, errorMessage } from "../../lib/api";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { ErrorNote, Notice, Spinner } from "../../Components/ui/Feedback";
import OtpInput from "../../Components/ui/OtpInput";
import TopicPicker from "../../Components/ui/TopicPicker";
import AuthLayout, { AuthForm } from "./AuthLayout";
import { FieldHint, MIN_PASSWORD, PasswordField, PasswordStrength, ResendButton } from "./fields";

const USERNAME_PATTERN = /^[A-Za-z0-9_.]{3,30}$/;
const TOTAL_STEPS = 4;
const MIN_SUGGESTED_TOPICS = 3;

const signInFooter = (
  <>
    Already have an account?{" "}
    <Link to="/login" className="link">
      Sign in
    </Link>
  </>
);

export default function Register() {
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const [form, setForm] = useState({ username: "", fullname: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState(null);
  const [topics, setTopics] = useState([]);
  usePageTitle(
    {
      email: "Create account",
      code: "Verify email",
      details: "Finish sign-up",
      topics: "Pick your topics",
    }[step]
  );

  const run = async (task, fallback) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (err) {
      setError(errorMessage(err, fallback));
    } finally {
      setBusy(false);
    }
  };

  const sendCode = () => api.post("/auth/register/start", { email: email.trim() });

  const startSignup = (event) => {
    event.preventDefault();
    run(async () => {
      await sendCode();
      setCode("");
      setStep("code");
      toast.success("Check your inbox for a 6-digit code");
    }, "Could not send the code");
  };

  const verifyCode = (value = code) => {
    if (value.length !== 6 || busy) return;
    run(async () => {
      try {
        const res = await api.post("/auth/register/verify", { email: email.trim(), code: value });
        setSignupToken(res.data.signupToken);
        setStep("details");
      } catch (err) {
        setCode("");
        throw err;
      }
    }, "Verification failed");
  };

  const resend = async () => {
    try {
      await sendCode();
      toast.success("A new code is on its way");
      return true;
    } catch (err) {
      toast.error(errorMessage(err, "Could not resend the code"));
      return false;
    }
  };

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const usernameInvalid = form.username && !USERNAME_PATTERN.test(form.username.trim());
  const tooShort = form.password.length > 0 && form.password.length < MIN_PASSWORD;
  const mismatch = form.confirm && form.password !== form.confirm;
  const detailsReady =
    USERNAME_PATTERN.test(form.username.trim()) &&
    form.password.length >= MIN_PASSWORD &&
    form.password === form.confirm;

  const finish = (event) => {
    event.preventDefault();
    if (!detailsReady) return;
    run(async () => {
      try {
        const res = await api.post("/auth/register/complete", {
          signupToken,
          username: form.username.trim(),
          fullname: form.fullname.trim() || undefined,
          password: form.password,
        });
        // The session cookie is set now; we only publish the user after the topics step,
        // otherwise the guest-only route would redirect away from it.
        setNewUser(res.data.userInfo);
        setStep("topics");
      } catch (err) {
        if (err?.response?.data?.expired) {
          setSignupToken("");
          setStep("email");
        }
        throw err;
      }
    }, "Could not create the account");
  };

  const enterApp = () => {
    setCurrentUser(newUser);
    toast.success("Welcome to NXTHREADS!");
    navigate("/", { replace: true });
  };

  const saveTopics = () =>
    run(async () => {
      await api.put("/user/me/interests", { interests: topics });
      enterApp();
    }, "Could not save your topics");

  if (step === "topics") {
    return (
      <AuthLayout
        step={{ current: 4, total: TOTAL_STEPS }}
        icon={<Sparkles className="h-5 w-5" />}
        title="What do you like to read?"
        subtitle={`Pick at least ${MIN_SUGGESTED_TOPICS} topics so your feed and suggestions fit you from day one. You can change them in Settings.`}
      >
        <div className="space-y-4">
          <ErrorNote message={error} />
          <TopicPicker value={topics} onChange={setTopics} disabled={busy} />
          <button
            type="button"
            className="btn btn-primary btn-lg w-full"
            onClick={saveTopics}
            disabled={busy || topics.length < MIN_SUGGESTED_TOPICS}
          >
            {busy && <Spinner />}{" "}
            {topics.length < MIN_SUGGESTED_TOPICS
              ? `Pick ${MIN_SUGGESTED_TOPICS - topics.length} more`
              : "Continue"}
          </button>
          <button type="button" className="btn btn-ghost w-full" onClick={enterApp} disabled={busy}>
            Skip for now
          </button>
        </div>
      </AuthLayout>
    );
  }

  if (step === "code") {
    return (
      <AuthLayout
        step={{ current: 2, total: TOTAL_STEPS }}
        icon={<MailCheck className="h-5 w-5" />}
        title="Check your email"
        subtitle={`Enter the 6-digit code we sent to ${email.trim()}. It expires in 10 minutes.`}
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
        <AuthForm
          onSubmit={(event) => {
            event.preventDefault();
            verifyCode();
          }}
        >
          <ErrorNote message={error} />
          <OtpInput value={code} onChange={setCode} disabled={busy} onComplete={verifyCode} />
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={busy || code.length !== 6}
          >
            {busy && <Spinner />} Verify email
          </button>
          <div className="flex items-center justify-between text-[13px]">
            <span className="muted">Didn&apos;t get it?</span>
            <ResendButton onResend={resend} />
          </div>
          <Notice icon={Mail} tone="brand">
            Can&apos;t find it? Check your spam folder. If you already have an account, we emailed
            you a sign-in reminder instead.
          </Notice>
        </AuthForm>
      </AuthLayout>
    );
  }

  if (step === "details") {
    return (
      <AuthLayout
        step={{ current: 3, total: TOTAL_STEPS }}
        icon={<UserRoundPlus className="h-5 w-5" />}
        title="Set up your profile"
        subtitle={`Email confirmed: ${email.trim()}. Choose how you'll appear and sign in.`}
        footer={signInFooter}
      >
        <AuthForm onSubmit={finish}>
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
              autoFocus
              required
            />
            <FieldHint>
              {usernameInvalid && "3–30 characters: letters, numbers, dots or underscores"}
            </FieldHint>
          </div>
          <div>
            <label htmlFor="fullname" className="label">
              Full name <span className="font-normal muted">(optional)</span>
            </label>
            <input
              id="fullname"
              className="input h-11"
              autoComplete="name"
              value={form.fullname}
              onChange={set("fullname")}
              placeholder="Jane Doe"
              maxLength={60}
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
              placeholder={`At least ${MIN_PASSWORD} characters`}
              show={show}
              onToggle={() => setShow((value) => !value)}
            />
            <PasswordStrength password={form.password} />
          </div>
          <div>
            <label htmlFor="confirm" className="label">
              Confirm password
            </label>
            <input
              id="confirm"
              type={show ? "text" : "password"}
              className="input h-11"
              autoComplete="new-password"
              value={form.confirm}
              onChange={set("confirm")}
              maxLength={72}
              required
            />
            <FieldHint>{mismatch && "Passwords don't match"}</FieldHint>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={busy || !detailsReady || tooShort}
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
        </AuthForm>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      step={{ current: 1, total: TOTAL_STEPS }}
      title="Create your account"
      subtitle="Start with your email. We'll send a code to confirm it's you."
      footer={signInFooter}
    >
      <AuthForm onSubmit={startSignup}>
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
          {busy && <Spinner />} Send code
        </button>
      </AuthForm>
    </AuthLayout>
  );
}
