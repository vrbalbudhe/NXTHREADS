import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createChatSocket } from "../lib/socket";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

const byRecent = (a, b) =>
  new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime();

export function ChatProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.userId;
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typing, setTyping] = useState({});
  const activeRef = useRef(null);
  const typingTimers = useRef({});

  const loadContacts = useCallback(async () => {
    if (!userId) {
      setContacts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/chat/contacts");
      setContacts(res.data?.data || []);
    } catch (err) {
      setError(errorMessage(err, "Unable to load conversations"));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }
    const instance = createChatSocket();
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    instance.on("connect", onConnect);
    instance.on("disconnect", onDisconnect);
    instance.on("connect_error", onDisconnect);
    instance.connect();
    setSocket(instance);
    return () => {
      instance.off("connect", onConnect);
      instance.off("disconnect", onDisconnect);
      instance.off("connect_error", onDisconnect);
      instance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [userId]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }
    const onMessage = (message) => {
      const otherId = message.senderId === userId ? message.receiverId : message.senderId;
      const incoming = message.senderId === otherId;
      const isOpen = activeRef.current === otherId;
      let known = false;
      setContacts((previous) =>
        previous
          .map((contact) => {
            if (contact.id !== otherId) return contact;
            known = true;
            return {
              ...contact,
              lastMessage: message.content,
              lastMessageAt: message.createdAt,
              unreadCount:
                incoming && !isOpen ? (contact.unreadCount || 0) + 1 : contact.unreadCount,
            };
          })
          .sort(byRecent)
      );
      if (!known) {
        loadContacts();
      }
    };
    const onPresence = ({ userId: otherId, online }) =>
      setContacts((previous) =>
        previous.map((contact) => (contact.id === otherId ? { ...contact, online } : contact))
      );
    const onTyping = ({ userId: otherId, typing: isTyping }) => {
      clearTimeout(typingTimers.current[otherId]);
      setTyping((previous) => ({ ...previous, [otherId]: isTyping }));
      if (isTyping) {
        typingTimers.current[otherId] = setTimeout(
          () => setTyping((previous) => ({ ...previous, [otherId]: false })),
          4000
        );
      }
    };
    const onReconnect = () => loadContacts();
    const clearTypingFor = (message) =>
      setTyping((previous) =>
        previous[message.senderId] ? { ...previous, [message.senderId]: false } : previous
      );
    socket.on("chat:message", onMessage);
    socket.on("chat:message", clearTypingFor);
    socket.on("presence:update", onPresence);
    socket.on("chat:typing", onTyping);
    socket.io.on("reconnect", onReconnect);
    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:message", clearTypingFor);
      socket.off("presence:update", onPresence);
      socket.off("chat:typing", onTyping);
      socket.io.off("reconnect", onReconnect);
    };
  }, [socket, userId, loadContacts]);

  const sendTyping = useCallback(
    (otherId, isTyping) => {
      if (socket && socket.connected && otherId) {
        socket.emit("chat:typing", { userId: otherId, typing: isTyping });
      }
    },
    [socket]
  );

  const setActiveConversation = useCallback((id) => {
    activeRef.current = id || null;
    if (id) {
      setContacts((previous) =>
        previous.map((contact) => (contact.id === id ? { ...contact, unreadCount: 0 } : contact))
      );
    }
  }, []);

  const unreadTotal = useMemo(
    () => contacts.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0),
    [contacts]
  );

  const value = useMemo(
    () => ({
      socket,
      connected,
      contacts,
      loading,
      error,
      unreadTotal,
      typing,
      sendTyping,
      reloadContacts: loadContacts,
      setActiveConversation,
    }),
    [
      socket,
      connected,
      contacts,
      loading,
      error,
      unreadTotal,
      typing,
      sendTyping,
      loadContacts,
      setActiveConversation,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChatContext = () => useContext(ChatContext);
