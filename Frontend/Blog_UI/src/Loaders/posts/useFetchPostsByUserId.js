import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchPostsByUserId } from "../../ReduxThunkSlice/PostSlice";

export const useFetchPostsByUserId = (id) => {
     const dispatch = useDispatch();
     const [userPosts, setUserPosts] = useState(null);
     const [error, setError] = useState(null);
     const [userPostsLoading, setUserPostsLoading] = useState(false);

     const loadUserPosts = useCallback(async () => {
          setUserPostsLoading(true);
          try {
               const response = await dispatch(fetchPostsByUserId(id)).unwrap();
               console.log(response)
               setUserPosts(response);
          } catch (err) {
               console.error("Error loading user:", err);
               setError(err);
          } finally {
               setUserPostsLoading(false);
          }
     }, [id]);

     return { userPosts, error, userPostsLoading, loadUserPosts };
};
