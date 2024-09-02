/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const UserInfoContext = createContext();

export const UserInfoProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [info, setInfo] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserInfo = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/user/${id}`, {
        withCredentials: true,
      });
      setInfo(response.data);
      console.log(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized access - redirecting to login.");
      } else {
        console.error("Error fetching user info:", error);
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async (input) => {
    try {
      await axios.post(
        `http://localhost:8000/api/user/${currentUser.userInfo.id}`,
        input,
        { withCredentials: true }
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (currentUser?.userInfo?.id) {
      fetchUserInfo(currentUser.userInfo.id);
    }
  }, [currentUser]);

  return (
    <UserInfoContext.Provider
      value={{
        info,
        setInfo,
        fetchUserInfo,
        error,
        handleUpdateInfo,
        setError,
        loading,
        setLoading,
      }}
    >
      {children}
    </UserInfoContext.Provider>
  );
};
