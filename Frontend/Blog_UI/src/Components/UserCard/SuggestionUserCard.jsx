import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFollowUnfollowUser } from "../../Loaders/followers/useFollowUnfollowUser";
import { useCheckIsFollowing } from "../../Loaders/followers/useCheckIsFollowing";
import { UserRoundCheck } from "lucide-react";

const FALLBACK_AVATAR_URL =
  "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

function SuggestionUserCard({ user, currentUser }) {
  const navigate = useNavigate();
  const { handleFollowUnfollow } = useFollowUnfollowUser();
  const { isFollowing, checkFollowing } = useCheckIsFollowing();
  const [checkDone, setCheckDone] = useState(false);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (currentUser?.userId && user.id) {
        await checkFollowing({
          followerId: currentUser.userId,
          followingId: user.id,
        });
        setCheckDone(true);
      }
    };
    fetchFollowStatus();
  }, [user.id, currentUser?.userId]);

  const handleFollowSwitch = async () => {
    if (!currentUser?.userId) return;
    await handleFollowUnfollow({
      followerId: currentUser.userId,
      followingId: user.id,
      userData: user,
      isCurrentlyFollowing: isFollowing,
    });
    await checkFollowing({
      followerId: currentUser.userId,
      followingId: user.id,
    });
  };

  if (currentUser?.userId === user.id) return null;
  if (!checkDone || isFollowing) return null;

  return (
    <div className="w-full min-h-12 flex flex-wrap md:flex-nowrap items-center justify-between md:gap-0 md:justify-start px-3 py-2 md:p-2 bg-white dark:bg-darkPostCardBg border border-gray-400 dark:border-gray-700 rounded-2xl shadow-md">
      <div
        onClick={() => navigate(`/profile/${user.id}`)}
        className="flex items-center gap-3 md:gap-2 cursor-pointer md:w-full"
      >
        <img
          src={user.avatar || FALLBACK_AVATAR_URL}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex flex-col md:items-start md:w-full">
          <span className="text-sm font-medium text-gray-900 dark:text-blue-200 truncate">
            {user.username}
          </span>
          {user?.fullname && (
            <span className="text-xs font-normal text-gray-900 dark:text-gray-300 truncate">
              @{user?.fullname}
            </span>
          )}
        </div>
      </div>

      {currentUser && (
        <button
          onClick={handleFollowSwitch}
          className="text-xs font-semibold p-2 rounded-xl transition bg-gray-600 text-white hover:bg-blue-700"
        >
          <UserRoundCheck />
        </button>
      )}
    </div>
  );
}

export default SuggestionUserCard;
