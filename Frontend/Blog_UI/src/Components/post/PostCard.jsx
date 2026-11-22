import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { usePostActions } from "../../hooks/usePostActions";
import { displayName, readingTime, timeAgo } from "../../lib/format";
import Avatar from "../ui/Avatar";
import CategoryChip from "../ui/CategoryChip";
import Menu from "../ui/Menu";
import { ConfirmDialog } from "../ui/Modal";
import { Skeleton } from "../ui/Feedback";
import ImageGallery from "./ImageGallery";
import PostReactions from "./PostReactions";

export function PostAuthor({ post, size = "md" }) {
  const author = post.User || { username: post.author };
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Link to={`/profile/${post.userId}`} className="shrink-0">
        <Avatar user={author} size={size} />
      </Link>
      <div className="min-w-0 leading-tight">
        <Link
          to={`/profile/${post.userId}`}
          className="block truncate text-[13px] font-semibold text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
        >
          {displayName(author)}
        </Link>
        <p className="truncate text-[11px] muted">
          @{author.username} · <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time> ·{" "}
          {readingTime(post.content)} min read
        </p>
      </div>
    </div>
  );
}

export default function PostCard({ post, onChange, onRemove }) {
  const actions = usePostActions(post, onChange);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    const ok = await actions.remove();
    setConfirming(false);
    if (ok) onRemove?.(post.id);
  };

  return (
    <article className="card card-pad animate-slide-up transition-shadow hover:shadow-lift">
      <header className="flex items-start justify-between gap-3">
        <PostAuthor post={post} />
        <div className="flex shrink-0 items-center gap-1">
          <CategoryChip category={post.category} />
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
      </header>

      <Link to={`/post/${post.id}`} className="group mt-3 block">
        <h2 className="text-[17px] font-bold leading-snug tracking-tight text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
          {post.title}
        </h2>
        {post.subtitle && (
          <p className="mt-1 text-[13px] font-medium text-slate-600 dark:text-slate-300">
            {post.subtitle}
          </p>
        )}
        <p className="mt-2 line-clamp-3 whitespace-pre-line text-[13px] leading-relaxed muted">
          {post.content}
        </p>
      </Link>

      {post.images?.length > 0 && (
        <div className="mt-3">
          <ImageGallery images={post.images} />
        </div>
      )}

      <div className="mt-3 border-t border-line pt-2 dark:border-line-dark">
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

export function PostCardSkeleton() {
  return (
    <div className="card card-pad">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2.5 w-48" />
        </div>
      </div>
      <Skeleton className="mt-4 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-1.5 h-3 w-5/6" />
      <Skeleton className="mt-4 h-8 w-full" />
    </div>
  );
}
