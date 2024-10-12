import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/auth/isLogin",
          {
            withCredentials: true,
          }
        );

        const userInfo = response?.data?.payload;
        console.log(userInfo);
        if (userInfo) {
          setCurrentUser(userInfo);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error fetching user info, please re-login.", error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner">Loading...</div>{" "}
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
