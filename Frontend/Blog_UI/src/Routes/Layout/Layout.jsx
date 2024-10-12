import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import Footer from "../../Components/Footer/Footer";

export const Layout = () => {
  // const { postResponse } = useLoaderData();
  // const { currentUser } = useContext(AuthContext);
  // console.log(postResponse);
  // console.log(currentUser);
  return (
    <div className="w-[100%] scrollable-section  sticky top-0 z-40 h-fit bg-white dark:bg-[#080708] flex flex-col justify-start items-center">
      <div className="md:w-[90%] sticky top-0 dark:bg-[#080708] md:h-fit w-full h-fit">
        {<Navbar />}
      </div>
      <div className="md:w-[90%] md:h-full w-full md:[h-fit]">
        <div className="w-full h-fit dark:bg-[#080708] bg-white p-2">
          <Outlet />
        </div>
        <div className="w-full h-fit dark:bg-[#080708] bg-white bottom-0">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export const RequiredAuth = () => {
  const { currentUser } = useContext(AuthContext);

  return !currentUser ? (
    <Navigate to="/login" />
  ) : (
    <div className="w-[100%] h-fit bg-white dark:bg-[#080708] flex flex-col justify-start items-center">
      <div className="md:w-[90%] md:h-[10%] w-full md:h-fit]">
        <Navbar />
      </div>
      <div className="md:w-[90%] md:h-full w-full md:h-fit]">
        <div className="w-full h-fit">
          <Outlet />
        </div>
        <div className="w-full h-fit bottom-0 mt-10">
          <Footer />
        </div>
      </div>
    </div>
  );
};
