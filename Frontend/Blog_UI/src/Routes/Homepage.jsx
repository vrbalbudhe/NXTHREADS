import { useContext, useEffect } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useFetchPosts } from "../Loaders/posts/useFetchAllPosts";
import { useFetchPersonalizedPosts } from "../Loaders/posts/useFetchPersonalizedPosts";
import PostCard from "../Components/PostCard/PostCard";
import Spinner from "../Components/LayoutComponents/Spinner";
import BlogWriteBanner from "../Components/UI_Components/BlogWriteBanner";
import ShowcaseBanner from "../Components/UI_Components/ShowcaseBanner";
import FollowSuggestionCard from "../Components/UI_Components/FollowSuggestionCard";
import CompleteProfileCard from "../Components/UI_Components/CompleteProfileCard";
import HotTopicsCard from "../Components/UI_Components/HotTopicsCard";

function Homepage() {
  const { currentUser } = useContext(AuthContext);
  const { personalizedPosts, loading: loadingPersonalized, loadPersonalizedPosts } =
    useFetchPersonalizedPosts(currentUser?.userId);
  const { posts, loading: loadingPosts, loadPosts } = useFetchPosts();

  useEffect(() => {
    currentUser?.userId ? loadPersonalizedPosts() : loadPosts();
  }, [currentUser?.userId]);

  const isLoading = currentUser?.userId ? loadingPersonalized : loadingPosts;
  const postList = currentUser?.userId ? personalizedPosts : posts;

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
        {isLoading ? (
          <Spinner text="Fetching Posts" />
        ) : postList.length > 0 ? (
          postList.map((post) => (
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
              {currentUser?.userId
                ? "Follow Bloggers To Get Personalized Posts!"
                : "No Posts Found!"}
            </p>
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
