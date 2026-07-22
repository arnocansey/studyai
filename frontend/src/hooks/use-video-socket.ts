"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/lib/auth-store";

const DEFAULT_WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

type Participant = {
  userId: string;
  userName: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
};

export function useVideoSocket(sessionId?: string) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !sessionId) {
      setConnected(false);
      return;
    }

    const socket = io(`${DEFAULT_WS_URL}/video`, {
      auth: { token },
      query: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit(
        "join-session",
        { sessionId },
        (ack?: { success?: boolean; participants?: Participant[] }) => {
          const others = ack?.participants || [];
          const self: Participant = {
            userId: user?.id || "self",
            userName: user?.name || "You",
            audioEnabled: true,
            videoEnabled: true,
          };
          setParticipants([self, ...others]);
        },
      );
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    socket.on(
      "peer-joined",
      (p: { userId: string; userName: string; sessionId: string }) => {
        setParticipants((prev) =>
          prev.some((x) => x.userId === p.userId)
            ? prev
            : [
                ...prev,
                {
                  userId: p.userId,
                  userName: p.userName,
                  audioEnabled: true,
                  videoEnabled: true,
                },
              ],
        );
      },
    );
    socket.on("peer-left", (p: { userId: string }) => {
      setParticipants((prev) => prev.filter((x) => x.userId !== p.userId));
    });
    socket.on("audio-toggled", (p: { userId: string; isMuted: boolean }) => {
      setParticipants((prev) =>
        prev.map((x) =>
          x.userId === p.userId ? { ...x, audioEnabled: !p.isMuted } : x,
        ),
      );
    });
    socket.on("video-toggled", (p: { userId: string; isVideoOff: boolean }) => {
      setParticipants((prev) =>
        prev.map((x) =>
          x.userId === p.userId ? { ...x, videoEnabled: !p.isVideoOff } : x,
        ),
      );
    });

    return () => {
      socket.emit("leave-session", { sessionId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, sessionId, user?.id, user?.name]);

  const toggleAudio = (enabled: boolean) => {
    socketRef.current?.emit("toggle-audio", {
      sessionId,
      isMuted: !enabled,
    });
    if (user?.id) {
      setParticipants((prev) =>
        prev.map((x) =>
          x.userId === user.id ? { ...x, audioEnabled: enabled } : x,
        ),
      );
    }
  };
  const toggleVideo = (enabled: boolean) => {
    socketRef.current?.emit("toggle-video", {
      sessionId,
      isVideoOff: !enabled,
    });
    if (user?.id) {
      setParticipants((prev) =>
        prev.map((x) =>
          x.userId === user.id ? { ...x, videoEnabled: enabled } : x,
        ),
      );
    }
  };

  return {
    connected,
    participants,
    toggleAudio,
    toggleVideo,
    socket: socketRef.current,
  };
}
