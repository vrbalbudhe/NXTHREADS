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
  const activeRef = useRef(null);

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
    socket.on("chat:message", onMessage);
    return () => socket.off("chat:message", onMessage);
  }, [socket, userId, loadContacts]);

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
      reloadContacts: loadContacts,
      setActiveConversation,
    }),
    [socket, connected, contacts, loading, error, unreadTotal, loadContacts, setActiveConversation]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChatContext = () => useContext(ChatContext);
