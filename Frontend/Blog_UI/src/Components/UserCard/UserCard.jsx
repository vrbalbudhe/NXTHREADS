import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFollowUnfollowUser } from "../../Loaders/followers/useFollowUnfollowUser";
import { useCheckIsFollowing } from "../../Loaders/followers/useCheckIsFollowing";

const FALLBACK_AVATAR_URL =
  "https://i.pinimg.com/564x/7f/c4/c6/7fc4c6ecc7738247aac61a60958429d4.jpg";

function UserCard({ user, currentUser }) {
  const navigate = useNavigate();
  const { handleFollowUnfollow } = useFollowUnfollowUser();
  const { isFollowing, checkFollowing } = useCheckIsFollowing();

  // Always check backend for follow status
  useEffect(() => {
    if (currentUser?.userId && user.id) {
      checkFollowing({
        followerId: currentUser.userId,
        followingId: user.id,
      });
    }
  }, [user.id, currentUser?.userId, checkFollowing]);

  const handleFollowSwitch = async () => {
    if (!currentUser?.userId) return;
    await handleFollowUnfollow({
      followerId: currentUser.userId,
      followingId: user.id,
      userData: user,
      isCurrentlyFollowing: isFollowing,
    });
    // Refetch follow status from backend after action
    checkFollowing({
      followerId: currentUser.userId,
      followingId: user.id,
    });
  };

  if (currentUser?.userId === user.id) return null;

  return (
    <div className="w-[45%] md:w-[150px] dark:border-gray-700 dark:bg-darkPostCardBg min-h-[210px] shadow-md border-l border-r dark:border border-slate-200 rounded-xl">
      <div className="w-full min-h-[60%] flex justify-center items-center">
        <img
          className="h-28 w-full rounded-t-md object-cover"
          src={user.avatar || FALLBACK_AVATAR_URL}
          alt={`${user.username}'s avatar`}
        />
      </div>
      <div className="w-full min-h-[20%] flex flex-col justify-center items-center">
        <h1
          onClick={() => navigate(`/profile/${user.id}`)}
          className="text-slate-950 py-1 cursor-pointer dark:bg-gray-800 dark:text-slate-300 dark:text-[13px] hover:text-blue-400 w-full text-center font-semibold text-xs bg-slate-100"
        >
          @{user.username}
        </h1>
        <h1 className="text-slate-500 py-1 cursor-pointer w-full text-center font-semibold text-xs">
          {user.fullname || "Unregistered"}
        </h1>
      </div>
      <div className="w-full min-h-[20%] flex justify-center items-center">
        {currentUser && (
          <h1
            onClick={handleFollowSwitch}
            className={`cursor-pointer dark:text-white dark:bg-darkBlue rounded-md px-3 py-2 font-semibold text-xs ${isFollowing ? "bg-slate-200 " : "bg-slate-950 text-white"}`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </h1>
        )}
      </div>
    </div>
  );
}

export default UserCard;
