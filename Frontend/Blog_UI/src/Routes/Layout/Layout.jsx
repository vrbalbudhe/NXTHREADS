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
    <div className="w-[100%] h-[100vh] bg-white flex flex-col justify-start items-center">
      <div className="md:w-[80%] md:h-fit w-full h-fit shadow-xl border-b border-slate-100">
        {<Navbar />}
      </div>
      <div className="md:w-[80%] md:h-full w-full md:h-fit]">
        <div className="w-full h-fit bg-white p-2 border-l border-r shadow-lg border-slate-100" >
          <Outlet />
        </div>
        <div className="w-full h-fit bg-white bottom-0 mt-2">
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
    <div className="w-[100%] h-[100vh] bg-white flex flex-col justify-start items-center">
      <div className="md:w-[80%] md:h-[10%] w-full md:h-fit]">
        <Navbar />
      </div>
      <div className="md:w-[80%] md:h-full w-full md:h-fit]">
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
