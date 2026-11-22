import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileSearch, FileText, Search, UserRoundSearch, Users, X } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import { usePaged } from "../hooks/usePaged";
import { api, errorMessage } from "../lib/api";
import { useShellTitle } from "../Components/layout/ShellContext";
import Tabs from "../Components/ui/Tabs";
import { EmptyState, ErrorNote, Skeleton } from "../Components/ui/Feedback";
import PostList from "../Components/post/PostList";
import UserRow from "../Components/user/UserRow";
import { TopicsWidget } from "../Components/widgets/Widgets";

function PeopleResults({ query }) {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser || !query) {
      setUsers([]);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get("/user/search", { params: { q: query } })
      .then((res) => !cancelled && setUsers(res.data?.users || []))
      .catch((err) => !cancelled && setError(errorMessage(err, "Search failed")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query, currentUser]);

  if (!currentUser) {
    return (
      <div className="card">
        <EmptyState
          icon={Users}
          title="Sign in to search people"
          description="People search is available to members."
          action={
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign in
            </Link>
          }
        />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="card">
        <EmptyState
          icon={UserRoundSearch}
          title="Search for writers"
          description="Type a name or username above."
        />
      </div>
    );
  }

  return (
    <div className="card card-pad">
      <ErrorNote message={error} />
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-9" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={UserRoundSearch} title={`No people match "${query}"`} />
      ) : (
        <div className="space-y-3.5">
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState(params.get("q") || "");
  const [tab, setTab] = useState(params.get("tab") === "people" ? "people" : "posts");
  const query = useDebounce(input.trim(), 350);
  useShellTitle("Explore");

  useEffect(() => {
    const next = {};
    if (query) next.q = query;
    if (tab === "people") next.tab = "people";
    setParams(next, { replace: true });
  }, [query, tab, setParams]);

  const posts = usePaged(query ? "/post/search" : "/post", {
    params: query ? { q: query } : {},
    enabled: tab === "posts",
  });

  return (
    <div className="page-grid">
      <div className="min-w-0 space-y-4">
        <div className="card card-pad">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              autoFocus
              value={input}
              maxLength={100}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Search posts, authors or people"
              className="input h-12 pl-11 pr-10 text-[15px]"
              aria-label="Search"
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="icon-btn absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Tabs
            className="mt-3"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "posts", label: "Posts", icon: FileText },
              { value: "people", label: "People", icon: Users },
            ]}
          />
        </div>

        {tab === "posts" ? (
          <>
            <p className="px-1 text-xs muted">
              {query
                ? posts.loading
                  ? "Searching…"
                  : `${posts.total} ${posts.total === 1 ? "result" : "results"} for "${query}"`
                : "Latest posts from the community"}
            </p>
            <PostList
              feed={posts}
              empty={{
                icon: FileSearch,
                title: query ? `Nothing matches "${query}"` : "No posts yet",
                description: query ? "Try different keywords or browse topics." : undefined,
              }}
            />
          </>
        ) : (
          <PeopleResults query={query} />
        )}
      </div>
      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <TopicsWidget limit={14} />
        </div>
      </aside>
    </div>
  );
}
