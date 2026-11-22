import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MessagesSquare, SendHorizontal, Smile, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { api, errorMessage } from "../../lib/api";
import { displayName, formatDate, formatTime } from "../../lib/format";
import { useAuth } from "../../Context/AuthContext";
import Avatar from "../ui/Avatar";
import { EmptyState, ErrorNote, Notice, Skeleton, Spinner } from "../ui/Feedback";
import { ConfirmDialog } from "../ui/Modal";

const MAX_LENGTH = 2000;
const QUICK_REACTIONS = ["👍", "🔥", "👏", "💡", "😂"];

function Comment({ comment, canDelete, onDelete, isPostAuthor }) {
  const author = comment.user || {};
  return (
    <li className="group flex gap-3">
      <Link to={`/profile/${author.id}`} className="shrink-0">
        <Avatar user={author} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="rounded-xl2 rounded-tl-md bg-slate-50 px-3.5 py-2.5 dark:bg-white/[0.04]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Link
              to={`/profile/${author.id}`}
              className="break-all text-[13px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              {displayName(author)}
            </Link>
            {isPostAuthor && (
              <span className="chip bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300">
                Author
              </span>
            )}
            {comment.createdAt && (
              <span className="whitespace-nowrap text-[11px] muted">
                {formatDate(comment.createdAt, { day: "numeric", month: "short" })} ·{" "}
                {formatTime(comment.createdAt)}
              </span>
            )}
          </div>
          <p className="mt-1 whitespace-pre-line break-words text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
            {comment.description}
          </p>
        </div>
      </div>
      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(comment)}
          className="icon-btn mt-1 h-8 w-8 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100 dark:hover:bg-rose-500/10"
          aria-label="Delete comment"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}

export function CommentComposer({ onSubmit, disabled }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const inputRef = useRef(null);

  const submit = async (event) => {
    event?.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    const ok = await onSubmit(value);
    setSending(false);
    if (ok) setText("");
  };

  return (
    <form onSubmit={submit} className="relative">
      {showReactions && (
        <div className="absolute bottom-full left-0 mb-2 flex gap-1 rounded-xl border border-line bg-panel p-1 shadow-lift dark:border-line-dark dark:bg-panel-dark">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setText((value) => `${value}${emoji}`);
                setShowReactions(false);
                inputRef.current?.focus();
              }}
              className="h-8 w-8 rounded-lg text-base hover:bg-slate-100 dark:hover:bg-white/5"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-1 rounded-xl border border-line bg-white px-2 py-1.5 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 dark:border-line-dark dark:bg-white/[0.03]">
        <button
          type="button"
          onClick={() => setShowReactions((value) => !value)}
          className="icon-btn h-8 w-8 shrink-0"
          aria-label="Add emoji"
          disabled={disabled}
        >
          <Smile className="h-[18px] w-[18px]" />
        </button>
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          maxLength={MAX_LENGTH}
          disabled={disabled || sending}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) submit(event);
          }}
          placeholder={disabled ? "Sign in to join the discussion" : "Write a comment…"}
          className="max-h-32 min-h-[32px] flex-1 resize-none bg-transparent py-1.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          aria-label="Comment"
        />
        <button
          type="submit"
          disabled={disabled || sending || !text.trim()}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-600 transition-colors hover:bg-brand-50 disabled:text-slate-300 dark:hover:bg-brand-500/10 dark:disabled:text-slate-600"
          aria-label="Send comment"
        >
          {sending ? <Spinner /> : <SendHorizontal className="h-[18px] w-[18px]" />}
        </button>
      </div>
    </form>
  );
}

export default function CommentThread({ post, onCountChange }) {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/comment/${post.id}`);
      setComments(res.data?.data || []);
    } catch (err) {
      setError(errorMessage(err, "Unable to load the discussion"));
    } finally {
      setLoading(false);
    }
  }, [post.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!loading && !error) onCountChange?.(comments.length);
  }, [comments.length, loading, error, onCountChange]);

  const addComment = async (description) => {
    try {
      const res = await api.post("/comment/create", { postId: post.id, description });
      setComments((current) => [...current, res.data.newComment]);
      return true;
    } catch (err) {
      toast.error(errorMessage(err, "Could not post your comment"));
      return false;
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/comment/delete/${pendingDelete.id}`);
      setComments((current) => current.filter((comment) => comment.id !== pendingDelete.id));
      toast.success("Comment deleted");
      setPendingDelete(null);
    } catch (err) {
      toast.error(errorMessage(err, "Could not delete the comment"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section id="discussion" className="card scroll-mt-24">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-line-dark sm:px-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <MessagesSquare className="h-4 w-4 text-brand-600" />
          Discussion
          <span className="chip bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {comments.length}
          </span>
        </h2>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <Notice icon={MessagesSquare}>
          Keep it kind and on topic. Comments are public and visible to everyone who reads this
          post.
        </Notice>

        <ErrorNote message={error} onRetry={load} />

        {loading ? (
          <div className="space-y-4">
            {[0, 1].map((key) => (
              <div key={key} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-16 flex-1 rounded-xl2" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 && !error ? (
          <EmptyState
            icon={MessagesSquare}
            title="No comments yet"
            description="Start the discussion with the first comment."
          />
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                isPostAuthor={comment.commentor === post.userId}
                canDelete={
                  Boolean(currentUser) &&
                  (comment.commentor === currentUser.userId || post.userId === currentUser.userId)
                }
                onDelete={setPendingDelete}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="sticky bottom-[72px] rounded-b-xl2 border-t border-line bg-panel/95 px-4 py-3 backdrop-blur dark:border-line-dark dark:bg-panel-dark/95 sm:px-5 lg:bottom-0">
        {currentUser ? (
          <CommentComposer onSubmit={addComment} />
        ) : (
          <p className="text-center text-[13px] muted">
            <Link to="/login" className="link">
              Sign in
            </Link>{" "}
            to join the discussion.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Delete comment?"
        message="This comment will be removed for everyone."
        confirmLabel="Delete"
      />
    </section>
  );
}
