/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create the context
export const LikeContext = createContext();

// Create the provider component
export const LikeContextProvider = ({ children }) => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to like or unlike a post
  const toggleLike = async (postId, userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `http://localhost:8000/api/post/like/${postId}`,
        { userId, postId },
        { withCredentials: true }
      );
      setLikes(postId); // Refresh the likes after toggling
      return response.data;
    } catch (error) {
      console.error("Error toggling like:", error);
      setError("Failed to toggle like.");
    } finally {
      setLoading(false);
    }
  };
  const toggleUnLike = async (postId, userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `http://localhost:8000/api/post/unlike/${postId}`,
        { userId },
        { withCredentials: true }
      );
      setLikes(postId); // Refresh the likes after toggling
      return response.data;
    } catch (error) {
      console.error("Error toggling like:", error);
      setError("Failed to toggle like.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LikeContext.Provider
      value={{ likes, setLikes, toggleLike, loading, error, toggleUnLike }}
    >
      {children}
    </LikeContext.Provider>
  );
};
