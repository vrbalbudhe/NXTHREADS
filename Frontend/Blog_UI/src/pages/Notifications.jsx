import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Heart, MessageCircle, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { errorMessage } from "../lib/api";
import { formatDate, timeAgo } from "../lib/format";
import { notificationLink, notificationText } from "../lib/notifications";
import { useNotifications } from "../Context/NotificationContext";
import { usePaged } from "../hooks/usePaged";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useShellTitle } from "../Components/layout/ShellContext";
import Avatar from "../Components/ui/Avatar";
import Tabs from "../Components/ui/Tabs";
import { EmptyState, ErrorNote, LoadMore, Skeleton } from "../Components/ui/Feedback";

const ICONS = {
  LIKE: { icon: Heart, tone: "bg-rose-500" },
  COMMENT: { icon: MessageCircle, tone: "bg-brand-600" },
  FOLLOW: { icon: UserPlus, tone: "bg-emerald-500" },
};

const sectionOf = (value) => {
  const date = new Date(value);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (date.getTime() >= startOfToday) return "Today";
  if (date.getTime() >= startOfToday - 6 * 24 * 3600 * 1000) return "This week";
  return "Earlier";
};

function NotificationRow({ notification, onOpen }) {
  const meta = ICONS[notification.type] || ICONS.LIKE;
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03] sm:px-5 ${
          notification.read ? "" : "bg-brand-50/60 dark:bg-brand-500/[0.06]"
        }`}
      >
        <span className="relative shrink-0">
          <Avatar user={notification.actor} size="md" />
          <span
            className={`absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-white ring-2 ring-white dark:ring-panel-dark ${meta.tone}`}
          >
            <meta.icon className="h-3 w-3" />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] leading-snug text-slate-700 dark:text-slate-200">
            {notificationText(notification)}
          </span>
          <span className="mt-0.5 block text-[11px] muted">
            {timeAgo(notification.createdAt)} ·{" "}
            {formatDate(notification.createdAt, { day: "numeric", month: "short" })}
          </span>
        </span>
        {!notification.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
      </button>
    </li>
  );
}

export default function Notifications() {
  const navigate = useNavigate();
  const { unread, markRead, subscribe } = useNotifications();
  const [tab, setTab] = useState("all");
  useShellTitle("Notifications");

  const feed = usePaged("/notifications", {
    params: tab === "unread" ? { unread: "true" } : {},
    itemsKey: "notifications",
    limit: 20,
  });
  const sentinel = useInfiniteScroll(feed.loadMore, feed.hasMore && !feed.loading);
  const { prependItem, updateItem, items } = feed;

  useEffect(
    () =>
      subscribe((event) => {
        if (event.type === "new") prependItem(event.notification);
        if (event.type === "read") {
          for (const item of items) {
            if (!event.ids || event.ids.includes(item.id)) updateItem(item.id, { read: true });
          }
        }
      }),
    [subscribe, prependItem, updateItem, items]
  );

  const grouped = useMemo(() => {
    const groups = [];
    for (const item of items) {
      const label = sectionOf(item.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.items.push(item);
      else groups.push({ label, items: [item] });
    }
    return groups;
  }, [items]);

  const open = async (notification) => {
    if (!notification.read) {
      updateItem(notification.id, { read: true });
      markRead([notification.id]).catch(() => {});
    }
    navigate(notificationLink(notification));
  };

  const markAll = async () => {
    try {
      await markRead();
      for (const item of items) updateItem(item.id, { read: true });
      toast.success("All caught up");
    } catch (error) {
      toast.error(errorMessage(error, "Could not mark as read"));
    }
  };

  return (
    <div className="page page-narrow">
      <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <Tabs
          className="sm:w-64"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread", count: unread },
          ]}
        />
        <button
          type="button"
          onClick={markAll}
          disabled={unread === 0}
          className="btn btn-secondary btn-sm"
        >
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </button>
      </div>

      <ErrorNote message={feed.error} onRetry={feed.reload} />

      <section className="card overflow-hidden">
        {feed.loading ? (
          <div className="space-y-4 p-5">
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={tab === "unread" ? "No unread notifications" : "No notifications yet"}
            description="Likes, comments and new followers will show up here."
            action={
              <Link to="/explore" className="btn btn-primary btn-sm">
                Explore posts
              </Link>
            }
          />
        ) : (
          <>
            {grouped.map((group) => (
              <div key={group.label}>
                <p className="section-label border-b border-line bg-slate-50/70 px-4 py-2 dark:border-line-dark dark:bg-white/[0.02] sm:px-5">
                  {group.label}
                </p>
                <ul className="divide-y divide-line dark:divide-line-dark">
                  {group.items.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      onOpen={open}
                    />
                  ))}
                </ul>
              </div>
            ))}
            <LoadMore
              sentinelRef={sentinel}
              loadingMore={feed.loadingMore}
              hasMore={feed.hasMore}
              onLoadMore={feed.loadMore}
              endLabel="That's everything"
            />
          </>
        )}
      </section>
    </div>
  );
}
