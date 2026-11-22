import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Search, Sparkles, UserCheck, Users } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { displayName } from "../lib/format";
import { useAuth } from "../Context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import { useShellTitle } from "../Components/layout/ShellContext";
import Avatar from "../Components/ui/Avatar";
import Tabs from "../Components/ui/Tabs";
import { EmptyState, ErrorNote, Skeleton } from "../Components/ui/Feedback";
import FollowButton from "../Components/user/FollowButton";

const SUGGESTION_COUNT = 12;

function PersonCard({ user }) {
  return (
    <div className="card card-pad flex flex-col items-center text-center transition-shadow hover:shadow-lift">
      <Link to={`/profile/${user.id}`} className="flex max-w-full flex-col items-center">
        <Avatar user={user} size="lg" />
        <span className="mt-3 max-w-full truncate text-sm font-semibold text-slate-900 dark:text-white">
          {displayName(user)}
        </span>
        <span className="max-w-full truncate text-xs muted">@{user.username}</span>
      </Link>
      {user.reason && (
        <span className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-[11px] font-semibold text-brand-600 dark:text-brand-400">
          <Sparkles className="h-3 w-3 shrink-0" />
          <span className="truncate">{user.reason}</span>
        </span>
      )}
      <div className="mt-4 flex w-full gap-2">
        <FollowButton userId={user.id} className="flex-1" />
        <Link
          to={`/messages?user=${user.id}`}
          className="btn btn-secondary btn-sm"
          aria-label={`Message ${displayName(user)}`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Loads only what is shown: ranked suggestions, the people you follow, or a server-side
 * search. The page no longer downloads every account.
 */
function usePeople(tab, term, userId) {
  const [state, setState] = useState({ users: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    const request = term
      ? api.get("/user/search", { params: { q: term } }).then((res) => res.data?.users || [])
      : tab === "following"
        ? api
            .get(`/userfollow/following/${userId}`)
            .then((res) => (res.data?.totalFollowings || []).map((row) => row.following))
        : api
            .get("/user/suggestions", { params: { limit: SUGGESTION_COUNT } })
            .then((res) => res.data?.users || []);

    request
      .then((users) => {
        if (!cancelled) {
          setState({
            users: users.filter((user) => user && user.id !== userId),
            loading: false,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            users: [],
            loading: false,
            error: errorMessage(err, "Unable to load people"),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tab, term, userId]);

  return state;
}

export default function People() {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState("");
  const [tab, setTab] = useState("suggested");
  const term = useDebounce(filter.trim(), 300);
  const { users, loading, error } = usePeople(tab, term, currentUser?.userId);
  useShellTitle("People");

  const empty = term
    ? { icon: Search, title: `No one matches “${term}”` }
    : tab === "following"
      ? {
          icon: UserCheck,
          title: "You're not following anyone yet",
          description: "Follow writers from the Suggested tab.",
        }
      : {
          icon: Users,
          title: "No suggestions right now",
          description: "Pick topics in Settings or search for someone by name.",
        };

  return (
    <div className="page">
      <div className="card card-pad flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search everyone by name or username"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Search people"
            maxLength={100}
          />
        </div>
        <Tabs
          className="sm:w-72"
          value={tab}
          onChange={(value) => {
            setTab(value);
            setFilter("");
          }}
          tabs={[
            { value: "suggested", label: "Suggested", icon: Sparkles },
            { value: "following", label: "Following", icon: UserCheck },
          ]}
        />
      </div>

      {!term && tab === "suggested" && !loading && users.length > 0 && (
        <p className="text-xs muted">
          Picked for you from who your friends follow, your topics and who follows you.
        </p>
      )}

      <ErrorNote message={error} />

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-48 rounded-xl2" />
          ))}
        </div>
      ) : users.length === 0 ? (
        !error && (
          <div className="card">
            <EmptyState {...empty} />
          </div>
        )
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {users.map((user) => (
            <PersonCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
