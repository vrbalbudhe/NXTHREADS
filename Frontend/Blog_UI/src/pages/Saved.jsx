import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { usePaged } from "../hooks/usePaged";
import { useShellTitle } from "../Components/layout/ShellContext";
import PostList from "../Components/post/PostList";

export default function Saved() {
  const { currentUser } = useAuth();
  const saved = usePaged(`/post/fav/${currentUser.userId}`);
  useShellTitle("Saved");

  const onChange = (postId, patch, meta) => {
    if (meta?.saved === false) saved.removeItem(postId);
    else saved.updateItem(postId, patch);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="card card-pad flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          <Bookmark className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Saved posts
          </h2>
          <p className="text-xs muted">
            {saved.loading ? "Loading" : `${saved.total} saved for later`}
          </p>
        </div>
      </div>
      <PostList
        feed={{ ...saved, updateItem: onChange }}
        empty={{
          icon: Bookmark,
          title: "Nothing saved yet",
          description: "Tap the bookmark on any post to keep it here.",
          action: (
            <Link to="/explore" className="btn btn-primary btn-sm">
              Explore posts
            </Link>
          ),
        }}
      />
    </div>
  );
}
