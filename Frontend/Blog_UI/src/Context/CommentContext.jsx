/* eslint-disable react/prop-types */
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
// import io from "socket.io-client";

export const CommentContext = createContext();

export const CommentProvider = ({ children }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { currentUser } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);

  // Initialize socket outside useEffect to ensure it's created once
  // const socket = io(`${baseUrl}`, {
  //   withCredentials: true,
  //   transports: ["websocket"],
  // });

  // useEffect(() => {
  //   if (!currentPostId) return;

  //   socket.on("commentCreated", (newComment) => {
  //     if (newComment.postId === currentPostId) {
  //       setComments((prevComments) => [...prevComments, newComment]);
  //     }
  //   });

  //   socket.on("commentDeleted", (deletedComment) => {
  //     if (deletedComment.postId === currentPostId) {
  //       setComments((prevComments) =>
  //         prevComments.filter((comment) => comment.id !== deletedComment.id)
  //       );
  //     }
  //   });

  //   // Cleanup socket on unmount or postId change
  //   return () => {
  //     socket.off("commentCreated");
  //     socket.off("commentDeleted");
  //   };
  // }, [currentPostId, socket]);

  const addComment = async (description, postId) => {
    setLoading(true);
    try {
      await axios.post(
        `${baseUrl}/api/comment/create`,
        {
          description,
          commentor: currentUser?.userInfo?.id,
          postId,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error(
        "Error creating comment:",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/comment/${postId}`, {
        withCredentials: true,
      });
      setComments(response.data);
      setCurrentPostId(postId);
    } catch (error) {
      console.error("Error fetching comments:");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommentContext.Provider
      value={{
        addComment,
        comments,
        fetchComments,
        setComments,
        setCurrentPostId,
        loading,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};
