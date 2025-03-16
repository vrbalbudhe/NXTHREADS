/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from "react";
import Filter from "../../Components/Filter/Filter";
import PostCard from "../../Components/PostCard/PostCard";
import NextPrevious from "../../Components/NextPrevious/NextPrevious";
import HotTopicsCard from "../../Components/HotTopicsCard/HotTopicsCard";
import SearchBar from "../../Components/SearchBar/SearchBar";
import { LuGalleryHorizontalEnd } from "react-icons/lu";
import { PostContext } from "../../Context/PostContext";

function Search() {
  const { posts, fetchPosts } = useContext(PostContext);

  const [prev, setPrev] = useState(0);
  const [next, setNext] = useState(3);
  const [total, setTotal] = useState();

  useEffect(() => {
    setTotal(posts.length);
  }, [posts]);

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
      <div className="w-full md:w-[70%] h-full p-1 flex flex-col justify-start gap-2 items-start">
        <SearchBar />
        <div className="w-full h-fit pl-5 flex flex-col justify-start items-start">
          <h1 className="flex items-center gap-2 text-lg text-gray-800 dark:text-white font-semibold">
            <LuGalleryHorizontalEnd className="text-2xl" />
            <span>All Posts</span>
          </h1>
        </div>
        <div className="w-full h-fit">
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
      <div className="w-full md:w-[30%] mt-10 md:mt-0 h-full flex flex-col gap-2 justify-center items-start">
        {/* <Filter /> */}
        <HotTopicsCard />
      </div>
    </div>
  );
}

export default Search;
