import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Search, Users } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { displayName } from "../lib/format";
import { useAuth } from "../Context/AuthContext";
import { useSocial } from "../Context/SocialContext";
import { useShellTitle } from "../Components/layout/ShellContext";
import Avatar from "../Components/ui/Avatar";
import Tabs from "../Components/ui/Tabs";
import { EmptyState, ErrorNote, Skeleton } from "../Components/ui/Feedback";
import FollowButton from "../Components/user/FollowButton";

function PersonCard({ user }) {
  return (
    <div className="card flex flex-col items-center p-5 text-center transition-shadow hover:shadow-lift">
      <Link to={`/profile/${user.id}`} className="flex flex-col items-center">
        <Avatar user={user} size="lg" />
        <span className="mt-3 max-w-full truncate text-sm font-semibold text-slate-900 dark:text-white">
          {displayName(user)}
        </span>
        <span className="max-w-full truncate text-xs muted">@{user.username}</span>
      </Link>
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

export default function People() {
  const { currentUser } = useAuth();
  const { isFollowing } = useSocial();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [tab, setTab] = useState("all");
  useShellTitle("People");

  useEffect(() => {
    api
      .get("/user")
      .then((res) => setUsers(res.data?.users || []))
      .catch((err) => setError(errorMessage(err, "Unable to load people")))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return users
      .filter((user) => user.id !== currentUser?.userId)
      .filter((user) => (tab === "following" ? isFollowing(user.id) : true))
      .filter(
        (user) =>
          !term ||
          user.username?.toLowerCase().includes(term) ||
          user.fullname?.toLowerCase().includes(term)
      );
  }, [users, filter, tab, isFollowing, currentUser]);

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Filter by name or username"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter people"
          />
        </div>
        <Tabs
          className="sm:w-64"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "all", label: "Everyone" },
            { value: "following", label: "Following" },
          ]}
        />
      </div>

      <ErrorNote message={error} />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-48 rounded-xl2" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title={tab === "following" ? "You're not following anyone yet" : "No people found"}
            description={tab === "following" ? "Follow writers from the Everyone tab." : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((user) => (
            <PersonCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
