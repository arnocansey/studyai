"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  room: string;
  timestamp: Date;
  reactions?: { emoji: string; users: string[] }[];
  replyTo?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: "group" | "study-group" | "direct";
  members: string[];
}

interface UseChatSocketOptions {
  userId: string;
  userName: string;
  token: string | null;
  serverUrl?: string;
}

const DEFAULT_WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

export function useChatSocket({
  userId,
  userName,
  token,
  serverUrl = DEFAULT_WS_URL,
}: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<
    { userId: string; userName: string }[]
  >([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!token || !userId) {
      setIsConnected(false);
      return;
    }

    const socket = io(`${serverUrl}/chat`, {
      auth: { token },
      query: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", () => {
      setIsConnected(false);
    });

    socket.on("user:online", (data: { userId: string; userName: string }) => {
      setOnlineUsers((prev) => {
        if (prev.find((u) => u.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, userName: data.userName }];
      });
    });

    socket.on("user:offline", (data: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    socket.on("typing:update", (data: { room: string; users: string[] }) => {
      setTypingUsers(data.users);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, userName, token, serverUrl]);

  const sendMessage = useCallback(
    (content: string, room: string, replyTo?: string) => {
      if (!socketRef.current || !content.trim()) return;
      socketRef.current.emit("message:send", { content, room, replyTo });
    },
    [],
  );

  const sendReaction = useCallback(
    (messageId: string, room: string, emoji: string) => {
      if (!socketRef.current) return;
      socketRef.current.emit("message:react", { messageId, room, emoji });
    },
    [],
  );

  const startTyping = useCallback((room: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("typing:start", { room });
  }, []);

  const stopTyping = useCallback((room: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("typing:stop", { room });
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("room:join", { roomId });
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("room:leave", { roomId });
  }, []);

  const createRoom = useCallback(
    (name: string, type: "group" | "study-group" | "direct") => {
      if (!socketRef.current) return;
      socketRef.current.emit("room:create", { name, type, members: [userId] });
    },
    [userId],
  );

  const getHistory = useCallback(
    (room: string, limit?: number): Promise<ChatMessage[]> => {
      return new Promise((resolve) => {
        if (!socketRef.current) {
          resolve([]);
          return;
        }
        socketRef.current.emit(
          "message:history",
          { room, limit },
          (response: { messages: ChatMessage[] }) => {
            resolve(response?.messages || []);
          },
        );
      });
    },
    [],
  );

  const getRooms = useCallback((): Promise<ChatRoom[]> => {
    return new Promise((resolve) => {
      if (!socketRef.current) {
        resolve([]);
        return;
      }
      socketRef.current.emit(
        "room:list",
        undefined,
        (response: { rooms: ChatRoom[] }) => {
          resolve(response?.rooms || []);
        },
      );
    });
  }, []);

  const onNewMessage = useCallback(
    (callback: (message: ChatMessage) => void) => {
      if (!socketRef.current) return () => {};
      socketRef.current.on("message:new", callback);
      return () => {
        socketRef.current?.off("message:new", callback);
      };
    },
    [],
  );

  const onMessageUpdated = useCallback(
    (callback: (message: ChatMessage) => void) => {
      if (!socketRef.current) return () => {};
      socketRef.current.on("message:updated", callback);
      return () => {
        socketRef.current?.off("message:updated", callback);
      };
    },
    [],
  );

  const onRoomCreated = useCallback((callback: (room: ChatRoom) => void) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on("room:created", callback);
    return () => {
      socketRef.current?.off("room:created", callback);
    };
  }, []);

  return {
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendReaction,
    startTyping,
    stopTyping,
    joinRoom,
    leaveRoom,
    createRoom,
    getHistory,
    getRooms,
    onNewMessage,
    onMessageUpdated,
    onRoomCreated,
  };
}
