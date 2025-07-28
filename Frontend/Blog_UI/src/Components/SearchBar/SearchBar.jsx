import axios from "axios";
import { useEffect, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import PostCard from "../../Components/PostCard/PostCard";
import UserCard from "../../Components/UserCard/UserCard";

function SearchBar({ posts, users }) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setIsSearching(true);

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
          user.username?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term)
      );
      setFilteredUsers(filteredUsersData);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center md:justify-start">
      <div className="flex w-full justify-center gap-2 items-center">
        <input
          className="w-[100%] h-10 border pl-5 dark:text-white dark:outline-none dark:bg-darkPostCardBg dark:border-gray-700 dark:border border-gray-300 rounded-2xl"
          type="search"
          placeholder="Search by title, content, or user"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button
          className="py-2 text-xl dark:border-none bg-blue-500 dark:text-white text-black rounded-md shadow-xl border border-slate-300 px-2 hover:text-white hover:bg-slate-500"
          onClick={() => handleSearch({ target: { value: searchTerm } })}
        >
          <IoMdSearch />
        </button>
      </div>
      <div className="w-full mt-4">
        {isSearching && (
          <>
            <div className="w-full h-fit flex justify-start items-center gap-2">
              {filteredUsers.length > 0
                ? filteredUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))
                : ""}
            </div>
            <div className="w-full h-fit flex flex-col justify-start items-center gap-2">
              {filteredPosts.length > 0
                ? filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                : ""}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
