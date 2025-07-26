import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchAllPosts } from "../../ReduxThunkSlice/PostSlice";

export const useFetchPosts = () => {
  const dispatch = useDispatch();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState();

  const loadPosts = useCallback(async () => {
    try {
      const posts_response = await dispatch(fetchAllPosts()).unwrap();
      setPosts(posts_response);
    } catch (err) {
      console.error("Error loading posts:", err);
      setError(err);
    }
  }, [dispatch]);

  return { posts, error, loadPosts };
};
