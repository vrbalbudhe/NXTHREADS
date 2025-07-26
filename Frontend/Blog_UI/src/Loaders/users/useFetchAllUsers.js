import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchAllUsers } from "../../ReduxThunkSlice/UserSlice";

export const useFetchAllUsers = () => {
     const dispatch = useDispatch();
     const [users, setUsers] = useState([]);
     const [fetch_all_users_error, setFetch_all_users_error] = useState();

     const loadUsers = useCallback(async () => {
          try {
               const posts_response = await dispatch(fetchAllUsers()).unwrap();
               setUsers(posts_response);
          } catch (err) {
               console.error("Error loading posts:", err);
               setFetch_all_users_error(err);
          }
     }, [dispatch]);

     return { users, fetch_all_users_error, loadUsers };
};
