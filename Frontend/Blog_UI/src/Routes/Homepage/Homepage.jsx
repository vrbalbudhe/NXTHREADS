import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AuthContext } from "../../Context/AuthContext";
import { fetchAllPosts } from "../../ReduxThunkSlice/PostSlice";
import PostCard from "../../Components/PostCard/PostCard";
import HotTopicsCard from "../../Components/HotTopicsCard/HotTopicsCard";
import Card1 from "../../Components/Card1/Card1";
import { useFetchPosts } from "../../Loaders/posts/useFetchAllPosts";

function Homepage() {
  const { posts, loadPosts, error } = useFetchPosts();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="w-full min-h-fit mt-5 flex gap-4">
      <div className="w-full md:w-[75%] flex flex-col items-center justify-start gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} />
          ))
        ) : (
          <div className="w-full h-[600px] flex justify-center items-center">
            <p className="text-gray-200">Posts Are Loading,,,</p>
          </div>
        )}
      </div>

      <div className="w-[25%] hidden md:block rounded-xl space-y-4">
        <Card1 isCurrentUser={currentUser?.id} />
        <HotTopicsCard />
      </div>
    </div>
  );
}

export default Homepage;
