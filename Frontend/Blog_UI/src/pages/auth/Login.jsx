import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { errorMessage } from "../../lib/api";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { ErrorNote, Spinner } from "../../Components/ui/Feedback";
import AuthLayout, { PasswordField } from "./AuthLayout";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  usePageTitle("Sign in");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back${user?.fullname ? `, ${user.fullname.split(" ")[0]}` : ""}!`);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Could not sign in"));
    } finally {
      setBusy(false);
    }
  };

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
      <form onSubmit={submit} className="space-y-4">
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
          <label htmlFor="password" className="label">
            Password
          </label>
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
      </form>
    </AuthLayout>
  );
}
