import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchUserById } from "../../ReduxThunkSlice/UserSlice";

export const useFetchUserById = (id) => {
     const dispatch = useDispatch();
     const [user, setUser] = useState(null); 
     const [error, setError] = useState(null);
     const [loading, setLoading] = useState(false); 

     const loadUser = useCallback(async () => {
          setLoading(true);
          try {
               const user_response = await dispatch(fetchUserById(id)).unwrap();
               setUser(user_response);
          } catch (err) {
               console.error("Error loading user:", err);
               setError(err);
          } finally {
               setLoading(false);
          }
     }, [dispatch, id]);

     return { user, error, loading, loadUser };
};
