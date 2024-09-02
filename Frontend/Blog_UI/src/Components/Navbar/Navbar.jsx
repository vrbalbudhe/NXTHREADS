/* eslint-disable no-unused-vars */
import { redirect, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { useContext, useEffect } from "react";
import { RiHome4Line, RiNotification3Line } from "react-icons/ri";
import { IoSearchSharp } from "react-icons/io5";
import { LuUsers2 } from "react-icons/lu";
import { MdInfoOutline } from "react-icons/md";
import { HiOutlinePencil } from "react-icons/hi";

function Navbar() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // useEffect(() => {
  //   // Check if currentUser or currentUser.userInfo is undefined
  //   if (!currentUser?.userInfo?.id) {
  //     navigate("/login");
  //   }
  // }, [currentUser, navigate]); // Add dependencies here

  return (
    <div className="w-full pt-2 pb-2 h-ful bg-white flex justify-between items-center overflow-hidden">
      <div className="w-[20%] h-full flex justify-start pl-5 items-center">
        <img className="w-7 h-7 rounded-full" src="/favicon.jpg" alt="Logo" />
        <h1
          onClick={() => navigate("/")}
          className="cursor-pointer text-sm font-bold text-slate-800 hover:text-slate-500"
        >
          NXTHREADS
        </h1>
      </div>
      <div className="hidden w-[50%] h-full md:flex justify-center items-center">
        <ul className="w-full h-full flex justify-center items-center gap-5 font-bold text-slate-700 text-[22px]">
          <li
            onClick={() => navigate("/")}
            className="hover:text-blue-500 hover:underline cursor-pointer"
          >
            <RiHome4Line />
          </li>
          <li
            onClick={() => navigate("/search")}
            className="hover:text-blue-500 hover:underline cursor-pointer"
          >
            <IoSearchSharp />
          </li>
          {currentUser?.userInfo && (
            <>
              <li
                onClick={() => navigate(`/createBlog`)}
                className="hover:text-blue-500 hover:underline cursor-pointer"
              >
                <HiOutlinePencil />
              </li>
              <li
                onClick={() => navigate(`/bloggers`)}
                className="hover:text-blue-500 hover:underline cursor-pointer"
              >
                <LuUsers2 />
              </li>
            </>
          )}
          <li
            onClick={() => navigate(`/about`)}
            className="hover:text-blue-500 hover:underline cursor-pointer"
          >
            <MdInfoOutline />
          </li>
        </ul>
      </div>
      <div className="w-[30%] h-full flex justify-end items-center gap-5">
        {currentUser?.userInfo?.id ? (
          <>
            <h1 className="w-5 h-full flex justify-center items-center text-xl">
              <RiNotification3Line />
            </h1>
            <div className="w-7 h-7 mr-2 border border-slate-500 rounded-full flex justify-center items-center">
              {currentUser.userInfo.avatar ? (
                <img
                  className="w-7 h-7 rounded-full object-cover"
                  src={currentUser.userInfo.avatar}
                  alt="User Avatar"
                />
              ) : (
                <img
                  className="rounded-full"
                  src="https://i.pinimg.com/564x/7f/c4/c6/7fc4c6ecc7738247aac61a60958429d4.jpg"
                  alt="Default Avatar"
                />
              )}
            </div>
            <button
              onClick={() => navigate(`/profile/${currentUser.userInfo.id}`)}
              className="bg-transparent border hover:bg-blue-400 mr-5 hover:text-white border-slate-400 px-3 py-1 text-xs rounded-lg text-slate-800 font-bold"
            >
              {currentUser.userInfo.username || "Profile"}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/register")}
              className="bg-transparent border border-slate-400 px-2 py-1 text-xs rounded-lg hover:bg-blue-400 hover:text-white text-slate-800 font-bold"
            >
              Begin
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-transparent border border-slate-400 mr-5 px-2 py-1 text-xs rounded-lg hover:bg-blue-400 hover:text-white text-slate-800 font-bold"
            >
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
