import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchAllFollowings } from "../../ReduxThunkSlice/FollowersSlice";

export const useFetchFollowings = () => {
     const dispatch = useDispatch();
     const [followings, setFollowings] = useState([]);
     const [error, setError] = useState();

     const loadFollowings = useCallback(async (userId) => {
          try {
               const followings_response = await dispatch(fetchAllFollowings(userId)).unwrap();
               setFollowings(followings_response);
          } catch (err) {
               console.error("Error loading followings:", err);
               setError(err);
          }
     }, [dispatch]);

     return { followings, error, loadFollowings };
}; 