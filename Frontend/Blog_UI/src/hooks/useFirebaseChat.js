import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export const useFirebaseChat = (senderId, receiverId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatId = senderId && receiverId
    ? [senderId, receiverId].sort().join("_")
    : null;

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe(); // cleanup on unmount
  }, [chatId]);

  const sendMessage = async (content) => {
    if (!senderId || !receiverId || !content.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        senderId,
        receiverId,
        content,
        createdAt: serverTimestamp(),
        chatId,
      });
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
};
