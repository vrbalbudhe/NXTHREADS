import { Suspense, useContext, useEffect } from "react";
import UserCard from "../../Components/UserCard/UserCard";
import OnlyUserSearch from "../../Components/OnlyUserSearch/OnlyUserSearch";
import FollowerCard from "../../Components/FollowerCard/FollowerCard";
import { AuthContext } from "../../Context/AuthContext";
import FollowingCard from "../../Components/FollowingCard/FollowingCard";
import { useFetchAllUsers } from "../../Loaders/users/useFetchAllUsers";

function BloggersPage() {
  const { users, fetch_all_users_error, loadUsers } = useFetchAllUsers();
  const { currentUser } = useContext(AuthContext) || {};

  useEffect(() => {
    loadUsers();
  });
  return (
    <div className="w-full dark:border-none min-h-screen gap-5 mt-8 md:flex justify-center items-start">
      <div className="w-full md:w-[70%] h-full justify-center items-center">
        <div className="w-full h-fit overflow-auto flex flex-wrap justify-start items-center">
          <OnlyUserSearch />
        </div>
        <div className="w-full h-full flex flex-wrap justify-start items-start gap-3">
          {users?.length > 0 ? (
            users.map((user) => (
              <UserCard key={user.id} user={user} currentUser={currentUser} />
            ))
          ) : (
            <p>No users available</p>
          )}
        </div>
      </div>
      <div className="w-full md:w-[30%] flex justify-start flex-col items-start gap-3">
        <div className="w-full h-fit overflow-auto flex justify-start items-start">
          <FollowerCard userId={currentUser?.userId} />
        </div>
        <div className="w-full overflow-auto flex justify-start items-start">
          <FollowingCard userId={currentUser?.userId} />
        </div>
      </div>
    </div>
  );
}

export default BloggersPage;
