import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  timeout: 20000,
});

export const errorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message ||
  (error?.code === "ECONNABORTED" ? "Request timed out" : fallback);

const cache = new Map();

export const cachedGet = (url, { ttl = 60000, params } = {}) => {
  const key = `${url}?${new URLSearchParams(params || {}).toString()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) {
    return hit.promise;
  }
  const promise = api
    .get(url, { params })
    .then((res) => res.data)
    .catch((error) => {
      cache.delete(key);
      throw error;
    });
  cache.set(key, { at: Date.now(), promise });
  return promise;
};

export const invalidateCache = (prefix) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
};
