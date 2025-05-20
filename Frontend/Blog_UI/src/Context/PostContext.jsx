/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [posts, setPosts] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const [userPosts, setUserPosts] = useState([]);
  const [favPosts, setFavPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const userId = currentUser?.userId || {};

  useEffect(() => {
    fetchGeneralPosts();
    fetchUserPosts(userId);
  }, []);

  // Function to fetch posts for a specific user
  const fetchUserPosts = async (userId, page = 1, limit = 10) => {
    try {
      setLoading(true);
      const url = `${baseUrl}/api/post/${userId}?page=${page}&limit=${limit}`;
      const response = await axios.get(url, { withCredentials: true });

      if (page === 1) {
        setUserPosts(response.data.posts);
      } else {
        setUserPosts((prevPosts) => [...prevPosts, ...response.data.posts]);
      }

      setHasMore(response.data.meta.hasMore);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  // Function to fetch posts without a specific user
  const fetchGeneralPosts = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const url = `${baseUrl}/api/post?page=${page}&limit=${limit}`;
      const response = await axios.get(url, { withCredentials: true });

      if (page === 1) {
        setPosts(response.data.posts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...response.data.posts]);
      }

      setHasMore(response.data.meta.hasMore);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  // Function to fetch favourite Posts
  const fetchSavedPosts = async (id) => {
    try {
      setLoading(true);
      const url = `${baseUrl}/api/post/fav/${id}`;
      const response = await axios.get(url, { withCredentials: true });
      setFavPosts(response.data.posts);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const HandleDeleteBlog = async (postId) => {
    try {
      setLoading(true);
      const url = `${baseUrl}/api/post/${postId}`;
      await axios.delete(url, { withCredentials: true });

      // Remove the deleted post from the posts state
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        setPosts,
        loading,
        setUserPosts,
        userPosts,
        error,
        fetchUserPosts,
        HandleDeleteBlog,
        fetchGeneralPosts,
        fetchSavedPosts,
        favPosts,
        page,
        setPage,
        hasMore,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
