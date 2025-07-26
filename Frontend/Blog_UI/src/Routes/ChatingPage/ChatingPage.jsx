import { useState, useEffect, useContext } from "react";
import { LuSendHorizonal } from "react-icons/lu";
import ChatUserCard from "../../Components/ChatUserCard/ChatUserCard";
import { AuthContext } from "../../Context/AuthContext";
import { useFirebaseChat } from "../../hooks/useFirebaseChat";
import { useBackendFollowings } from "../../hooks/useBackendFollowings";

function UserListPanel({ users, handleClickUserData, loading, currentUser }) {
  return (
    <div className="w-full md:w-[25%] h-fit md:h-[650px] p-2 flex flex-col gap-2">
      <div className="w-full h-20 cursor-pointer flex-col rounded-sm flex justify-start items-start pl-2">
        <p className="text-sky-400 font-semibold text-2xl">
          @ Connect with friends
        </p>
      </div>
      <div className="w-full overflow-y-auto min-h-fit mt-5 cursor-pointer flex flex-col gap-2">
        {loading ? (
          <p className="text-center text-gray-500">
            Loading following users...
          </p>
        ) : users?.length > 0 ? (
          users.map((user) => (
            <div className="w-fit md:w-full" key={user.id} onClick={() => handleClickUserData(user)}>
              <ChatUserCard user={user} currentUser={currentUser} />
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            <p>No following users available</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatHeader({ selectUser }) {
  return (
    <div className="w-full h-14 flex items-center dark:bg-darkPostCardBackground p-2 border border-slate-200 rounded-lg dark:border-gray-700 gap-2">
      <div className=" md:w-[5%] flex justify-start items-center">
        <img
          className="w-8 h-8 rounded-full border-2 border-white"
          src={
            selectUser?.avatar ||
            "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"
          }
          alt="User Avatar"
        />
      </div>
      <div className="w-[45%] flex items-center">
        <p className="text-sm font-semibold dark:text-white text-slate-800">
          {selectUser?.fullname || "Select a user"}
        </p>
      </div>
    </div>
  );
}

function ChatMessages({ messages, currentUser }) {
  return (
    <div className="w-full h-full dark:bg-darkPostCardBackground p-2 border border-slate-200 rounded-lg dark:border-gray-700 overflow-y-auto">
      <div className="flex flex-col gap-3 p-2">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === currentUser.userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[60%] px-3 py-2 cursor-pointer rounded-3xl ${
                  msg.senderId === currentUser.userId
                    ? "border-slate-600 border dark:text-white text-slate-800"
                    : "bg-gray-200 text-black"
                }`}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No messages yet. Start chatting!
          </p>
        )}
      </div>
    </div>
  );
}

function ChatInput({ newMessage, setNewMessage, sendMessage, loading }) {
  return (
    <div className="w-full h-[10%] flex items-center">
      <div className="flex w-full">
        <input
          className="flex-grow p-3 rounded-lg focus:outline-none dark:bg-darkPostCardBackground text-gray-700 dark:text-white border border-slate-800"
          type="text"
          placeholder="Write Something..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
          disabled={loading}
        />
        <button
          className={`text-2xl ml-3 ${loading ? "text-gray-400" : "text-blue-500 hover:text-blue-400"} duration-300`}
          onClick={() => !loading && sendMessage()}
          disabled={loading}
        >
          <LuSendHorizonal />
        </button>
      </div>
    </div>
  );
}

function ChatingPage() {
  const { currentUser } = useContext(AuthContext);
  const [selectUser, setSelectUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const {
    users,
    loading: usersLoading,
    loadBackendFollowings,
  } = useBackendFollowings(currentUser?.userId);

  useEffect(() => {
    loadBackendFollowings();
  }, [currentUser?.userId]); //
  const {
    messages,
    sendMessage,
    loading: sendLoading,
  } = useFirebaseChat(currentUser?.userId, selectUser?.id);

  const handleClickUserData = (data) => {
    setSelectUser(data);
    setNewMessage("");
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectUser) return;
    await sendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div className="w-full min-h-screen md:flex justify-start items-start gap-2">
      <UserListPanel
        users={users}
        handleClickUserData={handleClickUserData}
        loading={usersLoading}
        currentUser={currentUser}
      />
      <div className="w-full md:w-[75%] h-[650px] flex flex-col gap-2 p-2">
        <ChatHeader selectUser={selectUser} />
        <ChatMessages messages={messages} currentUser={currentUser} />
        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={handleSendMessage}
          loading={sendLoading}
        />
      </div>
    </div>
  );
}

export default ChatingPage;
