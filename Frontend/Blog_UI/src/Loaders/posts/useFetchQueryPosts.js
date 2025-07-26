import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchQueryPosts } from "../../ReduxThunkSlice/PostSlice";

export const useFetchQueryPosts = (queryParams) => {
     const dispatch = useDispatch();
     const [queryPosts, setQueryPosts] = useState([]);
     const [error, setError] = useState();

     const loadQueryPosts = useCallback(async () => {
          try {
               const query_posts_response = await dispatch(fetchQueryPosts(queryParams)).unwrap();
               setQueryPosts(query_posts_response);
          } catch (err) {
               console.error("Error loading query posts:", err);
               setError(err);
          }
     }, [dispatch, queryParams]);

     return { queryPosts, error, loadQueryPosts };
};

