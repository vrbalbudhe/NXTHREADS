/* eslint-disable no-unused-vars */
import axios from "axios";
import { useEffect, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import UserCard from "../../Components/UserCard/UserCard"; // Ensure this import path is correct

function OnlyUserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // Track if search has been performed

  useEffect(() => {
    dataFetcher();
  }, []);

  const dataFetcher = async () => {
    try {
      // Fetch users
      const userRes = await axios.get("http://localhost:8000/api/user/", {
        withCredentials: true,
      });
      // console.log("Fetched Users:", userRes.data.users); // Debugging line
      setUsers(userRes.data.users || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setIsSearching(true); // Set searching state to true when search is initiated

    if (term === "") {
      setFilteredUsers([]);
    } else {
      const filteredUsersData = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(term) || // Optional chaining
          user.email?.toLowerCase().includes(term) // Optional chaining
      );
      setFilteredUsers(filteredUsersData);
    }
  };

  return (
    <div className="w-full min-h-[10px] p-1 flex flex-col justify-center items-center">
      <div className="flex w-full justify-center gap-2 items-center">
        <input
          className="w-[90%] p-1 border-2 dark:bg-darkBackground dark:border-darkBlue pl-5 border-slate-300 h-8 rounded-2xl"
          type="search"
          placeholder="Search by username or email"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button
          className="py-1 dark:text-white dark:border-none text-xl text-black rounded-full shadow-xl border border-slate-300 px-1 hover:text-white hover:bg-slate-500"
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
                  <span className="text-sm font-semibold">No Users Found</span>
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
