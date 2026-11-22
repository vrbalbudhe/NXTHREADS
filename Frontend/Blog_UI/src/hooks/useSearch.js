import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export const useSearch = (query, { includeUsers }) => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);
  const term = query.trim();

  useEffect(() => {
    controllerRef.current?.abort();
    setError(null);

    if (!term) {
      setPosts([]);
      setUsers([]);
      setHasMore(false);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const [postRes, userRes] = await Promise.all([
          axios.get(`${baseUrl}/api/post/search`, {
            params: { q: term, page: 1, limit: PAGE_SIZE },
            signal: controller.signal,
            withCredentials: true,
          }),
          includeUsers
            ? axios.get(`${baseUrl}/api/user/search`, {
                params: { q: term },
                signal: controller.signal,
                withCredentials: true,
              })
            : Promise.resolve({ data: { users: [] } }),
        ]);
        setPosts(postRes.data?.posts || []);
        setHasMore(Boolean(postRes.data?.meta?.hasMore));
        setUsers(userRes.data?.users || []);
        setPage(1);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err.response?.data?.message || "Search failed");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, includeUsers]);

  const loadMore = useCallback(async () => {
    if (!term || loading || loadingMore || !hasMore) {
      return;
    }
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await axios.get(`${baseUrl}/api/post/search`, {
        params: { q: term, page: nextPage, limit: PAGE_SIZE },
        withCredentials: true,
      });
      setPosts((current) => {
        const known = new Set(current.map((post) => post.id));
        return [...current, ...(res.data?.posts || []).filter((post) => !known.has(post.id))];
      });
      setHasMore(Boolean(res.data?.meta?.hasMore));
      setPage(nextPage);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
    } finally {
      setLoadingMore(false);
    }
  }, [term, page, hasMore, loading, loadingMore]);

  return { posts, users, hasMore, loading, loadingMore, error, loadMore };
};
