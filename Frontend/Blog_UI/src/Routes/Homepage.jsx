import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useFetchPosts } from "../Loaders/posts/useFetchAllPosts";
import PostCard from "../Components/PostCard/PostCard";
import HotTopicsCard from "../Components/UI_Components/HotTopicsCard";
import Spinner from "../Components/LayoutComponents/Spinner";
import BlogWriteBanner from "../Components/UI_Components/BlogWriteBanner";
import ShowcaseBanner from "../Components/UI_Components/ShowcaseBanner";
import { useFetchPersonalizedPosts } from "../Loaders/posts/useFetchPersonalizedPosts";
import FollowSuggestionCard from "../Components/UI_Components/FollowSuggestionCard";
import CompleteProfileCard from "../Components/UI_Components/CompleteProfileCard";

function Homepage() {
  const { currentUser } = useContext(AuthContext);
  const { personalizedPosts, error, loading, loadPersonalizedPosts } =
    useFetchPersonalizedPosts(currentUser?.userId);
  const { posts, loadPosts } = useFetchPosts();

  useEffect(() => {
    if (!currentUser?.userId) return;
    loadPosts();
    loadPersonalizedPosts();
  }, [currentUser?.userId]);

  return (
    <div className="w-full h-full mt-5 flex gap-3">
      <div className="w-[20%] hidden md:flex">
        <div className="min-h-[calc(100vh-5rem)] space-y-2">
          {currentUser?.userId && (
            <BlogWriteBanner isCurrentUser={currentUser?.userId} />
          )}
          <ShowcaseBanner
            title="Connect with Top Bloggers"
            subtitle="Follow and engage with creators you love"
            navigateTo="/bloggers"
            imageUrl="https://media.licdn.com/dms/image/v2/C4D12AQEUyCwFDse_Kw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1645538181664?e=2147483647&v=beta&t=8U4jIdadXaFgSP9MuCJbCw_UxSWG1jT0kYt3IqZx6eA"
          />
          <FollowSuggestionCard />
        </div>
      </div>

      <div className="w-full md:w-[60%] flex flex-col items-center justify-start gap-3">
        {loading ? (
          <Spinner text="Fetching Posts" />
        ) : currentUser?.userId && currentUser ? (
          personalizedPosts.length > 0 ? (
            personalizedPosts.map((post) => (
              <PostCard key={post.id} post={post} currentUser={currentUser} />
            ))
          ) : (
            <div className="w-full h-[500px] select-none pointer-events-none flex flex-col justify-center items-center">
              <img
                className="w-20 h-20 md:w-28 md:h-28"
                src="/sad.png"
                alt="sad_error_image"
              />
              <p className="text-white">
                Follow Bloggers To Get Personalized Posts!
              </p>
            </div>
          )
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} />
          ))
        ) : (
          <div className="w-full h-[500px] select-none pointer-events-none flex flex-col justify-center items-center">
            <img
              className="w-20 h-20 md:w-28 md:h-28"
              src="/sad.png"
              alt="sad_error_image"
            />
            <Spinner text="No Posts Found!" />
          </div>
        )}
      </div>

      <div className="w-[20%] hidden md:flex">
        <div className="max-h-[calc(100vh-5rem)] space-y-2">
          {currentUser?.userId && (
            <CompleteProfileCard currentUser={currentUser} />
          )}
          <HotTopicsCard />
          <ShowcaseBanner
            title="Discover Top Blogs"
            navigateTo="/search"
            imageUrl="https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />
        </div>
      </div>
    </div>
  );
}

export default Homepage;
