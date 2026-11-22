import { Loader2 } from "lucide-react";

export function Spinner({ className = "h-4 w-4" }) {
  return <Loader2 className={`${className} animate-spin`} aria-hidden="true" />;
}

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/70 dark:bg-white/[0.06] ${
        className.includes("rounded") ? "" : "rounded-md"
      } ${className}`}
    />
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-[13px] muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorNote({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="font-semibold underline underline-offset-2"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function Notice({ icon: Icon, children, tone = "amber" }) {
  const tones = {
    amber:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
    brand:
      "border-brand-100 bg-brand-50 text-brand-800 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-200",
  };
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed ${tones[tone]}`}
    >
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0" />}
      <div>{children}</div>
    </div>
  );
}

export function LoadMore({
  sentinelRef,
  loadingMore,
  hasMore,
  onLoadMore,
  endLabel = "You're all caught up",
}) {
  return (
    <div ref={sentinelRef} className="flex justify-center py-6">
      {loadingMore ? (
        <span className="inline-flex items-center gap-2 text-xs muted">
          <Spinner /> Loading more
        </span>
      ) : hasMore ? (
        <button type="button" onClick={onLoadMore} className="btn btn-secondary btn-sm">
          Load more
        </button>
      ) : (
        <span className="text-xs muted">{endLabel}</span>
      )}
    </div>
  );
}
