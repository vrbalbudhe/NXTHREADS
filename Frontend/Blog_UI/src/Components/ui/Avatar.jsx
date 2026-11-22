import { useState } from "react";
import { avatarToneFor, displayName, initialsOf } from "../../lib/format";

const SIZES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-2xl",
};

export default function Avatar({ user, size = "md", ring = false, className = "" }) {
  const [failed, setFailed] = useState(false);
  const sizeClass = SIZES[size] || SIZES.md;
  const ringClass = ring ? "ring-4 ring-white dark:ring-panel-dark" : "";
  const label = displayName(user);

  if (user?.avatar && !failed) {
    return (
      <img
        src={user.avatar}
        alt={label}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${sizeClass} ${ringClass} shrink-0 rounded-full bg-slate-100 object-cover dark:bg-white/10 ${className}`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={label}
      className={`${sizeClass} ${ringClass} inline-flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br ${avatarToneFor(user?.username || label)} font-semibold text-white ${className}`}
    >
      {initialsOf(user)}
    </span>
  );
}

export function AvatarStack({ users = [], max = 3, extra = 0 }) {
  const shown = users.slice(0, max);
  const remaining = extra || Math.max(0, users.length - max);
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((user) => (
        <Avatar key={user.id} user={user} size="sm" ring />
      ))}
      {remaining > 0 && (
        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-brand-50 px-1.5 text-[11px] font-semibold text-brand-700 ring-4 ring-white dark:bg-brand-500/15 dark:text-brand-300 dark:ring-panel-dark">
          {remaining > 99 ? "99+" : `${remaining}+`}
        </span>
      )}
    </div>
  );
}
