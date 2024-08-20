import { createContext, useEffect, useState } from "react";
import { redirect } from "react-router-dom";

export const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState([]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      if (currentUser===null) {
        redirect("/login");
      }
    } catch (error) {
      console.log(
        "Error Parsing the json Data from the Local Storage: ",
        error
      );
    }
  }, []);

  const updateUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  return (
    <AuthContext.Provider value={{ currentUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
