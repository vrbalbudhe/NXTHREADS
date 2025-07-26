const FALLBACK_AVATAR_URL =
  "https://i.pinimg.com/564x/7f/c4/c6/7fc4c6ecc7738247aac61a60958429d4.jpg";

function ChatUserCard({ user, currentUser }) {
  if (currentUser?.userId === user.id) return null;

  return (
    <div className="w-[100%] p-2 md:w-full flex flex-wrap justify-between dark:border-gray-700 dark:bg-darkPostCardBg min-h-[10px] shadow-md border-l border-r dark:border border-slate-200 rounded-xl">
      <div className="w-[20%] flex justify-center items-center">
        <img
          className="h-8 w-8 rounded-full object-cover"
          src={user.avatar || FALLBACK_AVATAR_URL}
          alt={`${user.username}'s avatar`}
        />
      </div>
      <div className="w-[80%] min-h-1/2 flex flex-col justify-start items-center">
        <h1 className="text-slate-950 py-1 cursor-pointer bg-transparent dark:text-slate-300 dark:text-[13px] hover:text-blue-400 w-full text-center font-semibold text-xs bg-slate-100">
          @{user.username}
        </h1>
        <h1 className="text-slate-500 py-1 cursor-pointer w-full text-center font-semibold text-xs">
          {user.fullname || "Unregistered"}
        </h1>
      </div>
    </div>
  );
}

export default ChatUserCard;
