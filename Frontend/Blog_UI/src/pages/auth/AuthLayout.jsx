import { Link } from "react-router-dom";
import { MessagesSquare, PenSquare, Users } from "lucide-react";
import { useStats } from "../../hooks/useCommunity";
import { formatCount } from "../../lib/format";
import { LogoMark } from "../../Components/ui/Logo";
import Sparkline from "../../Components/ui/Sparkline";

const FEATURES = [
  { icon: PenSquare, title: "Write freely", text: "Publish stories with images in minutes." },
  { icon: MessagesSquare, title: "Discuss", text: "Threaded comments on every post." },
  { icon: Users, title: "Connect", text: "Follow writers and chat in real time." },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  const { data } = useStats();
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,520px)] xl:grid-cols-[1fr_minmax(0,560px)]">
      <aside className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-3">
          <span className="rounded-xl bg-white p-1.5">
            <LogoMark className="h-8 w-8" />
          </span>
          <span className="text-lg font-bold tracking-tight">NXTHREADS</span>
        </Link>
        <div className="relative mt-auto max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Where ideas turn into conversations.
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            A calm place to write, read and talk with people who care about the same things you do.
          </p>
          <ul className="mt-8 space-y-4">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <feature.icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{feature.title}</span>
                  <span className="block text-xs text-slate-400">{feature.text}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div>
              <p className="text-2xl font-bold">{data ? formatCount(data.writers) : "—"}</p>
              <p className="text-[11px] text-slate-400">writers</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{data ? formatCount(data.posts) : "—"}</p>
              <p className="text-[11px] text-slate-400">posts</p>
            </div>
            <Sparkline values={data?.trend} width={120} height={36} className="ml-auto" />
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10 dark:bg-canvas-dark sm:px-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <LogoMark className="h-9 w-9" />
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              NXTHREADS
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-[13px] muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-[13px] muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

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
