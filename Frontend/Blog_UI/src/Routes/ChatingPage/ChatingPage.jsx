import { useEffect, useState, useContext } from "react";
import { LuSendHorizonal } from "react-icons/lu";
import axios from "axios";
import { io } from "socket.io-client";
import ChatUserCard from "../../Components/ChatUserCard/ChatUserCard";
import { AuthContext } from "../../Context/AuthContext";

const socket = io("http://localhost:8000");

function ChatingPage() {
  const { currentUser } = useContext(AuthContext);
  const [selectUser, setSelectUser] = useState(null); // Currently selected user for chat
  const [allChatUsers, setAllChatUsers] = useState([]); // All chat users
  const [messages, setMessages] = useState([]); // Chat messages between users
  const [newMessage, setNewMessage] = useState(""); // Current input message

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8000/api/chat/getUsr",
          { userId: currentUser.userId },
          { withCredentials: true }
        );
        setAllChatUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    getAllUsers();
  }, [currentUser.userId]);

  // Fetch chat history for selected user
  useEffect(() => {
    if (selectUser) {
      const fetchMessages = async () => {
        try {
          const response = await axios.post(
            `http://localhost:8000/api/chat/receive`,
            {
              senderId: currentUser.userId,
              receiverId: selectUser.following.id,
            }
          );
          setMessages(response.data.data); // Load chat history
        } catch (error) {
          console.error("Error fetching chat messages:", error);
        }
      };

      fetchMessages();

      socket.emit("join", {
        userId: currentUser.userId,
        receiverId: selectUser.following.id,
      });

      socket.on("messageReceived", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
      return () => {
        socket.off("messageReceived");
      };
    }
  }, [selectUser, currentUser.userId]);

  const handleClickUserData = (data) => {
    setSelectUser(data);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages

    const messageData = {
      senderId: currentUser.userId,
      receiverId: selectUser.following.id,
      content: newMessage,
    };

    try {
      // Send message to the server to store it in the database
      const response = await axios.post(
        "http://localhost:8000/api/chat/send",
        messageData,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        socket.emit("sendMessage", response.data.data);

        setMessages((prevMessages) => [
          ...prevMessages,
          { ...messageData, senderId: currentUser.userId },
        ]);
        setNewMessage("");
      } else {
        console.error("Failed to send message:", response.data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-start items-start gap-2">
      {/* Sidebar with user list */}
      <div className="w-[25%] h-[650px] p-2 flex flex-col gap-2">
        <div className="w-full h-20 cursor-pointer flex-col rounded-sm flex justify-start items-start pl-2">
          <p className="text-darkBlue font-extrabold text-2xl">@NXTHREADS</p>
          <p className="text-slate-500 text-md text-center">
            Connect with friends
          </p>
        </div>
        <div className="w-full overflow-y-auto min-h-fit mt-5 cursor-pointer flex flex-col gap-2">
          {allChatUsers?.length > 0 ? (
            allChatUsers.map((user) => (
              <ChatUserCard
                key={user.id}
                user={user}
                setUser={handleClickUserData}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No users available</p>
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className="w-[75%] h-[650px] flex flex-col gap-2">
        {/* Selected user header */}
        <div className="w-full h-14 flex items-center bg-darkPostCardBackground p-2 border border-slate-800">
          <div className="w-[5%] flex justify-start items-center">
            <img
              className="w-8 h-8 rounded-full border-2 border-white"
              src={
                selectUser?.following?.avatar ||
                "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"
              }
              alt="User Avatar"
            />
          </div>
          <div className="w-[45%] flex items-center">
            <p className="text-sm font-semibold text-white">
              {selectUser?.following?.fullname || "Select a user"}
            </p>
          </div>
        </div>

        {/* Chat messages area */}
        <div className="w-full h-full bg-darkPostCardBackground p-2 border border-slate-800 overflow-y-auto">
          <div className="flex flex-col gap-3 p-2">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.senderId === currentUser.userId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[60%] px-3 py-2 cursor-pointer rounded-3xl ${
                      msg.senderId === currentUser.userId
                        ? "border-slate-600 border text-white"
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

        {/* Message input section */}
        <div className="w-full h-[10%] flex items-center p-2">
          <div className="flex w-full">
            <input
              className="flex-grow p-3 rounded-full focus:outline-none bg-darkPostCardBackground text-white border border-slate-800"
              type="text"
              placeholder="Write Something..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="text-2xl text-blue-500 hover:text-blue-400 duration-300 ml-3"
              onClick={sendMessage}
            >
              <LuSendHorizonal />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatingPage;
