import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { followUnfollowUser, addFollower, removeFollower, addFollowing, removeFollowing } from "../../ReduxThunkSlice/FollowersSlice";

export const useFollowUnfollowUser = () => {
     const dispatch = useDispatch();
     const [result, setResult] = useState(null);
     const [error, setError] = useState();

     const handleFollowUnfollow = useCallback(async ({ followerId, followingId, userData, isCurrentlyFollowing }) => {
          try {
               const response = await dispatch(followUnfollowUser({ followerId, followingId })).unwrap();
               setResult(response);

               // Update Redux state based on the action performed
               if (response.success) {
                    if (isCurrentlyFollowing) {
                         // User was unfollowed - remove from followings and remove current user from target's followers
                         dispatch(removeFollowing(followingId));
                         dispatch(removeFollower(followerId));
                    } else {
                         // User was followed - add to followings and add current user to target's followers
                         if (userData) {
                              dispatch(addFollowing({
                                   id: followingId,
                                   following: userData
                              }));
                              // Add current user to target's followers (if we have current user data)
                              // This would need current user data to be passed
                         }
                    }
               }
          } catch (err) {
               console.error("Error in follow/unfollow:", err);
               setError(err);
          }
     }, [dispatch]);

     return { result, error, handleFollowUnfollow };
}; 