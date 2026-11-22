import { Link } from "react-router-dom";
import { displayName } from "../../lib/format";
import Avatar from "../ui/Avatar";
import FollowButton from "./FollowButton";

export default function UserRow({ user, action = "follow", onNavigate }) {
  return (
    <div className="flex items-center gap-3">
      <Link
        to={`/profile/${user.id}`}
        onClick={onNavigate}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Avatar user={user} size="sm" />
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[13px] font-semibold text-slate-900 dark:text-white">
            {displayName(user)}
          </span>
          <span className="block truncate text-[11px] muted">
            {user.reason || `@${user.username}`}
          </span>
        </span>
      </Link>
      {action === "follow" && <FollowButton userId={user.id} />}
    </div>
  );
}
