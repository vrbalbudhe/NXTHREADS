import { io } from "socket.io-client";

export const createChatSocket = () =>
  io(import.meta.env.VITE_API_BASE_URL, {
    withCredentials: true,
    autoConnect: false,
    reconnectionAttempts: 10,
  });
