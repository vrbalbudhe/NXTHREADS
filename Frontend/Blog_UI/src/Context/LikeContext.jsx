/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create the context
export const LikeContext = createContext();

// Create the provider component
export const LikeContextProvider = ({ children }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isliked, setIsLiked] = useState(null);

  // Function to like or unlike a post
  const toggleLike = async (postId, userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${baseUrl}/api/post/like/${postId}`,
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
        `${baseUrl}/api/post/unlike/${postId}`,
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
  const checkWhether = async (postId, userId) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/post/likecheck`,
        { userId, postId },
        { withCredentials: true }
      );
      const { isLiked, isUnliked } = response.data;
      console.log(`Is liked: ${isLiked}, Is unliked: ${isUnliked}`);
      return {
        isLiked,
        isUnliked,
      };
    } catch (error) {
      // console.error("Error fetching like status:", error);
    }
  };

  return (
    <LikeContext.Provider
      value={{
        likes,
        setLikes,
        checkWhether,
        isliked,
        toggleLike,
        loading,
        error,
        toggleUnLike,
        setIsLiked,
      }}
    >
      {children}
    </LikeContext.Provider>
  );
};
