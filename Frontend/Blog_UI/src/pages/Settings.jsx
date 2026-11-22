import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Monitor, Moon, Palette, Sun, Trash2, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import { useShellTitle } from "../Components/layout/ShellContext";
import Avatar from "../Components/ui/Avatar";
import Modal from "../Components/ui/Modal";
import { Spinner } from "../Components/ui/Feedback";
import ImageUploader from "../Components/post/ImageUploader";

function Section({ icon: Icon, title, description, children, tone }) {
  return (
    <section
      className={`card ${tone === "danger" ? "border-rose-200 dark:border-rose-500/30" : ""}`}
    >
      <header className="flex items-start gap-3 border-b border-line px-4 py-4 dark:border-line-dark sm:px-5">
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            tone === "danger"
              ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
              : "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
          {description && <p className="text-xs muted">{description}</p>}
        </div>
      </header>
      <div className="px-4 py-4 sm:px-5">{children}</div>
    </section>
  );
}

function ProfileSection() {
  const { currentUser, updateCurrentUser } = useAuth();
  const [form, setForm] = useState({
    fullname: currentUser.fullname || "",
    gender: currentUser.gender || "",
    avatar: currentUser.avatar || "",
  });
  const [saving, setSaving] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/user/upd/${currentUser.userId}`, form);
      updateCurrentUser({
        fullname: res.data.data.fullname,
        gender: res.data.data.gender,
        avatar: res.data.data.avatar,
      });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(errorMessage(error, "Could not update profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section icon={UserRound} title="Profile" description="How you appear to other people.">
      <form onSubmit={save} className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar user={{ ...currentUser, ...form }} size="lg" />
          <div className="flex-1">
            <ImageUploader
              single
              images={form.avatar ? [form.avatar] : []}
              onChange={(images) => setForm((current) => ({ ...current, avatar: images[0] || "" }))}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fullname" className="label">
              Full name
            </label>
            <input
              id="fullname"
              className="input"
              maxLength={60}
              value={form.fullname}
              onChange={(event) =>
                setForm((current) => ({ ...current, fullname: event.target.value }))
              }
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="gender" className="label">
              Gender
            </label>
            <select
              id="gender"
              className="input"
              value={form.gender}
              onChange={(event) =>
                setForm((current) => ({ ...current, gender: event.target.value }))
              }
            >
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="label">Username</span>
            <p className="input flex items-center bg-slate-50 text-slate-500 dark:bg-white/[0.02]">
              @{currentUser.username}
            </p>
          </div>
          <div>
            <span className="label">Email</span>
            <p className="input flex items-center truncate bg-slate-50 text-slate-500 dark:bg-white/[0.02]">
              {currentUser.email}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving && <Spinner />} Save profile
          </button>
        </div>
      </form>
    </Section>
  );
}

function PasswordSection() {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", password: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const mismatch = form.confirm && form.password !== form.confirm;
  const tooShort = form.password && form.password.length < 8;

  const save = async (event) => {
    event.preventDefault();
    if (mismatch || tooShort) return;
    setSaving(true);
    try {
      await api.put(`/user/upd/${currentUser.userId}`, {
        currentPassword: form.currentPassword,
        password: form.password,
      });
      setForm({ currentPassword: "", password: "", confirm: "" });
      toast.success("Password changed");
    } catch (error) {
      toast.error(errorMessage(error, "Could not change password"));
    } finally {
      setSaving(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (event) => setForm((current) => ({ ...current, [key]: event.target.value })),
  });

  return (
    <Section icon={KeyRound} title="Password" description="Use at least 8 characters.">
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="current-password" className="label">
            Current password
          </label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            className="input"
            required
            {...field("currentPassword")}
          />
        </div>
        <div>
          <label htmlFor="new-password" className="label">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            className="input"
            required
            maxLength={72}
            {...field("password")}
          />
          {tooShort && <p className="mt-1 text-[11px] text-rose-600">At least 8 characters</p>}
        </div>
        <div>
          <label htmlFor="confirm-password" className="label">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            className="input"
            required
            {...field("confirm")}
          />
          {mismatch && <p className="mt-1 text-[11px] text-rose-600">Passwords don&apos;t match</p>}
        </div>
        <div className="flex justify-end sm:col-span-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || mismatch || tooShort}
          >
            {saving && <Spinner />} Change password
          </button>
        </div>
      </form>
    </Section>
  );
}

function AppearanceSection() {
  const { preference, setTheme } = useTheme();
  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];
  return (
    <Section
      icon={Palette}
      title="Appearance"
      description="Choose how NXTHREADS looks on this device."
    >
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={preference === option.value}
            className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-[13px] font-semibold transition-colors ${
              preference === option.value
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                : "border-line text-slate-600 hover:bg-slate-50 dark:border-line-dark dark:text-slate-300 dark:hover:bg-white/[0.03]"
            }`}
          >
            <option.icon className="h-5 w-5" />
            {option.label}
          </button>
        ))}
      </div>
    </Section>
  );
}

function DangerSection() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const ready = password && confirmText === "DELETE";

  const remove = async () => {
    if (!ready) return;
    setBusy(true);
    try {
      await api.delete(`/user/${currentUser.userId}`, { data: { password } });
      toast.success("Your account has been deleted");
      setCurrentUser(null);
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete your account"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section
      icon={Trash2}
      title="Delete account"
      description="Permanently remove your account and everything in it."
      tone="danger"
    >
      <p className="text-[13px] muted">
        Your profile, posts, comments, likes, saved posts, follows and messages will be deleted.
        This cannot be undone.
      </p>
      <button type="button" className="btn btn-danger mt-4" onClick={() => setOpen(true)}>
        Delete my account
      </button>
      <Modal
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Delete your account?"
        description="This permanently deletes everything. It cannot be undone."
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={remove}
              disabled={!ready || busy}
            >
              {busy && <Spinner />} Delete permanently
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label htmlFor="delete-password" className="label">
              Your password
            </label>
            <input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="delete-confirm" className="label">
              Type DELETE to confirm
            </label>
            <input
              id="delete-confirm"
              className="input"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
            />
          </div>
        </div>
      </Modal>
    </Section>
  );
}

export default function Settings() {
  useShellTitle("Settings");
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <ProfileSection />
      <PasswordSection />
      <AppearanceSection />
      <DangerSection />
    </div>
  );
}
