import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Users } from "lucide-react";

const FollowingCard = ({ userId }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [totalFollowing, setTotalFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleFollowingData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${baseUrl}/api/userfollow/following/${userId}`,
        { withCredentials: true }
      );
      setTotalFollowing(res.data.totalFollowings);
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFollowingData();
  }, [userId]);

  const handleProfileClick = (username) => {
    navigate(`/profile/${username}`);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Following
          </h2>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-36 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Following
        </h2>
      </div>
      {totalFollowing.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No following yet
          </p>
        </div>
      ) : (
        <div className="h-[400px] overflow-y-auto pr-2">
          {totalFollowing.map((follower) => (
            <div
              key={follower.id}
              onClick={() => handleProfileClick(follower.following.username)}
              className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer mb-2"
            >
              <div className="relative">
                <img
                  src={follower.following.avatar}
                  alt={follower.following.fullname}
                  className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                  {follower.following.fullname}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  @{follower.following.username}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowingCard;
