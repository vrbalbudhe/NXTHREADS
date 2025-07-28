import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { personalizedPostsThunk } from "../../ReduxThunkSlice/PostSlice";

export const useFetchPersonalizedPosts = (userId) => {
     const dispatch = useDispatch();
     const [personalizedPosts, setPersonalizedPosts] = useState([]);
     const [error, setError] = useState();
     const [loading, setLoading] = useState(false);

     const loadPersonalizedPosts = useCallback(async () => {
          setLoading(true);
          setError(null);
          try {
               const posts_response = await dispatch(personalizedPostsThunk({ userId })).unwrap();
               setPersonalizedPosts(posts_response);
          } catch (err) {
               setError(err);
          } finally {
               setLoading(false);
          }
     }, [dispatch]);

     return { personalizedPosts, error, loading, loadPersonalizedPosts };
};
