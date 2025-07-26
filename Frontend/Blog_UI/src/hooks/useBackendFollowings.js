import { useState, useCallback } from "react";
import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const useBackendFollowings = (currentUserId) => {
     const [users, setUsers] = useState([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);

     const loadBackendFollowings = useCallback(async () => {
          if (!currentUserId) {
               setUsers([]);
               return;
          }

          setLoading(true);
          setError(null);

          try {
               const res = await axios.get(
                    `${baseUrl}/api/userfollow/following/${currentUserId}`,
                    {},
                    { withCredentials: true }
               );
               const followings = res.data.totalFollowings || [];
               setUsers(followings.map(f => f.following));
          } catch (err) {
               console.error("Error loading followings:", err);
               setError(err);
          } finally {
               setLoading(false);
          }
     }, [currentUserId]);

     return {
          users,
          loading,
          error,
          loadBackendFollowings,
     };
};
