import { createContext, useEffect, useState } from "react";
import axios from "axios";
export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/auth/isLogin`, {
          withCredentials: true,
        });

        const userInfo = response?.data?.payload;
        if (userInfo) {
          setCurrentUser(userInfo);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error fetching user info, please re-login.");
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  });

  if (loading) {
    return (
      <div className="flex items-center select-none pointer-events-none justify-center h-screen">
        <div className="spinner text-gray-200">Loading...</div>{" "}
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
