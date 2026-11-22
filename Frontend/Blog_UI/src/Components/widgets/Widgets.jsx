import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, PenSquare, Sparkles, UserRoundCheck } from "lucide-react";
import { api, cachedGet } from "../../lib/api";
import { categoryLabel, displayName, toneFor } from "../../lib/format";
import { useAuth } from "../../Context/AuthContext";
import { useSocial } from "../../Context/SocialContext";
import { useCategories } from "../../hooks/useCommunity";
import Avatar from "../ui/Avatar";
import { Skeleton } from "../ui/Feedback";
import UserRow from "../user/UserRow";

export function WidgetCard({ title, icon: Icon, action, children }) {
  return (
    <section className="card">
      <header className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-slate-900 dark:text-white">
          {Icon && <Icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
          {title}
        </h2>
        {action}
      </header>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}

export function TopicsWidget({ limit = 8 }) {
  const { categories, loading } = useCategories();
  const top = useMemo(
    () => [...categories].sort((a, b) => b.count - a.count).slice(0, limit),
    [categories, limit]
  );

  return (
    <WidgetCard
      title="Trending topics"
      icon={Flame}
      action={
        <Link to="/topics" className="text-[11px] link">
          See all
        </Link>
      }
    >
      {loading ? (
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((key) => (
            <Skeleton key={key} className="h-6 w-20 rounded-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {top.map((topic) => (
            <Link
              key={topic.name}
              to={`/topics?category=${topic.name}`}
              className={`chip ${toneFor(topic.name)} py-1 transition-opacity hover:opacity-80`}
            >
              {categoryLabel(topic.name)}
              <span className="opacity-60">{topic.count}</span>
            </Link>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

export function WhoToFollowWidget({ limit = 5 }) {
  const { currentUser } = useAuth();
  const { isFollowing, ready } = useSocial();
  const [users, setUsers] = useState(null);

  useEffect(() => {
    if (!currentUser) return undefined;
    let cancelled = false;
    cachedGet("/user", { ttl: 120000 })
      .then((data) => !cancelled && setUsers(data?.users || []))
      .catch(() => !cancelled && setUsers([]));
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const [frozen, setFrozen] = useState(null);
  useEffect(() => {
    if (!users || !ready || frozen) return;
    setFrozen(
      users
        .filter((user) => user.id !== currentUser?.userId && !isFollowing(user.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
    );
  }, [users, ready, frozen, currentUser, isFollowing, limit]);

  if (!currentUser) return null;

  return (
    <WidgetCard
      title="Who to follow"
      icon={UserRoundCheck}
      action={
        <Link to="/people" className="text-[11px] link">
          See all
        </Link>
      }
    >
      {!frozen ? (
        <div className="space-y-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
      ) : frozen.length === 0 ? (
        <p className="text-xs muted">You follow everyone here. Nice!</p>
      ) : (
        <div className="space-y-3">
          {frozen.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

export function ProfileCompletionWidget() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  const checks = [
    { done: Boolean(currentUser.fullname), label: "Full name" },
    { done: Boolean(currentUser.avatar), label: "Profile photo" },
    { done: Boolean(currentUser.gender), label: "Gender" },
  ];
  const done = checks.filter((check) => check.done).length;
  if (done === checks.length) return null;
  const percent = Math.round((done / checks.length) * 100);

  return (
    <WidgetCard title="Complete your profile" icon={Sparkles}>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ul className="mt-3 space-y-1.5 text-xs">
        {checks.map((check) => (
          <li
            key={check.label}
            className={
              check.done ? "text-slate-400 line-through" : "text-slate-600 dark:text-slate-300"
            }
          >
            {check.label}
          </li>
        ))}
      </ul>
      <Link to="/settings" className="btn btn-secondary btn-sm mt-3 w-full">
        Update profile <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </WidgetCard>
  );
}

export function ComposerPrompt() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  return (
    <Link
      to="/write"
      className="card flex items-center gap-3 px-4 py-3 transition-shadow hover:shadow-lift"
    >
      <Avatar user={currentUser} size="md" />
      <span className="flex-1 truncate rounded-lg bg-slate-50 px-3 py-2.5 text-[13px] text-slate-400 dark:bg-white/[0.04]">
        What&apos;s on your mind, {displayName(currentUser).split(" ")[0]}?
      </span>
      <span className="btn btn-primary hidden sm:inline-flex">
        <PenSquare className="h-4 w-4" />
        Write
      </span>
    </Link>
  );
}

export function useUserLookup(userId) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!userId) {
      setUser(null);
      return undefined;
    }
    let cancelled = false;
    api
      .get(`/user/${userId}`)
      .then((res) => !cancelled && setUser(res.data?.user || null))
      .catch((err) => !cancelled && setError(err));
    return () => {
      cancelled = true;
    };
  }, [userId]);
  return { user, error };
}
