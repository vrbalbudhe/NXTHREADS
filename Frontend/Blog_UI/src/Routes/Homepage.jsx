import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useFetchPosts } from "../Loaders/posts/useFetchAllPosts";
import { useFetchPersonalizedPosts } from "../Loaders/posts/useFetchPersonalizedPosts";
import PostCard from "../Components/PostCard/PostCard";
import BlogWriteBanner from "../Components/UI_Components/BlogWriteBanner";
import ShowcaseBanner from "../Components/UI_Components/ShowcaseBanner";
import FollowSuggestionCard from "../Components/UI_Components/FollowSuggestionCard";
import CompleteProfileCard from "../Components/UI_Components/CompleteProfileCard";
import HotTopicsCard from "../Components/UI_Components/HotTopicsCard";
import PostSkeleton from "../Components/PostCard/PostSkeleton";
import PullToRefresh from "pulltorefreshjs";

const LazyLoadingPosts = ({
  postList,
  isLoading,
  loadingMore,
  hasMore,
  onLoadMore,
  currentUser,
}) => {
  const sentinelRef = useRef(null);
  const loadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRef.current();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, postList.length]);

  return (
    <div className="w-full md:w-[60%] flex flex-col items-center justify-start gap-3">
      {isLoading ? (
        <>
          {[...Array(5)].map((_, index) => (
            <PostSkeleton key={index} />
          ))}
        </>
      ) : postList.length > 0 ? (
        <>
          {postList.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} />
          ))}
          <div ref={sentinelRef} className="h-10 w-full" />
          {loadingMore && <PostSkeleton />}
          {!hasMore && (
            <div className="py-4 text-sm text-gray-400">
              You’re all caught up
            </div>
          )}
        </>
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
  );
};

function Homepage() {
  const { currentUser } = useContext(AuthContext);
  const personalized = useFetchPersonalizedPosts(currentUser?.userId);
  const everyone = useFetchPosts();
  const {
    personalizedPosts,
    loading: loadingPersonalized,
    loadPersonalizedPosts,
  } = personalized;
  const { posts, loading: loadingPosts, loadPosts } = everyone;
  const activeFeed = currentUser?.userId ? personalized : everyone;

  useEffect(() => {
    currentUser?.userId ? loadPersonalizedPosts() : loadPosts();
  }, [currentUser?.userId]);

  useEffect(() => {
    PullToRefresh.destroyAll();
    const ptr = PullToRefresh.init({
      mainElement: "body",
      onRefresh: () =>
        currentUser?.userId ? loadPersonalizedPosts() : loadPosts(),
      shouldPullToRefresh: () => window.scrollY === 0,
      distThreshold: 50,
      distReload: 60,
      instructionsPullToRefresh: "Pull to refresh",
      instructionsReleaseToRefresh: "Release to refresh",
      instructionsRefreshing: "Refreshing...",
    });
    return () => {
      try {
        if (ptr && typeof ptr.destroy === "function") ptr.destroy();
      } finally {
        PullToRefresh.destroyAll();
      }
    };
  }, [currentUser?.userId, loadPersonalizedPosts, loadPosts]);

  const isLoading = currentUser?.userId ? loadingPersonalized : loadingPosts;
  const postList = currentUser?.userId ? personalizedPosts : posts;

  return (
    <div className="w-full h-full mt-5 flex gap-3">
      <div className="w-[20%] hidden md:flex">
        <div className="w-full min-h-[calc(100vh-5rem)] space-y-2">
          {currentUser?.userId && (
            <BlogWriteBanner isCurrentUser={currentUser?.userId} />
          )}
          <ShowcaseBanner
            title="Connect with Top Bloggers"
            subtitle="Follow and engage with creators you love"
            navigateTo="/bloggers"
            imageUrl="https://thumbs.dreamstime.com/b/hands-diverse-people-connecting-puzzle-together-top-closeup-office-desk-multi-ethnic-team-engaging-finding-best-business-116559011.jpg"
          />
          <FollowSuggestionCard />
        </div>
      </div>

      <LazyLoadingPosts
        postList={postList}
        isLoading={isLoading}
        loadingMore={activeFeed.loadingMore}
        hasMore={activeFeed.hasMore}
        onLoadMore={activeFeed.loadMore}
        currentUser={currentUser}
      />

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
