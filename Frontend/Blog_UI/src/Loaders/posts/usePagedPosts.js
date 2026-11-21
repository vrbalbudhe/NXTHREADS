import { useState, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";

export const usePagedPosts = (thunk, args) => {
  const dispatch = useDispatch();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const requestRef = useRef(0);
  const argsKey = JSON.stringify(args ?? {});

  const fetchPage = useCallback(
    (pageNumber) => dispatch(thunk({ ...JSON.parse(argsKey), page: pageNumber })).unwrap(),
    [dispatch, thunk, argsKey]
  );

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPage(1);
      if (requestId !== requestRef.current) {
        return;
      }
      setPosts(result.posts);
      setPage(1);
      setHasMore(Boolean(result.meta?.hasMore));
    } catch (err) {
      if (requestId === requestRef.current) {
        setError(err);
      }
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) {
      return;
    }
    const requestId = requestRef.current;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const result = await fetchPage(nextPage);
      if (requestId !== requestRef.current) {
        return;
      }
      setPosts((current) => {
        const known = new Set(current.map((post) => post.id));
        return [...current, ...result.posts.filter((post) => !known.has(post.id))];
      });
      setPage(nextPage);
      setHasMore(Boolean(result.meta?.hasMore));
    } catch (err) {
      setError(err);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, page, hasMore, loading, loadingMore]);

  return { posts, error, loading, loadingMore, hasMore, load, loadMore };
};
