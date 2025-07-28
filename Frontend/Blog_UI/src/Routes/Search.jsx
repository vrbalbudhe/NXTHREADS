/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from "react";
import Filter from "../Components/Filter/Filter";
import PostCard from "../Components/PostCard/PostCard";
import NextPrevious from "../Components/NextPrevious/NextPrevious";
import HotTopicsCard from "../Components/UI_Components/HotTopicsCard";
import SearchBar from "../Components/SearchBar/SearchBar";
import { useFetchPosts } from "../Loaders/posts/useFetchAllPosts";
import { useFetchAllUsers } from "../Loaders/users/useFetchAllUsers";
import { AuthContext } from "../Context/AuthContext";
import ShowcaseBanner from "../Components/UI_Components/ShowcaseBanner";

function Search() {
  const { posts, loadPosts, error } = useFetchPosts();
  const { currentUser } = useContext(AuthContext);
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
      <div className="w-full md:w-[20%] h-full hidden  md:flex flex-col gap-5 justify-center items-start">
        <HotTopicsCard />
      </div>
      <div className="w-full md:w-[60%] h-full p-1 flex flex-col justify-start gap-2 items-start">
        <SearchBar posts={posts} users={users} />
        <div className="md:hidden block">
          <HotTopicsCard />
        </div>
        <div className="w-full h-fit flex flex-col gap-3">
          {posts.length === 0 ? (
            <div className="w-full min-h-[400px] flex justify-center items-center">
              <p className="text-lg">No posts found</p>
            </div>
          ) : (
            posts
              .slice(prev, next)
              .map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser?.userId}
                />
              ))
          )}
        </div>
        <NextPrevious prev={handlePrev} next={handleNext} />
      </div>
      <div className="w-full md:w-[20%] h-full hidden  md:flex flex-col gap-5 justify-center items-start">
        <Filter/>
        <ShowcaseBanner
          title="Discover Top Blogs"
          navigateTo="/search"
          imageUrl="https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        />
      </div>
    </div>
  );
}

export default Search;
