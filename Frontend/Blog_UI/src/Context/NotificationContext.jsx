import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../lib/api";
import { notificationText } from "../lib/notifications";
import { useAuth } from "./AuthContext";
import { useChatContext } from "./ChatContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const { socket } = useChatContext();
  const userId = currentUser?.userId;
  const [unread, setUnread] = useState(0);
  const listeners = useRef(new Set());

  const refreshUnread = useCallback(async () => {
    if (!userId) {
      setUnread(0);
      return;
    }
    try {
      const res = await api.get("/notifications/unread-count");
      setUnread(res.data?.unread || 0);
    } catch {
      setUnread(0);
    }
  }, [userId]);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  useEffect(() => {
    if (!socket) return undefined;
    const onNew = ({ notification, unread: count }) => {
      setUnread(count);
      for (const listener of listeners.current) listener({ type: "new", notification });
      if (!window.location.pathname.startsWith("/notifications")) {
        toast(notificationText(notification), { toastId: notification.id, autoClose: 4000 });
      }
    };
    const onRead = ({ ids, unread: count }) => {
      setUnread(count);
      for (const listener of listeners.current) listener({ type: "read", ids });
    };
    socket.on("notification:new", onNew);
    socket.on("notification:read", onRead);
    socket.io.on("reconnect", refreshUnread);
    return () => {
      socket.off("notification:new", onNew);
      socket.off("notification:read", onRead);
      socket.io.off("reconnect", refreshUnread);
    };
  }, [socket, refreshUnread]);

  const subscribe = useCallback((listener) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);

  const markRead = useCallback(async (ids) => {
    const res = await api.post("/notifications/read", ids ? { ids } : {});
    setUnread(res.data?.unread || 0);
    return res.data?.unread || 0;
  }, []);

  const value = useMemo(
    () => ({ unread, markRead, subscribe, refreshUnread }),
    [unread, markRead, subscribe, refreshUnread]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => useContext(NotificationContext);
