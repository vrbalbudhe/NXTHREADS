import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useFetchPosts } from "../Loaders/posts/useFetchAllPosts";
import PostCard from "../Components/PostCard/PostCard";
import HotTopicsCard from "../Components/UI_Components/HotTopicsCard";
import Spinner from "../Components/LayoutComponents/Spinner";
import BlogWriteBanner from "../Components/UI_Components/BlogWriteBanner";
import ShowcaseBanner from "../Components/UI_Components/ShowcaseBanner";

function Homepage() {
  const { posts, loadPosts } = useFetchPosts();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="w-full min-h-fit mt-5 flex gap-3">
      <div className="w-full md:w-[75%] flex flex-col items-center justify-start gap-3">
        {posts.length === 0 && (
          <div className="w-full md:h-[500px] select-none flex justify-center items-center">
            <p className="text-white">No Posts Found!</p>
          </div>
        )}
        {posts.length > 0
          ? posts.map((post) => (
              <PostCard key={post.id} post={post} currentUser={currentUser} />
            ))
          : posts.length !== 0 && <Spinner text="Fetching Posts" />}
      </div>

      <div className="w-[25%] hidden md:block">
        <div className="max-h-[calc(100vh-5rem)] space-y-2">
          <ShowcaseBanner
            title="Discover Top Blogs"
            navigateTo="/search"
            imageUrl="https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />
          <HotTopicsCard />
          <ShowcaseBanner
            title="Connect with Top Bloggers"
            subtitle="Follow and engage with creators you love"
            navigateTo="/bloggers"
            imageUrl="https://media.licdn.com/dms/image/v2/C4D12AQEUyCwFDse_Kw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1645538181664?e=2147483647&v=beta&t=8U4jIdadXaFgSP9MuCJbCw_UxSWG1jT0kYt3IqZx6eA"
          />
          <BlogWriteBanner isCurrentUser={currentUser?.id} />
        </div>
      </div>
    </div>
  );
}

export default Homepage;
