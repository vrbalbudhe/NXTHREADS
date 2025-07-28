import axios from "axios";
import { useEffect, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import UserCard from "../../Components/UserCard/UserCard";
import { useFetchAllUsers } from "../../Loaders/users/useFetchAllUsers";

function OnlyUserSearch() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { loadUsers, users } = useFetchAllUsers();

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setIsSearching(true);
    if (term === "") {
      setFilteredUsers([]);
    } else {
      const filteredUsersData = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term)
      );
      setFilteredUsers(filteredUsersData);
    }
  };

  return (
    <div className="w-full min-h-[10px] flex flex-col justify-center items-center">
      <div className="flex w-full justify-center gap-2 items-center">
        <input
          className="w-[100%] h-10 border dark:bg-darkPostCardBackground dark:border-gray-700 pl-5 border-slate-400 text-gray-800 dark:text-white rounded-lg outline-none"
          type="search"
          placeholder="Search by username or email"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button
          className="p-2 dark:text-white bg-blue-500 dark:border-none text-xl text-black rounded-xl shadow-md border border-slate-300 hover:text-white hover:bg-slate-500"
          onClick={() => handleSearch({ target: { value: searchTerm } })}
        >
          <IoMdSearch />
        </button>
      </div>
      <div className="w-full mt-10">
        {isSearching && (
          <div className="w-full h-fit flex justify-start items-center gap-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))
            ) : (
              <div className="w-full min-h-[50px] flex justify-center items-center">
                <h1 className="text-3xl flex items-center gap-2">
                  <span className="text-sm font-medium dark:text-white text-gray-800">
                    No Users Found
                  </span>
                </h1>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OnlyUserSearch;
