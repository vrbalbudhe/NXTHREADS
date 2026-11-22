import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Mail,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Smartphone,
} from "lucide-react";
import { toast } from "react-toastify";
import { api, errorMessage } from "../../lib/api";
import { useAuth } from "../../Context/AuthContext";
import Modal from "../../Components/ui/Modal";
import OtpInput from "../../Components/ui/OtpInput";
import SettingsSection from "../../Components/ui/SettingsSection";
import { ErrorNote, Notice, Skeleton, Spinner } from "../../Components/ui/Feedback";
import { ResendButton } from "../auth/fields";

const METHOD_LABEL = { TOTP: "Authenticator app", EMAIL: "Email code" };

function RecoveryCodes({ codes }) {
  const [copied, setCopied] = useState(false);
  const text = codes.join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed. Select the codes and copy them manually");
    }
  };

  const download = () => {
    const blob = new Blob([`NXTHREADS recovery codes\nEach code works once.\n\n${text}\n`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nxthreads-recovery-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <Notice icon={ShieldCheck} tone="amber">
        Save these codes somewhere safe. Each one signs you in once if you lose access to your
        second step. You won&apos;t see them again.
      </Notice>
      <ul className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-slate-50 p-3 font-mono text-[13px] dark:border-line-dark dark:bg-white/[0.03]">
        {codes.map((code) => (
          <li key={code} className="text-center tracking-wider">
            {code}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button type="button" className="btn btn-secondary flex-1" onClick={copy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button type="button" className="btn btn-secondary flex-1" onClick={download}>
          <Download className="h-4 w-4" /> Download
        </button>
      </div>
    </div>
  );
}

/** Modal that walks through turning on one MFA method, then shows recovery codes. */
function EnableModal({ method, onClose, onEnabled }) {
  const { currentUser } = useAuth();
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState(null);

  const begin = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.post(
        method === "TOTP" ? "/auth/mfa/totp/setup" : "/auth/mfa/email/setup"
      );
      setSetup(res.data);
    } catch (err) {
      setError(errorMessage(err, "Could not start setup"));
    } finally {
      setBusy(false);
    }
  }, [method]);

  useEffect(() => {
    begin();
  }, [begin]);

  const resendEmail = async () => {
    try {
      const res = await api.post("/auth/mfa/email/setup");
      setSetup(res.data);
      if (res.data.alreadySent) toast.info("Your last code is still valid. Use that one");
      else toast.success("A new code is on its way");
      return true;
    } catch (err) {
      toast.error(errorMessage(err, "Could not resend the code"));
      return false;
    }
  };

  const confirm = async (value = code) => {
    if (value.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.post(
        method === "TOTP" ? "/auth/mfa/totp/enable" : "/auth/mfa/email/enable",
        { code: value }
      );
      setRecoveryCodes(res.data.recoveryCodes);
      onEnabled(res.data.mfa);
      toast.success("Two-step verification is on");
    } catch (err) {
      setError(errorMessage(err, "That code didn't work"));
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const done = Boolean(recoveryCodes);

  return (
    <Modal
      open
      onClose={() => !busy && onClose()}
      title={done ? "Save your recovery codes" : `Set up ${METHOD_LABEL[method].toLowerCase()}`}
      description={
        done
          ? "Two-step verification is on. Other devices were signed out."
          : method === "TOTP"
            ? "Scan the QR code with Google Authenticator, 1Password, Authy or any TOTP app."
            : `We'll send a 6-digit code to ${currentUser.email} every time you sign in.`
      }
      footer={
        done ? (
          <button type="button" className="btn btn-primary" onClick={onClose}>
            I saved my codes
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => confirm()}
              disabled={busy || code.length !== 6 || !setup}
            >
              {busy && <Spinner />} Turn on
            </button>
          </>
        )
      }
    >
      {done ? (
        <RecoveryCodes codes={recoveryCodes} />
      ) : (
        <div className="space-y-4">
          <ErrorNote message={error} onRetry={!setup ? begin : undefined} />
          {method === "TOTP" &&
            (setup ? (
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                <img
                  src={setup.qrCode}
                  alt="QR code for your authenticator app"
                  className="h-40 w-40 shrink-0 rounded-xl border border-line bg-white p-1 dark:border-line-dark"
                />
                <div className="min-w-0 space-y-2 text-[13px]">
                  <p className="muted">Can&apos;t scan? Enter this key manually:</p>
                  <code className="block break-all rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs tracking-wider text-slate-800 dark:bg-white/5 dark:text-slate-100">
                    {setup.secret.match(/.{1,4}/g).join(" ")}
                  </code>
                  <p className="text-xs muted">Time-based, 6 digits, every 30 seconds.</p>
                </div>
              </div>
            ) : (
              !error && <Skeleton className="mx-auto h-40 w-40 rounded-xl" />
            ))}
          {method === "EMAIL" && setup && (
            <Notice icon={Mail} tone="brand">
              {setup.message}. Enter it below to confirm.
            </Notice>
          )}
          {setup && (
            <div>
              <span className="label">
                {method === "TOTP" ? "Code from your app" : "Code from your email"}
              </span>
              <OtpInput value={code} onChange={setCode} disabled={busy} onComplete={confirm} />
              {method === "EMAIL" && (
                <div className="mt-2 flex justify-end text-[12px]">
                  <ResendButton onResend={resendEmail} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/** Password-confirmed action: turn MFA off, or create new recovery codes. */
function PasswordModal({ action, onClose, onDone }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const isDisable = action === "disable";

  const submit = async (event) => {
    event?.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.post(isDisable ? "/auth/mfa/disable" : "/auth/mfa/recovery-codes", {
        password,
      });
      onDone(res.data.mfa);
      toast.success(res.data.message);
      if (isDisable) onClose();
      else setRecoveryCodes(res.data.recoveryCodes);
    } catch (err) {
      setError(errorMessage(err, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      size="sm"
      onClose={() => !busy && onClose()}
      title={
        recoveryCodes
          ? "Your new recovery codes"
          : isDisable
            ? "Turn off two-step verification?"
            : "Create new recovery codes?"
      }
      description={
        recoveryCodes
          ? "Your old codes no longer work."
          : isDisable
            ? "Your account will be protected by your password only."
            : "Your current recovery codes will stop working."
      }
      footer={
        recoveryCodes ? (
          <button type="button" className="btn btn-primary" onClick={onClose}>
            I saved my codes
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button
              type="button"
              className={`btn ${isDisable ? "btn-danger" : "btn-primary"}`}
              onClick={submit}
              disabled={!password || busy}
            >
              {busy && <Spinner />} {isDisable ? "Turn off" : "Create codes"}
            </button>
          </>
        )
      }
    >
      {recoveryCodes ? (
        <RecoveryCodes codes={recoveryCodes} />
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <ErrorNote message={error} />
          <div>
            <label htmlFor="mfa-password" className="label">
              Your password
            </label>
            <input
              id="mfa-password"
              type="password"
              autoComplete="current-password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </form>
      )}
    </Modal>
  );
}

function MethodOption({ icon: Icon, title, text, recommended, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl border border-line p-4 text-left transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-line-dark dark:hover:bg-brand-500/5"
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-200">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-900 dark:text-white">
          {title}
          {recommended && (
            <span className="chip bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              Recommended
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs muted">{text}</span>
      </span>
    </button>
  );
}

export default function MfaSection() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [enabling, setEnabling] = useState(null);
  const [passwordAction, setPasswordAction] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get("/auth/mfa");
      setStatus(res.data.mfa);
    } catch (err) {
      setError(errorMessage(err, "Could not load your security settings"));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const badge = status && (
    <span
      className={`chip shrink-0 ${
        status.enabled
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300"
      }`}
    >
      {status.enabled ? "On" : "Off"}
    </span>
  );

  return (
    <SettingsSection
      icon={ShieldCheck}
      title="Two-step verification"
      description="Ask for a second code after your password when you sign in."
      aside={badge}
    >
      {error && <ErrorNote message={error} onRetry={load} />}
      {!status && !error && <Skeleton className="h-20 w-full rounded-xl" />}

      {status && !status.enabled && (
        <div className="grid gap-3 sm:grid-cols-2">
          <MethodOption
            icon={Smartphone}
            title="Authenticator app"
            text="Codes from an app on your phone. Works offline."
            recommended
            onClick={() => setEnabling("TOTP")}
          />
          <MethodOption
            icon={Mail}
            title="Email code"
            text="We email you a 6-digit code each time you sign in."
            onClick={() => setEnabling("EMAIL")}
          />
        </div>
      )}

      {status?.enabled && (
        <div className="space-y-4">
          <dl className="grid gap-3 text-[13px] sm:grid-cols-3">
            <div>
              <dt className="text-xs muted">Method</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {METHOD_LABEL[status.method]}
              </dd>
            </div>
            <div>
              <dt className="text-xs muted">Turned on</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {status.enabledAt ? new Date(status.enabledAt).toLocaleDateString() : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs muted">Recovery codes left</dt>
              <dd
                className={`font-semibold ${
                  status.recoveryCodesLeft <= 2
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {status.recoveryCodesLeft} of 10
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPasswordAction("recovery")}
            >
              <RefreshCw className="h-4 w-4" /> New recovery codes
            </button>
            <button
              type="button"
              className="btn btn-secondary text-rose-600 dark:text-rose-400"
              onClick={() => setPasswordAction("disable")}
            >
              <ShieldOff className="h-4 w-4" /> Turn off
            </button>
          </div>
        </div>
      )}

      {enabling && (
        <EnableModal method={enabling} onClose={() => setEnabling(null)} onEnabled={setStatus} />
      )}
      {passwordAction && (
        <PasswordModal
          action={passwordAction}
          onClose={() => setPasswordAction(null)}
          onDone={setStatus}
        />
      )}
    </SettingsSection>
  );
}
