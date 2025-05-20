/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { redirect } from "react-router-dom";

export const UserInfoContext = createContext();

export const UserInfoProvider = ({ children }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { currentUser } = useContext(AuthContext);
  const [info, setInfo] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserInfo = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/api/user/${id}`, {
        withCredentials: true,
      });
      if (!response.data || response.data.id === undefined) {
        redirect("login");
      }
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
        `${baseUrl}/api/user/${currentUser.userInfo.id}`,
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
