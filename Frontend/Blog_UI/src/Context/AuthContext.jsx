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
  }, []); // ✅ Runs only once on mount

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-black">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
