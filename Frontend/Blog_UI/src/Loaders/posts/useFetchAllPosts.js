import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchAllPosts } from "../../ReduxThunkSlice/PostSlice";

export const useFetchPosts = () => {
  const dispatch = useDispatch();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const posts_response = await dispatch(fetchAllPosts()).unwrap();
      setPosts(posts_response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return { posts, error, loading, loadPosts };
};
