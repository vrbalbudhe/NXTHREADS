/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";

const FALLBACK_AVATAR_URL =
  "https://i.pinimg.com/564x/7f/c4/c6/7fc4c6ecc7738247aac61a60958429d4.jpg";

function UserCard({ user }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkFollowingStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/userfollow/status`,
          {
            params: {
              followerId: currentUser?.userId,
              followingId: user.id,
            },
            withCredentials: true,
          }
        );
        setIsFollowing(response.data.isFollowing);
      } catch (error) {
        console.error("Failed to fetch follow status", error);
      }
    };

    checkFollowingStatus();
  }, [user.id, currentUser.userId]);

  const handleFollowSwitch = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/userfollow/follow",
        {
          followerId: currentUser?.userId,
          followingId: user.id,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setIsFollowing((prevState) => !prevState);
    } catch (error) {
      console.error("Failed to toggle follow status", error);
    }
  };

  if (currentUser?.userId === user.id) return null;

  return (
    <div className="w-[130px] dark:border-slate-900 dark:rounded-2xl dark:bg-darkPostCardBackground h-[180px] hover:scale-105 duration-300 shadow-md border-l border-r dark:border border-slate-200 rounded-sm">
      <div className="w-full h-[60%] flex justify-center items-center">
        <img
          className="h-20 w-20 rounded-full object-cover"
          src={user.avatar || FALLBACK_AVATAR_URL}
          alt={`${user.username}'s avatar`}
        />
      </div>
      <div className="w-full h-[20%] flex flex-col justify-center items-center">
        <h1
          onClick={() => navigate(`/profile/${user.id}`)}
          className="text-slate-950 py-1 cursor-pointer dark:bg-darkPostCardBackground dark:text-slate-300 dark:text-[13px] hover:text-blue-400 w-full text-center font-semibold text-xs bg-slate-100"
        >
          @{user.username}
        </h1>
        <h1 className="text-slate-500 py-1 cursor-pointer w-full text-center font-semibold text-xs">
          {user.fullname}
        </h1>
      </div>
      <div className="w-full h-[20%] flex justify-center items-center">
        {currentUser && (
          <h1
            onClick={handleFollowSwitch}
            className={`cursor-pointer dark:text-white dark:bg-darkBlue rounded-md px-3 py-1 font-semibold text-xs ${isFollowing ? "bg-slate-200 " : "bg-slate-950 text-white"}`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </h1>
        )}
      </div>
    </div>
  );
}

export default UserCard;
