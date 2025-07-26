/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from "react";
import Filter from "../../Components/Filter/Filter";
import PostCard from "../../Components/PostCard/PostCard";
import NextPrevious from "../../Components/NextPrevious/NextPrevious";
import HotTopicsCard from "../../Components/HotTopicsCard/HotTopicsCard";
import SearchBar from "../../Components/SearchBar/SearchBar";
import { useFetchPosts } from "../../Loaders/posts/useFetchAllPosts";
import { useFetchAllUsers } from "../../Loaders/users/useFetchAllUsers";

function Search() {
  const { posts, loadPosts, error } = useFetchPosts();
  const { users, fetch_all_users_error, loadUsers } = useFetchAllUsers();

  const [prev, setPrev] = useState(0);
  const [next, setNext] = useState(3);
  const [total, setTotal] = useState();

  useEffect(() => {
    loadPosts();
    loadUsers();
    setTotal(posts.length);
  }, []);

  const handlePrev = () => {
    if (prev > 0) {
      setPrev((prev) => prev - 3);
      setNext((next) => next - 3);
    }
  };

  const handleNext = () => {
    setPrev((prev) => prev + 3);
    setNext((next) => next + 3);
  };

  return (
    <div className="w-full min-h-[500px] md:flex justify-start items-start mt-5 gap-2">
      <div className="w-full md:w-[75%] h-full p-1 flex flex-col justify-start gap-2 items-start">
        <SearchBar posts={posts} users={users} />
        <div className="w-full h-fit flex flex-col gap-3">
          {posts.length === 0 ? (
            <div className="w-full min-h-[400px] flex justify-center items-center">
              <p className="text-lg">No posts found</p>
            </div>
          ) : (
            posts
              .slice(prev, next)
              .map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
        <NextPrevious prev={handlePrev} next={handleNext} />
      </div>
      <div className="w-full md:w-[25%] h-full flex flex-col gap-5 justify-center items-start">
        <Filter users={users} />
        <HotTopicsCard />
      </div>
    </div>
  );
}

export default Search;
