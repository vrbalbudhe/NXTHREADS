import { useEffect, useState } from "react";
import { cachedGet } from "../lib/api";

const useCached = (url, ttl) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    cachedGet(url, { ttl })
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err));
    return () => {
      cancelled = true;
    };
  }, [url, ttl]);

  return { data, error, loading: !data && !error };
};

export const useStats = () => useCached("/post/stats", 60000);

export const useCategories = () => {
  const { data, error, loading } = useCached("/post/categories", 60000);
  return { categories: data?.categories || [], error, loading };
};
