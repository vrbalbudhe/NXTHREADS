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
  return (
    <div className="w-full min-h-fit mt-5 flex gap-5">
      <div
        className={`w-full md:w-[70%]  h-full flex flex-col justify-center items-center`}
      >
        <div className="w-full h-fit flex justify-center items-center flex-col">
          {posts?.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div>No posts available</div>
          )}
        </div>
      </div>
      <div className="w-[30%] h-full hidden md:block rounded-xl">
        {currentUser?.userInfo && (
          <Card1 isCurrentUser={currentUser?.userInfo.id} />
        )}
        <HotTopicsCard />
      </div>
    </div>
  );
}

export default Homepage;
