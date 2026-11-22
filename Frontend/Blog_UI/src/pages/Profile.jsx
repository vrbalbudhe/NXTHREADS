import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Bookmark,
  CalendarDays,
  FileText,
  Mail,
  MessageSquare,
  PenSquare,
  Settings,
  UserX,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { displayName, formatCount, formatDate } from "../lib/format";
import { useAuth } from "../Context/AuthContext";
import { usePaged } from "../hooks/usePaged";
import { useShellTitle } from "../Components/layout/ShellContext";
import Avatar from "../Components/ui/Avatar";
import Tabs from "../Components/ui/Tabs";
import { EmptyState, ErrorNote, Skeleton } from "../Components/ui/Feedback";
import PostList from "../Components/post/PostList";
import FollowButton from "../Components/user/FollowButton";
import FollowListModal from "../Components/user/FollowListModal";

function Stat({ label, value, onClick }) {
  const content = (
    <>
      <span className="block text-lg font-bold text-slate-900 dark:text-white">
        {formatCount(value)}
      </span>
      <span className="block text-[11px] font-medium muted">{label}</span>
    </>
  );
  if (!onClick) return <div className="text-center sm:text-left">{content}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg text-center transition-opacity hover:opacity-75 sm:text-left"
    >
      {content}
    </button>
  );
}

function ProfileHeader({ user, postCount, isMe, onShowList, onFollowToggled }) {
  return (
    <section className="card overflow-hidden">
      <div className="relative h-28 bg-gradient-to-r from-brand-600 via-indigo-500 to-violet-500 sm:h-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_40%)]" />
      </div>
      <div className="px-4 pb-5 sm:px-5">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative z-10 w-fit">
            <Avatar user={user} size="xl" ring />
          </div>
          <div className="flex flex-wrap gap-2">
            {isMe ? (
              <>
                <Link to="/settings" className="btn btn-secondary btn-sm">
                  <Settings className="h-3.5 w-3.5" /> Edit profile
                </Link>
                <Link to="/write" className="btn btn-primary btn-sm">
                  <PenSquare className="h-3.5 w-3.5" /> Write
                </Link>
              </>
            ) : (
              <>
                <FollowButton userId={user.id} onToggled={onFollowToggled} />
                <Link to={`/messages?user=${user.id}`} className="btn btn-secondary btn-sm">
                  <MessageSquare className="h-3.5 w-3.5" /> Message
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {displayName(user)}
          </h2>
          <p className="text-[13px] muted">@{user.username}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> Joined{" "}
            {formatDate(user.createdAt, { month: "long", year: "numeric" })}
          </span>
          {isMe && user.email && (
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 dark:border-line-dark sm:flex sm:gap-8">
          <Stat label="Posts" value={postCount} />
          <Stat
            label="Followers"
            value={user.followers?.length || 0}
            onClick={() => onShowList("followers")}
          />
          <Stat
            label="Following"
            value={user.following?.length || 0}
            onClick={() => onShowList("following")}
          />
        </div>
      </div>
    </section>
  );
}

export default function Profile() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const isMe = currentUser?.userId === id;
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(0);
  const [tab, setTab] = useState("posts");
  const [listKind, setListKind] = useState(null);
  useShellTitle(user ? displayName(user) : "Profile");

  const load = useCallback(async () => {
    setError(null);
    setStatus(0);
    try {
      const res = await api.get(`/user/${id}`);
      setUser(res.data.user);
    } catch (err) {
      setStatus(err?.response?.status || 0);
      setError(errorMessage(err, "Unable to load this profile"));
    }
  }, [id]);

  useEffect(() => {
    setUser(null);
    setTab("posts");
    load();
  }, [load]);

  const posts = usePaged(`/post/${id}`, { enabled: tab === "posts" });
  const saved = usePaged(isMe ? `/post/fav/${id}` : null, { enabled: isMe && tab === "saved" });

  const onFollowToggled = (nowFollowing) =>
    setUser((current) => {
      if (!current) return current;
      const followers = current.followers || [];
      return {
        ...current,
        followers: nowFollowing
          ? [...followers, { followerId: currentUser.userId }]
          : followers.filter((row) => row.followerId !== currentUser.userId),
      };
    });

  const onSavedChange = (postId, patch, meta) => {
    if (meta?.saved === false) saved.removeItem(postId);
    else saved.updateItem(postId, patch);
  };

  if (status === 404 || status === 400) {
    return (
      <div className="card">
        <EmptyState
          icon={UserX}
          title="This profile doesn't exist"
          action={
            <Link to="/people" className="btn btn-primary">
              Find people
            </Link>
          }
        />
      </div>
    );
  }
  if (error) return <ErrorNote message={error} onRetry={load} />;
  if (!user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-xl2" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="page page-narrow">
      <ProfileHeader
        user={user}
        postCount={posts.total}
        isMe={isMe}
        onShowList={setListKind}
        onFollowToggled={onFollowToggled}
      />

      {isMe && (
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "posts", label: "Posts", icon: FileText },
            { value: "saved", label: "Saved", icon: Bookmark },
          ]}
        />
      )}

      {tab === "posts" ? (
        <PostList
          feed={posts}
          empty={{
            title: isMe ? "You haven't posted yet" : `${displayName(user)} hasn't posted yet`,
            action: isMe ? (
              <Link to="/write" className="btn btn-primary btn-sm">
                Write your first post
              </Link>
            ) : null,
          }}
        />
      ) : (
        <PostList
          feed={{ ...saved, updateItem: onSavedChange }}
          empty={{
            icon: Bookmark,
            title: "No saved posts",
            description: "Tap the bookmark on any post to save it for later.",
          }}
        />
      )}

      <FollowListModal userId={id} kind={listKind} onClose={() => setListKind(null)} />
    </div>
  );
}
