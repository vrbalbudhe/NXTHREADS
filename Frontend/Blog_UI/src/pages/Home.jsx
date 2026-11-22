import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Rss, Sparkles, Users } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { usePaged } from "../hooks/usePaged";
import { useShellTitle } from "../Components/layout/ShellContext";
import PostList from "../Components/post/PostList";
import Tabs from "../Components/ui/Tabs";
import {
  ComposerPrompt,
  ProfileCompletionWidget,
  TopicsWidget,
  WhoToFollowWidget,
} from "../Components/widgets/Widgets";

function GuestHero() {
  return (
    <section className="card relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-brand-400/30 to-violet-400/30 blur-3xl" />
      <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
        <Sparkles className="h-3 w-3" /> A home for curious writers
      </span>
      <h2 className="mt-3 max-w-lg text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        Write, discover and discuss ideas that matter.
      </h2>
      <p className="mt-2 max-w-lg text-[13px] muted">
        Follow writers you like, join threaded discussions and chat in real time.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link to="/register" className="btn btn-primary btn-lg">
          Create free account
        </Link>
        <Link to="/explore" className="btn btn-secondary btn-lg">
          Explore posts
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  const { currentUser } = useAuth();
  const [selectedTab, setTab] = useState("following");
  const tab = currentUser ? selectedTab : "latest";
  useShellTitle("Home");

  const following = usePaged(currentUser ? `/post/gfp/${currentUser.userId}` : null, {
    enabled: Boolean(currentUser) && tab === "following",
  });
  const latest = usePaged("/post", { enabled: tab === "latest" });
  const feed = tab === "following" ? following : latest;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-4">
        {currentUser ? <ComposerPrompt /> : <GuestHero />}

        {currentUser && (
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "following", label: "For you", icon: Rss },
              { value: "latest", label: "Latest", icon: Clock },
            ]}
          />
        )}

        <PostList
          feed={feed}
          empty={
            tab === "following"
              ? {
                  icon: Users,
                  title: "Your feed is quiet",
                  description:
                    "Follow writers to see their posts here, or check out the latest posts.",
                  action: (
                    <div className="flex gap-2">
                      <Link to="/people" className="btn btn-primary btn-sm">
                        Find people
                      </Link>
                      <button
                        type="button"
                        onClick={() => setTab("latest")}
                        className="btn btn-secondary btn-sm"
                      >
                        Latest posts
                      </button>
                    </div>
                  ),
                }
              : { title: "No posts yet", description: "Be the first to publish something." }
          }
        />
      </div>

      <aside className="hidden space-y-4 lg:block">
        <div className="sticky top-20 space-y-4">
          <ProfileCompletionWidget />
          <WhoToFollowWidget />
          <TopicsWidget />
        </div>
      </aside>
    </div>
  );
}
