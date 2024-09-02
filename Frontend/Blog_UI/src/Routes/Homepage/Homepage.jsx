/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import PostCard from "../../Components/PostCard/PostCard";
import { PostContext } from "../../Context/PostContext";
import HotTopicsCard from "../../Components/HotTopicsCard/HotTopicsCard";
import Card1 from "../../Components/Card1/Card1";
import { AuthContext } from "../../Context/AuthContext";

function Homepage() {
  const { posts, loading, error, fetchGeneralPosts, page, setPage, hasMore } =
    useContext(PostContext);
  const { currentUser } = useContext(AuthContext);

  const handleScroll = () => {
    // console.log("innerHeight:", window.innerHeight);
    // console.log("scroll top:", document.documentElement.scrollTop);
    // console.log("scrollHeight:", document.documentElement.scrollHeight);
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.scrollHeight
    )
      return;
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    fetchGeneralPosts();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="w-full min-h-fit mt-5 flex gap-5 relative">
      <div
        className={`w-[70%] h-full flex flex-col justify-center items-center`}
      >
        <div className="w-full h-fit flex justify-center items-center flex-col">
          {posts?.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div>No posts available</div>
          )}
          {/* {loading && <div>Loading more posts...</div>} */}
          {/* {!hasMore && <div>No more posts to load</div>} */}
        </div>
        {/* ViewMore button can be removed if scroll-based loading is enough */}
      </div>
      <div className="w-[30%] h-full rounded-xl">
        {currentUser.userInfo && (
          <Card1 isCurrentUser={currentUser.userInfo.id} />
        )}
        <HotTopicsCard />
      </div>
    </div>
  );
}

export default Homepage;
