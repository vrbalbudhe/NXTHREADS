import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFollowUnfollowUser } from "../../Loaders/followers/useFollowUnfollowUser";
import { useCheckIsFollowing } from "../../Loaders/followers/useCheckIsFollowing";

const FALLBACK_AVATAR_URL =
  "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

function UserCard({ user, currentUser }) {
  const navigate = useNavigate();
  const { handleFollowUnfollow } = useFollowUnfollowUser();
  const { isFollowing, checkFollowing } = useCheckIsFollowing();

  useEffect(() => {
    if (currentUser?.userId && user.id) {
      checkFollowing({
        followerId: currentUser.userId,
        followingId: user.id,
      });
    }
  }, [user.id, currentUser?.userId]);

  const handleFollowSwitch = async () => {
    if (!currentUser?.userId) return;
    await handleFollowUnfollow({
      followerId: currentUser.userId,
      followingId: user.id,
      userData: user,
      isCurrentlyFollowing: isFollowing,
    });
    checkFollowing({
      followerId: currentUser.userId,
      followingId: user.id,
    });
  };

  if (currentUser?.userId === user.id) return null;

  return (
    <div className="w-full md:w-[150px] flex md:flex-col items-center justify-between md:justify-start px-3 py-2 md:p-2 bg-white dark:bg-darkPostCardBg border-b md:border dark:border-gray-700 rounded-lg shadow-sm">
      {/* Avatar */}
      <div
        onClick={() => navigate(`/profile/${user.id}`)}
        className="flex items-center md:flex-col gap-3 md:gap-2 cursor-pointer md:w-full"
      >
        <img
          src={user.avatar || FALLBACK_AVATAR_URL}
          alt="avatar"
          className="w-10 h-10 md:w-20 md:h-20 rounded-full object-cover border"
        />
        <div className="flex flex-col md:items-center md:w-full">
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            @{user.username}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
            {user.fullname || "Unregistered"}
          </span>
        </div>
      </div>

      {/* Follow Button */}
      {currentUser && (
        <button
          onClick={handleFollowSwitch}
          className={`mt-0 md:mt-3 text-xs font-semibold px-3 py-1 rounded-md transition ${
            isFollowing
              ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
    </div>
  );
}

export default UserCard;
