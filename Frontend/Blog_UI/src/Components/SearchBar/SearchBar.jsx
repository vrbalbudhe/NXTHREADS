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
    <div className="w-full flex flex-col items-center justify-start">
      <div className="flex w-full justify-center gap-2 items-center">
        <input
          className="w-[100%] h-10 border-2 pl-5 dark:text-white dark:outline-none dark:bg-darkPostCardBg dark:border-gray-800 dark:border-2 border-slate-300 rounded-xl"
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
            {filteredPosts.length > 0
              ? filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              : ""}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
