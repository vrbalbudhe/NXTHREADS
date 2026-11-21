import { useEffect, useState } from "react";
import { createChatSocket } from "../lib/socket";

export const useChatSocket = (enabled) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const instance = createChatSocket();
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    instance.on("connect", handleConnect);
    instance.on("disconnect", handleDisconnect);
    instance.on("connect_error", handleDisconnect);
    instance.connect();
    setSocket(instance);

    return () => {
      instance.off("connect", handleConnect);
      instance.off("disconnect", handleDisconnect);
      instance.off("connect_error", handleDisconnect);
      instance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [enabled]);

  return { socket, connected };
};
