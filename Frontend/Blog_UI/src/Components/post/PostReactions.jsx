import { Link } from "react-router-dom";
import { Bookmark, Heart, MessageCircle, Share2, ThumbsDown } from "lucide-react";
import { formatCount } from "../../lib/format";

const base =
  "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors disabled:opacity-60";
const idle =
  "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white";

export default function PostReactions({ post, actions, showComments = true }) {
  const viewer = post.viewer || {};
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={actions.like}
        disabled={Boolean(actions.reacting)}
        aria-pressed={viewer.liked}
        aria-label="Like"
        className={`${base} ${viewer.liked ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" : idle}`}
      >
        <Heart className="h-4 w-4" fill={viewer.liked ? "currentColor" : "none"} />
        {formatCount(post.likes)}
      </button>
      <button
        type="button"
        onClick={actions.dislike}
        disabled={Boolean(actions.reacting)}
        aria-pressed={viewer.disliked}
        aria-label="Dislike"
        className={`${base} ${viewer.disliked ? "bg-slate-200 text-slate-800 dark:bg-white/10 dark:text-white" : idle}`}
      >
        <ThumbsDown className="h-4 w-4" fill={viewer.disliked ? "currentColor" : "none"} />
        {formatCount(post.unlikes)}
      </button>
      {showComments && (
        <Link
          to={`/post/${post.id}#discussion`}
          className={`${base} ${idle}`}
          aria-label="Comments"
        >
          <MessageCircle className="h-4 w-4" />
          {formatCount(post.commentCount)}
        </Link>
      )}
      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={actions.share}
          className={`${base} ${idle}`}
          aria-label="Share"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={actions.toggleSave}
          disabled={actions.saving}
          aria-pressed={viewer.saved}
          aria-label={viewer.saved ? "Remove from saved" : "Save"}
          className={`${base} ${viewer.saved ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300" : idle}`}
        >
          <Bookmark className="h-4 w-4" fill={viewer.saved ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}
