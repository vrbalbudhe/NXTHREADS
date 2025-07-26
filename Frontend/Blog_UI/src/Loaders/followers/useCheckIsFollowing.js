import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { checkIsFollowing } from "../../ReduxThunkSlice/FollowersSlice";

export const useCheckIsFollowing = () => {
     const dispatch = useDispatch();
     const [isFollowing, setIsFollowing] = useState(false);
     const [error, setError] = useState();

     const checkFollowing = useCallback(async ({ followerId, followingId }) => {
          try {
               const response = await dispatch(checkIsFollowing({ followerId, followingId })).unwrap();
               setIsFollowing(response);
               return response;
          } catch (err) {
               console.error("Error checking following status:", err);
               setError(err);
               return false;
          }
     }, [dispatch]);

     return { isFollowing, error, checkFollowing };
}; 