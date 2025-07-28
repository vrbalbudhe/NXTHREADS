import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { useFetchFollowings } from "../../Loaders/followers/useFetchFollowings";
import { useSelector, useDispatch } from "react-redux";
import { clearFollowData } from "../../ReduxThunkSlice/FollowersSlice";

const FollowingUserCard = ({ follower }) => {
  const navigate = useNavigate();

  const handleProfileClick = (id) => {
    navigate(`/profile/${id}`);
  };
  return (
    <div
      key={follower.id}
      onClick={() => handleProfileClick(follower.following.id)}
      className="flex items-center dark:bg-darkPostCardBackground border-gray-400 dark:border-gray-700 border gap-4 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-darkBackground cursor-pointer mb-2"
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
  );
};

const FollowingCard = ({ userId }) => {
  const dispatch = useDispatch();
  const { followings, error, loadFollowings } = useFetchFollowings();
  const reduxFollowings = useSelector((state) => state.follows.followings);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (userId) {
      dispatch(clearFollowData());
      loadFollowings(userId);
    }
  }, [userId, loadFollowings, dispatch]);

  const displayFollowings =
    reduxFollowings.length > 0 ? reduxFollowings : followings;

  const filteredFollowings = displayFollowings.filter((f) => {
    const name = f.following.fullname?.toLowerCase() || "";
    const username = f.following.username?.toLowerCase() || "";
    return (
      name.includes(search.toLowerCase()) ||
      username.includes(search.toLowerCase())
    );
  });

  if (!filteredFollowings) {
    return (
      <div className="min-h-fit bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Following
          </h2>
        </div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full  bg-white dark:bg-darkPostCardBackground border border-gray-400 dark:border-gray-700 rounded-2xl shadow-md p-4">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Following
          </h2>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="rounded-md px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-darkPostCardBackground text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ minWidth: 120 }}
        />
      </div>
      {filteredFollowings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No following yet
          </p>
        </div>
      ) : (
        <div className="min-h-[10px] overflow-y-auto pr-2">
          {filteredFollowings.map((follower) => (
            <FollowingUserCard follower={follower} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowingCard;
