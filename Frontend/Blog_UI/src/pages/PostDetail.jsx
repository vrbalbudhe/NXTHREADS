import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  FileQuestion,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { categoryLabel, displayName, formatDate, formatTime, readingTime } from "../lib/format";
import { useAuth } from "../Context/AuthContext";
import { usePostActions } from "../hooks/usePostActions";
import { useShellTitle } from "../Components/layout/ShellContext";
import Avatar from "../Components/ui/Avatar";
import Breadcrumbs from "../Components/ui/Breadcrumbs";
import CategoryChip from "../Components/ui/CategoryChip";
import Menu from "../Components/ui/Menu";
import { ConfirmDialog } from "../Components/ui/Modal";
import { EmptyState, ErrorNote, Skeleton } from "../Components/ui/Feedback";
import ImageGallery from "../Components/post/ImageGallery";
import PostReactions from "../Components/post/PostReactions";
import CommentThread from "../Components/post/CommentThread";
import FollowButton from "../Components/user/FollowButton";
import { WidgetCard } from "../Components/widgets/Widgets";

function AuthorCard({ post }) {
  const { currentUser } = useAuth();
  const author = post.User || { username: post.author };
  return (
    <WidgetCard title="About the author">
      <Link to={`/profile/${post.userId}`} className="flex items-center gap-3">
        <Avatar user={author} size="lg" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
            {displayName(author)}
          </span>
          <span className="block truncate text-xs muted">@{author.username}</span>
        </span>
      </Link>
      <div className="mt-4 flex gap-2">
        <FollowButton userId={post.userId} className="flex-1" />
        {currentUser && currentUser.userId !== post.userId && (
          <Link to={`/messages?user=${post.userId}`} className="btn btn-secondary btn-sm flex-1">
            <MessageSquare className="h-3.5 w-3.5" /> Message
          </Link>
        )}
        {currentUser?.userId === post.userId && (
          <Link to={`/profile/${post.userId}`} className="btn btn-secondary btn-sm flex-1">
            View profile
          </Link>
        )}
      </div>
    </WidgetCard>
  );
}

function RelatedPosts({ post }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    api
      .get(`/post/related/${post.id}`, { params: { limit: 5 } })
      .then((res) => !cancelled && setItems(res.data?.posts || []))
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [post.id]);

  return (
    <WidgetCard
      title="Recommended reads"
      action={
        <Link to={`/topics?category=${post.category}`} className="text-[11px] link">
          More in {categoryLabel(post.category)}
        </Link>
      }
    >
      {!items ? (
        <div className="space-y-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-10" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs muted">No related posts yet.</p>
      ) : (
        <ul className="divide-y divide-line dark:divide-line-dark">
          {items.map((item) => (
            <li key={item.id}>
              <Link to={`/post/${item.id}`} className="group block py-2.5">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {item.reason}
                </span>
                <span className="mt-0.5 line-clamp-2 text-[13px] font-semibold text-slate-800 group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-[11px] muted">
                  {displayName(item.User)} ·{" "}
                  {formatDate(item.createdAt, { day: "numeric", month: "short" })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

function PostBody({ post, setPost }) {
  const navigate = useNavigate();
  const onChange = useCallback(
    (id, patch) =>
      setPost((current) => ({
        ...current,
        ...(typeof patch === "function" ? patch(current) : patch),
      })),
    [setPost]
  );
  const actions = usePostActions(post, onChange);
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    const ok = await actions.remove();
    setConfirming(false);
    if (ok) navigate("/", { replace: true });
  };

  return (
    <article className="card overflow-hidden">
      <div className="border-b border-line px-4 py-4 dark:border-line-dark sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CategoryChip category={post.category} />
            <h1 className="mt-2 text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              {post.title}
            </h1>
            {post.subtitle && (
              <p className="mt-1.5 text-[14px] font-medium text-slate-600 dark:text-slate-300">
                {post.subtitle}
              </p>
            )}
          </div>
          {actions.isOwner && (
            <Menu
              trigger={<MoreHorizontal className="h-4 w-4" />}
              label="Post options"
              items={[
                {
                  label: "Edit post",
                  icon: Pencil,
                  onSelect: () => navigate(`/post/${post.id}/edit`),
                },
                {
                  label: "Delete post",
                  icon: Trash2,
                  danger: true,
                  onSelect: () => setConfirming(true),
                },
              ]}
            />
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs muted">
          <Link
            to={`/profile/${post.userId}`}
            className="inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-brand-600 dark:text-slate-200"
          >
            <Avatar user={post.User} size="xs" />
            {displayName(post.User)}
          </Link>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(post.createdAt)} · {formatTime(post.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {readingTime(post.content)} min read
          </span>
        </div>
      </div>

      <div className="space-y-5 px-4 py-5 sm:px-5">
        {post.images?.length > 0 && <ImageGallery images={post.images} max={4} />}
        <div className="whitespace-pre-line break-words text-[15px] leading-8 text-slate-700 dark:text-slate-200">
          {post.content}
        </div>
      </div>

      <div className="border-t border-line px-4 py-2 dark:border-line-dark sm:px-5">
        <PostReactions post={post} actions={actions} />
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={handleDelete}
        busy={actions.busy === "delete"}
        title="Delete this post?"
        message="The post, its comments, likes and saves will be removed permanently."
        confirmLabel="Delete post"
      />
    </article>
  );
}

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(0);
  useShellTitle(post ? categoryLabel(post.category) : "Post");

  const load = useCallback(async () => {
    setError(null);
    setStatus(0);
    try {
      const res = await api.get(`/post/get/${id}`);
      setPost(res.data.post);
      document.title = `${res.data.post.title} · NXTHREADS`;
    } catch (err) {
      setStatus(err?.response?.status || 0);
      setError(errorMessage(err, "Unable to load this post"));
    }
  }, [id]);

  useEffect(() => {
    setPost(null);
    load();
  }, [load]);

  useEffect(() => {
    if (post && window.location.hash === "#discussion") {
      setTimeout(
        () => document.getElementById("discussion")?.scrollIntoView({ behavior: "smooth" }),
        150
      );
    }
  }, [post]);

  const setCommentCount = useCallback(
    (count) =>
      setPost((current) =>
        current && current.commentCount !== count ? { ...current, commentCount: count } : current
      ),
    []
  );

  if (status === 404 || status === 400) {
    return (
      <div className="card">
        <EmptyState
          icon={FileQuestion}
          title="This post doesn't exist"
          description="It may have been deleted by its author."
          action={
            <Link to="/" className="btn btn-primary">
              Back to home
            </Link>
          }
        />
      </div>
    );
  }

  if (error) return <ErrorNote message={error} onRetry={load} />;

  if (!post) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="card card-pad space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Topics", to: "/topics" },
          { label: categoryLabel(post.category), to: `/topics?category=${post.category}` },
          { label: post.title },
        ]}
      />
      <div className="page-grid">
        <div className="min-w-0 space-y-4">
          <PostBody post={post} setPost={setPost} />
          <CommentThread post={post} onCountChange={setCommentCount} />
        </div>
        <aside className="space-y-4">
          <div className="space-y-4 lg:sticky lg:top-20">
            <AuthorCard post={post} />
            <RelatedPosts post={post} />
          </div>
        </aside>
      </div>
    </div>
  );
}
