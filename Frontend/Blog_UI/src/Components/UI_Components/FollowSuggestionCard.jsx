import { AtomIcon } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import SuggestionUserCard from "../UserCard/SuggestionUserCard";
import { useFetchAllUsers } from "../../Loaders/users/useFetchAllUsers";
import { AuthContext } from "../../Context/AuthContext";

function FollowSuggestionCard() {
  const { users, fetch_all_users_error, loadUsers } = useFetchAllUsers();
  const { currentUser } = useContext(AuthContext) || {};
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  const containerStyle = "max-h-96 overflow-y-auto scrollbar-hide";
  const scrollbarHideStyle = `
    /* Hide scrollbar for Chrome, Safari and Opera */
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;

  return (
    <>
      <style>{scrollbarHideStyle}</style>
      <div className="border border-gray-300 select-none shadow-md w-full min-h-40 p-1 rounded-2xl dark:border-gray-700">
        <div className="w-full p-1 min-h-12 flex justify-start items-center gap-2 border-b border-gray-300 dark:border-gray-700">
          <span className="text-violet-500">
            <AtomIcon size={20} />
          </span>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Follow Users
          </p>
        </div>

        <div className={`w-full p-1 flex flex-col gap-2 ${containerStyle}`}>
          {users?.length > 0 ? (
            users
              .slice(0, visibleCount)
              .map((user) => (
                <SuggestionUserCard
                  key={user.id}
                  user={user}
                  currentUser={currentUser}
                />
              ))
          ) : (
            <p className="w-full text-center py-6 dark:text-white text-gray-800">
              No users available
            </p>
          )}
        </div>

        {users && visibleCount < users.length && (
          <div className="w-full flex justify-center py-2">
            <button
              onClick={handleShowMore}
              className="text-xs font-semibold px-3 py-1 rounded-md bg-gray-600 text-white hover:bg-blue-700 transition"
            >
              Show more
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default FollowSuggestionCard;
