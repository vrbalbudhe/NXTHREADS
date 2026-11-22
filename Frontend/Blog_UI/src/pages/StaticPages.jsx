import { Link } from "react-router-dom";
import { Compass, Heart, Lock, MessagesSquare, PenSquare, ShieldCheck, Users } from "lucide-react";
import { useStats } from "../hooks/useCommunity";
import { formatCount } from "../lib/format";
import { useShellTitle } from "../Components/layout/ShellContext";
import { LogoMark } from "../Components/ui/Logo";

const FEATURES = [
  {
    icon: PenSquare,
    title: "Write",
    text: "Publish stories with images, organised into topics readers can follow.",
  },
  {
    icon: MessagesSquare,
    title: "Discuss",
    text: "Every post has a discussion thread so ideas can grow in public.",
  },
  { icon: Users, title: "Follow", text: "Build a personal feed from the writers you care about." },
  {
    icon: Heart,
    title: "React & save",
    text: "Like, save for later and share the posts that resonate.",
  },
  {
    icon: Compass,
    title: "Explore",
    text: "Search across every post, author and topic in the community.",
  },
  {
    icon: Lock,
    title: "Chat privately",
    text: "Real-time direct messages with people in your network.",
  },
];

export function About() {
  const { data } = useStats();
  useShellTitle("About");

  return (
    <div className="page page-narrow">
      <section className="card card-pad relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-brand-400/30 to-violet-400/30 blur-3xl" />
        <LogoMark className="h-12 w-12" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          A calm home for writers and readers.
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed muted">
          NXTHREADS is a community blogging platform. Share what you know, learn from others and
          keep the conversation going with comments and direct messages.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
          {[
            ["Writers", data?.writers],
            ["Posts", data?.posts],
            ["Comments", data?.comments],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]">
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {value === undefined ? "—" : formatCount(value)}
              </p>
              <p className="text-[11px] muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="card card-pad">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              <feature.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              {feature.title}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed muted">{feature.text}</p>
          </div>
        ))}
      </section>

      <section className="card card-pad flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Ready to share your first idea?
          </h3>
          <p className="text-[13px] muted">It takes less than a minute to get started.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/explore" className="btn btn-secondary">
            Explore
          </Link>
          <Link to="/register" className="btn btn-primary">
            Join now
          </Link>
        </div>
      </section>
    </div>
  );
}

const POLICY = [
  {
    title: "What we collect",
    body: [
      "Account details you give us: username, email address, a hashed password, and optionally your full name, gender and profile photo.",
      "Content you create: posts, images, comments, likes, saves, follows and direct messages.",
      "A session cookie that keeps you signed in. It is HTTP-only and cannot be read by scripts.",
    ],
  },
  {
    title: "How we use it",
    body: [
      "To run the service: show your posts, build your feed, deliver messages and send your email verification code.",
      "Your email is only visible to you. Other people see your username, name and photo.",
      "We do not sell your data or use it for advertising.",
    ],
  },
  {
    title: "Images",
    body: [
      "Images you upload are stored with our image hosting provider (Cloudinary) and are publicly accessible by link.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can edit your profile, change your password or delete posts and comments at any time.",
      "You can delete your account from Settings. This permanently removes your profile, posts, comments, likes, saves, follows and messages.",
    ],
  },
];

export function Privacy() {
  useShellTitle("Privacy");
  return (
    <div className="page page-narrow">
      <section className="card card-pad flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Privacy policy
          </h2>
          <p className="text-xs muted">
            Plain-language summary of how NXTHREADS handles your data.
          </p>
        </div>
      </section>
      {POLICY.map((section) => (
        <section key={section.title} className="card card-pad">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{section.title}</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
            {section.body.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function NotFound() {
  useShellTitle("Not found");
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <p className="bg-gradient-to-br from-brand-500 to-violet-500 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent">
        404
      </p>
      <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
        This page doesn&apos;t exist
      </h2>
      <p className="mt-1 text-[13px] muted">The link may be broken or the page may have moved.</p>
      <div className="mt-6 flex gap-2">
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link to="/explore" className="btn btn-secondary">
          Explore
        </Link>
      </div>
    </div>
  );
}
