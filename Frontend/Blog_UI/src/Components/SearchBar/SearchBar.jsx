/* eslint-disable no-unused-vars */
import axios from "axios";
import { useEffect, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { FiUsers } from "react-icons/fi";
import { FaRegFaceFrownOpen } from "react-icons/fa6";
import PostCard from "../../Components/PostCard/PostCard"; // Ensure this import path is correct
import UserCard from "../../Components/UserCard/UserCard"; // Ensure this import path is correct

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // Track if search has been performed

  useEffect(() => {
    dataFetcher();
  }, []);

  const dataFetcher = async () => {
    try {
      // Fetch posts
      const postRes = await axios.get("http://localhost:8000/api/post/", {
        withCredentials: true,
      });
      setPosts(postRes.data.posts || []);

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
      setFilteredPosts([]);
      setFilteredUsers([]);
    } else {
      const filteredPostsData = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(term) ||
          post.content.toLowerCase().includes(term)
      );
      setFilteredPosts(filteredPostsData);

      const filteredUsersData = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(term) || // Optional chaining
          user.email?.toLowerCase().includes(term) // Optional chaining
      );
      setFilteredUsers(filteredUsersData);
    }
  };

  return (
    <div className="w-full min-h-[90px] p-1 flex flex-col items-center mt-5">
      <div className="flex w-full justify-center gap-2 items-center">
        <input
          className="w-[90%] h-10 border-2 pl-5 dark:text-white dark:outline-none dark:bg-[#01161e] dark:border-gray-800 dark:border-2 border-slate-300 rounded-xl"
          type="search"
          placeholder="Search by title, content, or user"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button
          className="py-1 text-xl dark:border-none dark:text-white text-black rounded-full shadow-xl border border-slate-300 px-1 hover:text-white hover:bg-slate-500"
          onClick={() => handleSearch({ target: { value: searchTerm } })}
        >
          <IoMdSearch />
        </button>
      </div>
      <div className="w-full mt-10">
        {isSearching && (
          <>
            <div className="w-full h-fit flex justify-start items-center gap-2">
              {filteredUsers.length > 0
                ? filteredUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))
                : ""}
            </div>
            {filteredPosts.length > 0
              ? filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              : // <div className="w-full min-h-[50px] flex justify-center items-center">
                //   <h1 className="text-3xl flex items-center gap-2">
                //     <FaRegFaceFrownOpen className="text-3xl" />
                //     <span className="text-sm font-semibold">No Posts Found</span>
                //   </h1>
                // </div>
                ""}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
