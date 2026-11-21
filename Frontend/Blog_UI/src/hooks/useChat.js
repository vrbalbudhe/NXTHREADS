import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const ACK_TIMEOUT_MS = 5000;

const mergeMessages = (current, incoming) => {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) {
    byId.set(message.id, message);
  }
  return [...byId.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

const emitWithAck = (socket, event, payload) =>
  new Promise((resolve, reject) => {
    socket.timeout(ACK_TIMEOUT_MS).emit(event, payload, (err, response) => {
      if (err) {
        reject(new Error("Message timed out"));
        return;
      }
      resolve(response);
    });
  });

export const useChat = ({ socket, connected, currentUserId, otherUserId, onMessage }) => {
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const activeUserRef = useRef(otherUserId);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    activeUserRef.current = otherUserId;
  }, [otherUserId]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const fetchHistory = useCallback(
    async (before) => {
      const res = await axios.get(`${baseUrl}/api/chat/messages/${otherUserId}`, {
        params: before ? { before } : undefined,
        withCredentials: true,
      });
      return { items: res.data?.data || [], more: Boolean(res.data?.hasMore) };
    },
    [otherUserId]
  );

  useEffect(() => {
    setMessages([]);
    setHasMore(false);
    setError(null);
    if (!otherUserId) {
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    fetchHistory()
      .then(({ items, more }) => {
        if (!cancelled) {
          setMessages(items);
          setHasMore(more);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Unable to load messages");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [otherUserId, fetchHistory]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }
    const handleMessage = (message) => {
      onMessageRef.current?.(message, activeUserRef.current);
      const activeId = activeUserRef.current;
      const belongsToOpenChat =
        activeId &&
        ((message.senderId === activeId && message.receiverId === currentUserId) ||
          (message.senderId === currentUserId && message.receiverId === activeId));
      if (belongsToOpenChat) {
        setMessages((current) => mergeMessages(current, [message]));
        if (message.senderId === activeId) {
          socket.emit("chat:read", { userId: activeId });
        }
      }
    };
    socket.on("chat:message", handleMessage);
    return () => {
      socket.off("chat:message", handleMessage);
    };
  }, [socket, currentUserId]);

  useEffect(() => {
    if (!socket || !connected || !otherUserId) {
      return;
    }
    fetchHistory()
      .then(({ items }) => setMessages((current) => mergeMessages(current, items)))
      .catch(() => {});
  }, [socket, connected, otherUserId, fetchHistory]);

  const loadOlder = useCallback(async () => {
    if (!otherUserId || messages.length === 0) {
      return;
    }
    try {
      const { items, more } = await fetchHistory(messages[0].createdAt);
      setMessages((current) => mergeMessages(current, items));
      setHasMore(more);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load older messages");
    }
  }, [otherUserId, messages, fetchHistory]);

  const sendMessage = useCallback(
    async (content) => {
      const text = content.trim();
      if (!text || !otherUserId) {
        return false;
      }
      setSending(true);
      setError(null);
      try {
        let message;
        if (socket && connected) {
          const response = await emitWithAck(socket, "chat:send", {
            receiverId: otherUserId,
            content: text,
          });
          if (!response?.success) {
            throw new Error(response?.message || "Unable to send message");
          }
          message = response.data;
        } else {
          const res = await axios.post(
            `${baseUrl}/api/chat/messages`,
            { receiverId: otherUserId, content: text },
            { withCredentials: true }
          );
          message = res.data?.data;
        }
        if (message) {
          setMessages((current) => mergeMessages(current, [message]));
        }
        return true;
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Unable to send message");
        return false;
      } finally {
        setSending(false);
      }
    },
    [socket, connected, otherUserId]
  );

  return { messages, hasMore, loading, sending, error, loadOlder, sendMessage };
};
