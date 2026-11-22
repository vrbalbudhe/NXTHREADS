import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { api, errorMessage } from "../../lib/api";
import Modal from "../ui/Modal";
import { EmptyState, ErrorNote, Skeleton } from "../ui/Feedback";
import UserRow from "./UserRow";

export default function FollowListModal({ userId, kind, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const open = Boolean(kind);

  useEffect(() => {
    if (!kind) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get(`/userfollow/${kind}/${userId}`)
      .then((res) => {
        if (cancelled) return;
        const rows = kind === "followers" ? res.data?.totalFollowers : res.data?.totalFollowings;
        setUsers(
          (rows || [])
            .map((row) => (kind === "followers" ? row.follower : row.following))
            .filter(Boolean)
        );
      })
      .catch((err) => !cancelled && setError(errorMessage(err, "Unable to load")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [kind, userId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={kind === "followers" ? "Followers" : "Following"}
      size="sm"
    >
      <ErrorNote message={error} />
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
      ) : users.length === 0 && !error ? (
        <EmptyState
          icon={Users}
          title={kind === "followers" ? "No followers yet" : "Not following anyone yet"}
        />
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <UserRow key={user.id} user={user} onNavigate={onClose} />
          ))}
        </div>
      )}
    </Modal>
  );
}
