/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import axios from "axios";
import { createContext, useEffect, useState } from "react";

// Create Context
export const SearchContext = createContext();

// Provider Component
export const SearchPostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch posts based on query
  const fetchSearchPost = async (query) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/post/fltr/?${query}`,
        { withCredentials: true }
      );
      setPosts(response.data.posts);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized access - redirecting to login.");
      } else {
        console.error("Error fetching posts:", error);
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).toString();
    if (query) {
      fetchSearchPost(query);
    }
  }, []);

  return (
    <SearchContext.Provider
      value={{
        posts,
        setPosts,
        fetchSearchPost,
        error,
        setError,
        loading,
        setLoading,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
