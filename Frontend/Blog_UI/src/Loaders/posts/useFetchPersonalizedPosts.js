import { personalizedPostsThunk } from "../../ReduxThunkSlice/PostSlice";
import { usePagedPosts } from "./usePagedPosts";

export const useFetchPersonalizedPosts = (userId) => {
  const { posts, error, loading, loadingMore, hasMore, load, loadMore } =
    usePagedPosts(personalizedPostsThunk, { userId });

  return {
    personalizedPosts: posts,
    error,
    loading,
    loadingMore,
    hasMore,
    loadPersonalizedPosts: load,
    loadMore,
  };
};
