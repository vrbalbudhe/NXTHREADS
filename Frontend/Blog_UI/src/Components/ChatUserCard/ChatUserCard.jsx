import { useState } from "react";

function ChatUserCard({ user, setUser }) {
  const handleSelectedUser = () => {
    setUser(user);
  };
  return (
    <div
      onClick={handleSelectedUser}
      className="w-full h-14 flex justify-start dark:text-slate-300 text-slate-800 border-slate-400  border dark:border-slate-800 rounded-xl items-center gap-1 p-1 mb-2 dark:bg-gray-800 hover:bg-darkBlue hover:text-white"
    >
      <div className="w-[20%] h-full flex justify-center items-center">
        <img
          className="w-8 h-8 object-cover rounded-full border border-slate-900"
          src={
            user?.following?.avatar ||
            "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"
          }
          alt=""
        />
      </div>
      <div className="w-[80%] h-full flex flex-col justify-center items-start">
        <p className="text-sm font-semibold -tracking-tighter">
          {user?.following?.fullname || "NA"}
        </p>
        <p className="text-xs font-semibold -tracking-tighter">
          {user?.following?.username || "NA"}
        </p>
      </div>
    </div>
  );
}

export default ChatUserCard;
