import { useCallback, useEffect, useRef, useState } from "react";
import { api, errorMessage } from "../lib/api";

export const usePaged = (url, { params, enabled = true, limit = 10, itemsKey = "posts" } = {}) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(Boolean(enabled && url));
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const requestRef = useRef(0);
  const paramsKey = JSON.stringify(params || {});

  const fetchPage = useCallback(
    async (pageNumber) => {
      const res = await api.get(url, {
        params: { ...JSON.parse(paramsKey), page: pageNumber, limit },
      });
      return res.data;
    },
    [url, paramsKey, limit]
  );

  const reload = useCallback(async () => {
    if (!enabled || !url) {
      setItems([]);
      setLoading(false);
      return;
    }
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPage(1);
      if (requestId !== requestRef.current) return;
      setItems(data?.[itemsKey] || []);
      setTotal(data?.meta?.total ?? (data?.[itemsKey] || []).length);
      setHasMore(Boolean(data?.meta?.hasMore));
      setPage(1);
    } catch (err) {
      if (requestId === requestRef.current) setError(errorMessage(err, "Unable to load"));
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [enabled, url, fetchPage, itemsKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    const requestId = requestRef.current;
    setLoadingMore(true);
    try {
      const data = await fetchPage(page + 1);
      if (requestId !== requestRef.current) return;
      setItems((current) => {
        const known = new Set(current.map((item) => item.id));
        return [...current, ...(data?.[itemsKey] || []).filter((item) => !known.has(item.id))];
      });
      setPage((value) => value + 1);
      setHasMore(Boolean(data?.meta?.hasMore));
    } catch (err) {
      setError(errorMessage(err, "Unable to load more"));
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, fetchPage, page, itemsKey]);

  const updateItem = useCallback(
    (id, patch) =>
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, ...(typeof patch === "function" ? patch(item) : patch) }
            : item
        )
      ),
    []
  );

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setTotal((value) => Math.max(0, value - 1));
  }, []);

  const prependItem = useCallback((item) => {
    setItems((current) => [item, ...current.filter((existing) => existing.id !== item.id)]);
    setTotal((value) => value + 1);
  }, []);

  return {
    items,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    reload,
    loadMore,
    updateItem,
    removeItem,
    prependItem,
  };
};
