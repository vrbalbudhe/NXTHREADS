import { useNavigate } from "react-router-dom";
import { Check, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../Context/AuthContext";
import { useSocial } from "../../Context/SocialContext";

export default function FollowButton({ userId, size = "sm", onToggled, className = "" }) {
  const { currentUser } = useAuth();
  const { isFollowing, isPending, toggleFollow } = useSocial();
  const navigate = useNavigate();

  if (currentUser?.userId === userId) return null;

  const following = isFollowing(userId);
  const pending = isPending(userId);

  const handleClick = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    try {
      const result = await toggleFollow(userId);
      if (result !== null) onToggled?.(result);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={following}
      className={`btn ${size === "sm" ? "btn-sm" : ""} ${following ? "btn-secondary" : "btn-primary"} ${className}`}
    >
      {following ? <Check className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
      {following ? "Following" : "Follow"}
    </button>
  );
}
