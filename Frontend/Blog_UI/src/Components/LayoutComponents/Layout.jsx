import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import Footer from "./Footer";

export const Layout = () => {
  return (
    <div className="w-[100%] scrollable-section  sticky top-0 z-40 h-fit bg-white dark:bg-[#01161e] flex flex-col justify-start items-center">
      <div className="md:w-[98%] sticky top-0 dark:bg-[#01161e] md:h-fit w-full h-fit">
        {<Navbar />}
      </div>
      <div className="md:w-[95%] md:h-full w-full md:[h-fit]">
        <div className="w-full h-fit dark:bg-[#01161e] bg-white p-2">
          <Outlet />
        </div>
      </div>
      <div className="w-full h-fit dark:bg-[#01161e] bg-white bottom-0">
        <Footer />
      </div>
    </div>
  );
};

export const RequiredAuth = () => {
  const { currentUser } = useContext(AuthContext);

  return !currentUser ? (
    <Navigate to="/login" />
  ) : (
    <div className="w-[100%] h-fit bg-white dark:bg-[#01161e] flex flex-col justify-start items-center">
       <div className="md:w-[98%] sticky top-0 dark:bg-[#01161e] md:h-fit w-full h-fit">
        {<Navbar />}
      </div>
      <div className="md:w-[95%] md:h-full w-full md:[h-fit]">
        <div className="w-full h-fit dark:bg-[#01161e] bg-white p-2">
          <Outlet />
        </div>
      </div>
      <div className="w-full mt-10 h-fit dark:bg-[#01161e] bg-white bottom-0">
        <Footer />
      </div>
    </div>
  );
};
