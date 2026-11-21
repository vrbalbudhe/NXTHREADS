import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const useChatContacts = (currentUserId) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadContacts = useCallback(async () => {
    if (!currentUserId) {
      setContacts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${baseUrl}/api/chat/contacts`, {
        withCredentials: true,
      });
      setContacts(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load contacts");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const applyMessage = useCallback(
    (message, activeUserId) => {
      const otherId =
        message.senderId === currentUserId ? message.receiverId : message.senderId;
      let known = false;

      setContacts((previous) => {
        const next = previous.map((contact) => {
          if (contact.id !== otherId) {
            return contact;
          }
          known = true;
          const isIncomingUnread =
            message.senderId === otherId && otherId !== activeUserId;
          return {
            ...contact,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            unreadCount: isIncomingUnread ? contact.unreadCount + 1 : contact.unreadCount,
          };
        });
        return next.sort(
          (a, b) =>
            new Date(b.lastMessageAt || 0).getTime() -
            new Date(a.lastMessageAt || 0).getTime()
        );
      });

      if (!known) {
        loadContacts();
      }
    },
    [currentUserId, loadContacts]
  );

  const markRead = useCallback((userId) => {
    setContacts((previous) =>
      previous.map((contact) =>
        contact.id === userId ? { ...contact, unreadCount: 0 } : contact
      )
    );
  }, []);

  return { contacts, loading, error, applyMessage, markRead };
};
