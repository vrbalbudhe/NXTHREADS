import { useState, useEffect, useContext, useRef } from "react";
import { LuSendHorizonal } from "react-icons/lu";
import ChatUserCard from "../Components/ChatUserCard/ChatUserCard";
import { AuthContext } from "../Context/AuthContext";
import { useChatSocket } from "../hooks/useChatSocket";
import { useChatContacts } from "../hooks/useChatContacts";
import { useChat } from "../hooks/useChat";

const FALLBACK_AVATAR_URL =
  "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png";

function UserListPanel({ users, onSelect, selectedId, loading, error, currentUser }) {
  return (
    <div className="w-full md:w-[25%] h-fit md:h-[650px] p-2 flex flex-col gap-2">
      <div className="w-full h-20 cursor-pointer flex-col rounded-sm flex justify-start items-start pl-2">
        <p className="text-sky-400 font-semibold text-2xl">@ Connect with friends</p>
      </div>
      <div className="w-full overflow-y-auto min-h-fit mt-5 cursor-pointer flex flex-col gap-2">
        {loading ? (
          <p className="text-center text-gray-500">Loading contacts...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : users.length > 0 ? (
          users.map((user) => (
            <div
              className={`w-fit md:w-full rounded-xl ${selectedId === user.id ? "ring-2 ring-sky-400" : ""}`}
              key={user.id}
              onClick={() => onSelect(user)}
            >
              <ChatUserCard user={user} currentUser={currentUser} />
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            <p>Follow someone to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatHeader({ selectUser, connected }) {
  return (
    <div className="w-full h-14 flex items-center justify-between dark:bg-darkPostCardBackground p-2 border border-slate-200 rounded-lg dark:border-gray-700 gap-2">
      <div className="flex items-center gap-2">
        <img
          className="w-8 h-8 rounded-full border-2 border-white object-cover"
          src={selectUser?.avatar || FALLBACK_AVATAR_URL}
          alt="User Avatar"
        />
        <p className="text-sm font-semibold dark:text-white text-slate-800">
          {selectUser ? selectUser.fullname || `@${selectUser.username}` : "Select a user"}
        </p>
      </div>
      <span className={`text-xs font-medium ${connected ? "text-green-500" : "text-gray-400"}`}>
        {connected ? "Live" : "Offline"}
      </span>
    </div>
  );
}

function ChatMessages({ messages, currentUser, loading, hasMore, loadOlder, selectUser }) {
  const bottomRef = useRef(null);
  const lastMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lastMessageId]);

  return (
    <div className="w-full h-full dark:bg-darkPostCardBackground p-2 border border-slate-200 rounded-lg dark:border-gray-700 overflow-y-auto">
      <div className="flex flex-col gap-3 p-2">
        {hasMore && (
          <button
            onClick={loadOlder}
            className="self-center text-xs text-sky-500 hover:text-sky-400"
          >
            Load older messages
          </button>
        )}
        {!selectUser ? (
          <p className="text-center text-gray-500">Pick a contact to start chatting</p>
        ) : loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length > 0 ? (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUser.userId;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[60%] px-3 py-2 rounded-3xl break-words ${
                    isMine
                      ? "border-slate-600 border dark:text-white text-slate-800"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500">No messages yet. Start chatting!</p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function ChatInput({ newMessage, setNewMessage, sendMessage, sending, disabled }) {
  const blocked = sending || disabled;
  return (
    <div className="w-full h-[10%] flex items-center">
      <div className="flex w-full">
        <input
          className="flex-grow p-3 rounded-lg focus:outline-none dark:bg-darkPostCardBackground text-gray-700 dark:text-white border border-slate-800"
          type="text"
          maxLength={2000}
          placeholder={disabled ? "Select a contact first" : "Write Something..."}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !blocked && sendMessage()}
          disabled={blocked}
        />
        <button
          className={`text-2xl ml-3 ${blocked ? "text-gray-400" : "text-blue-500 hover:text-blue-400"} duration-300`}
          onClick={() => !blocked && sendMessage()}
          disabled={blocked}
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

  const { socket, connected } = useChatSocket(Boolean(currentUser?.userId));
  const {
    contacts,
    loading: contactsLoading,
    error: contactsError,
    applyMessage,
    markRead,
  } = useChatContacts(currentUser?.userId);

  const { messages, hasMore, loading, sending, error, loadOlder, sendMessage } = useChat({
    socket,
    connected,
    currentUserId: currentUser?.userId,
    otherUserId: selectUser?.id,
    onMessage: applyMessage,
  });

  const handleSelect = (user) => {
    setSelectUser(user);
    setNewMessage("");
    markRead(user.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectUser) return;
    const sent = await sendMessage(newMessage);
    if (sent) {
      setNewMessage("");
    }
  };

  return (
    <div className="w-full min-h-screen md:flex justify-start items-start gap-2">
      <UserListPanel
        users={contacts}
        onSelect={handleSelect}
        selectedId={selectUser?.id}
        loading={contactsLoading}
        error={contactsError}
        currentUser={currentUser}
      />
      <div className="w-full md:w-[75%] h-[650px] flex flex-col gap-2 p-2">
        <ChatHeader selectUser={selectUser} connected={connected} />
        <ChatMessages
          messages={messages}
          currentUser={currentUser}
          loading={loading}
          hasMore={hasMore}
          loadOlder={loadOlder}
          selectUser={selectUser}
        />
        {error && <p className="text-xs text-red-500 px-1">{error}</p>}
        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={handleSendMessage}
          sending={sending}
          disabled={!selectUser}
        />
      </div>
    </div>
  );
}

export default ChatingPage;
