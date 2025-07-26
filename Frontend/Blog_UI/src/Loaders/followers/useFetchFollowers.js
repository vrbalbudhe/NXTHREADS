import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchAllFollowers } from "../../ReduxThunkSlice/FollowersSlice";

export const useFetchFollowers = () => {
     const dispatch = useDispatch();
     const [followers, setFollowers] = useState([]);
     const [error, setError] = useState();

     const loadFollowers = useCallback(async (userId) => {
          try {
               const followers_response = await dispatch(fetchAllFollowers(userId)).unwrap();
               console.log(followers_response)
               setFollowers(followers_response);
          } catch (err) {
               console.error("Error loading followers:", err);
               setError(err);
          }
     }, [dispatch]);

     return { followers, error, loadFollowers };
}; 