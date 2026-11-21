import { fetchAllPosts } from "../../ReduxThunkSlice/PostSlice";
import { usePagedPosts } from "./usePagedPosts";

export const useFetchPosts = () => {
  const { posts, error, loading, loadingMore, hasMore, load, loadMore } =
    usePagedPosts(fetchAllPosts);

  return { posts, error, loading, loadingMore, hasMore, loadPosts: load, loadMore };
};
