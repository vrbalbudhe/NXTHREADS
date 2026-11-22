import { useEffect, useState } from "react";
import { Spinner } from "../../Components/ui/Feedback";

export const MIN_PASSWORD = 8;

export function PasswordField({ id, value, onChange, autoComplete, placeholder, show, onToggle }) {
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        className="input h-11 pr-16"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={72}
        required
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

function strengthOf(password) {
  let score = 0;
  if (password.length >= MIN_PASSWORD) score += 1;
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

export function PasswordStrength({ password }) {
  if (!password) return null;
  const strength = strengthOf(password);
  return (
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
        {password.length < MIN_PASSWORD ? STRENGTH[0].label : STRENGTH[strength].label}
      </span>
    </div>
  );
}

export function FieldHint({ children, tone = "error" }) {
  if (!children) return null;
  return (
    <p className={`mt-1 text-[11px] ${tone === "error" ? "text-rose-600" : "muted"}`}>{children}</p>
  );
}

/** "Resend code" link with a 60-second cooldown. */
export function ResendButton({ onResend, cooldown = 60 }) {
  const [left, setLeft] = useState(cooldown);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (left <= 0) return undefined;
    const timer = setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);

  const resend = async () => {
    setBusy(true);
    try {
      if ((await onResend()) !== false) setLeft(cooldown);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={resend}
      disabled={busy || left > 0}
      className="link inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy && <Spinner className="h-3.5 w-3.5" />}
      {left > 0 ? `Resend code in ${left}s` : "Resend code"}
    </button>
  );
}

/** Small "Step 2 of 3" progress bar shared by multi-step auth flows. */
export function StepIndicator({ step, total }) {
  return (
    <div className="mb-6" aria-label={`Step ${step} of ${total}`}>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index < step ? "bg-brand-600" : "bg-slate-200 dark:bg-white/10"
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider muted">
        Step {step} of {total}
      </p>
    </div>
  );
}
