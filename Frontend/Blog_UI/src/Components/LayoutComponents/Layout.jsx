import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import Footer from "./Footer";

export const Layout = () => {
  return (
    <div className="w-[100%] outline outline-red-500 p-1 md:p-0 scrollable-section min-h-screen bg-white dark:bg-darkBackground flex flex-col justify-start items-center">
      <div className="md:w-[83%] top-0 sticky z-50 bg-transparent md:h-fit w-full h-fit">
        <Navbar />
      </div>
      <div className="md:w-[80%] min-h-screen w-full pb-20">
        <div className="w-full h-full dark:bg-darkBackground bg-white p-2">
          <Outlet />
        </div>
      </div>
      <div className="w-[80%] hidden md:block dark:bg-darkBackground bg-white bottom-0">
        <Footer />
      </div>
    </div>
  );
};

export const RequiredAuth = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-[100%] min-h-screen p-1 md:p-0 bg-white dark:bg-darkBackground flex flex-col justify-start items-center">
      <div className="md:w-[83%] top-0 sticky z-50  md:h-fit w-full h-fit">
        <Navbar />
      </div>
      <div className="md:w-[80%] min-h-screen w-full pb-20">
        <div className="w-full h-fit dark:bg-darkBackground bg-white p-2">
          <Outlet />
        </div>
      </div>
      <div className="w-[80%] hidden md:flex justify-center items-center mt-10 h-fit dark:bg-darkBackground bg-white bottom-0">
        <Footer />
      </div>
    </div>
  );
};
