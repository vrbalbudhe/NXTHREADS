import { useEffect, useState } from "react";
import { useFetchFollowers } from "../../Loaders/followers/useFetchFollowers";
import { useSelector, useDispatch } from "react-redux";
import { clearFollowData } from "../../ReduxThunkSlice/FollowersSlice";
import { Users } from "lucide-react";

const FollowerUserCard = ({ follower }) => {
  return (
    <div
      key={follower.id}
      className="flex items-center dark:bg-darkPostCardBackground border-gray-400 dark:border-gray-700 border gap-4 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-darkBackground cursor-pointer mb-2"
    >
      <div className="relative">
        <img
          className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
          src={follower.follower.avatar}
        />
      </div>
      <div className="flex flex-col">
        <h1 className="font-medium text-sm text-gray-800 dark:text-gray-200">
          {follower.follower.fullname}
        </h1>
        <h1 className="text-sm text-gray-500 dark:text-gray-400">
          {follower.follower.username}
        </h1>
      </div>
    </div>
  );
};

function FollowerCard({ userId }) {
  const dispatch = useDispatch();
  const { followers, error, loadFollowers } = useFetchFollowers();
  const reduxFollowers = useSelector((state) => state.follows.followers);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (userId) {
      dispatch(clearFollowData());
      loadFollowers(userId);
    }
  }, [userId, loadFollowers, dispatch]);

  const displayFollowers =
    reduxFollowers.length > 0 ? reduxFollowers : followers;

  const filteredFollowers = displayFollowers.filter((f) => {
    const name = f.follower.fullname?.toLowerCase() || "";
    const username = f.follower.username?.toLowerCase() || "";
    return (
      name.includes(search.toLowerCase()) ||
      username.includes(search.toLowerCase())
    );
  });

  return (
    <div className="w-[100%] h-fit flex justify-start items-start p-4 dark:bg-darkPostCardBackground border border-gray-400  dark:border-gray-700 flex-col rounded-2xl shadow-sm ">
      <div className="w-full flex justify-between items-center mb-4 gap-2">
        <div className="flex gap-2 items-center">
          <Users className="h-5 w-5 text-gray-400 mb-2" />
          <h1 className="text-sm dark:text-slate-400">Followers</h1>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="rounded-md px-2 py-1 text-sm border border-gray-400 dark:border-gray-700 bg-white dark:bg-darkPostCardBackground text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ minWidth: 120 }}
        />
      </div>
      {filteredFollowers.length === 0 && (
        <div className="w-full flex flex-col items-center justify-center py-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No followers yet
          </p>
        </div>
      )}
      <div className="min-h-[10px] w-full overflow-y-auto pr-2">
        {filteredFollowers.map((follower) => (
          <FollowerUserCard follower={follower} />
        ))}
      </div>
    </div>
  );
}

export default FollowerCard;
