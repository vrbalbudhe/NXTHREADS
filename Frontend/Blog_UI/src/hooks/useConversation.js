import { useCallback, useEffect, useRef, useState } from "react";
import { api, errorMessage } from "../lib/api";
import { useChatContext } from "../Context/ChatContext";

const ACK_TIMEOUT_MS = 5000;

const merge = (current, incoming) => {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

const emitWithAck = (socket, event, payload) =>
  new Promise((resolve, reject) => {
    socket.timeout(ACK_TIMEOUT_MS).emit(event, payload, (err, response) => {
      if (err) reject(new Error("Message timed out"));
      else resolve(response);
    });
  });

export const useConversation = (currentUserId, otherUserId) => {
  const { socket, connected } = useChatContext();
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const otherRef = useRef(otherUserId);

  useEffect(() => {
    otherRef.current = otherUserId;
  }, [otherUserId]);

  const fetchPage = useCallback(
    async (before) => {
      const res = await api.get(`/chat/messages/${otherUserId}`, {
        params: before ? { before } : undefined,
      });
      return { items: res.data?.data || [], more: Boolean(res.data?.hasMore) };
    },
    [otherUserId]
  );

  useEffect(() => {
    setMessages([]);
    setHasMore(false);
    setError(null);
    if (!otherUserId) return undefined;

    let cancelled = false;
    setLoading(true);
    fetchPage()
      .then(({ items, more }) => {
        if (cancelled) return;
        setMessages(items);
        setHasMore(more);
      })
      .catch((err) => !cancelled && setError(errorMessage(err, "Unable to load messages")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [otherUserId, fetchPage]);

  useEffect(() => {
    if (!socket) return undefined;
    const onMessage = (message) => {
      const other = otherRef.current;
      if (!other) return;
      const belongs =
        (message.senderId === other && message.receiverId === currentUserId) ||
        (message.senderId === currentUserId && message.receiverId === other);
      if (!belongs) return;
      setMessages((current) => merge(current, [message]));
      if (message.senderId === other) {
        socket.emit("chat:read", { userId: other });
      }
    };
    socket.on("chat:message", onMessage);
    return () => socket.off("chat:message", onMessage);
  }, [socket, currentUserId]);

  useEffect(() => {
    if (!connected || !otherUserId) return;
    fetchPage()
      .then(({ items }) => setMessages((current) => merge(current, items)))
      .catch(() => {});
  }, [connected, otherUserId, fetchPage]);

  const loadOlder = useCallback(async () => {
    if (!otherUserId || messages.length === 0) return;
    try {
      const { items, more } = await fetchPage(messages[0].createdAt);
      setMessages((current) => merge(current, items));
      setHasMore(more);
    } catch (err) {
      setError(errorMessage(err, "Unable to load older messages"));
    }
  }, [otherUserId, messages, fetchPage]);

  const send = useCallback(
    async (content) => {
      const text = content.trim();
      if (!text || !otherUserId) return false;
      setSending(true);
      setError(null);
      try {
        let message;
        if (socket && connected) {
          const response = await emitWithAck(socket, "chat:send", {
            receiverId: otherUserId,
            content: text,
          });
          if (!response?.success) throw new Error(response?.message || "Unable to send message");
          message = response.data;
        } else {
          const res = await api.post("/chat/messages", { receiverId: otherUserId, content: text });
          message = res.data?.data;
        }
        if (message) setMessages((current) => merge(current, [message]));
        return true;
      } catch (err) {
        setError(err.response ? errorMessage(err) : err.message);
        return false;
      } finally {
        setSending(false);
      }
    },
    [socket, connected, otherUserId]
  );

  return { messages, hasMore, loading, sending, error, loadOlder, send };
};
