"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useVideoSocket } from "@/hooks/use-video-socket";
import { useAuthStore } from "@/lib/auth-store";

interface VideoTutoringProps {
  sessionId?: string;
}

export function VideoTutoring({
  sessionId: sessionIdProp,
}: VideoTutoringProps) {
  const user = useAuthStore((s) => s.user);
  const sessionId = useMemo(
    () => sessionIdProp || `study-${user?.id || "guest"}-lobby`,
    [sessionIdProp, user?.id],
  );
  const { connected, participants, toggleAudio, toggleVideo } =
    useVideoSocket(sessionId);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const displayPeople =
    participants.length > 0
      ? participants.map((p) => ({
          id: p.userId,
          name: p.userName,
          isMuted: p.audioEnabled === false,
          isVideoOff: p.videoEnabled === false,
        }))
      : [
          {
            id: user?.id || "you",
            name: user?.name || "You",
            isMuted,
            isVideoOff,
          },
        ];

  return (
    <div
      className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-background" : "h-full"}`}
    >
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${connected ? "animate-pulse bg-success" : "bg-muted-foreground"}`}
          />
          <span className="font-medium">Study Session</span>
          <span className="text-sm text-muted-foreground">
            {formatDuration(duration)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {connected ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            {connected ? "Live" : "Connecting…"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> {displayPeople.length}
          </span>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            type="button"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-muted/30 p-4">
        <div
          className={`grid h-full gap-4 ${displayPeople.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
        >
          {displayPeople.map((p) => (
            <div
              key={p.id}
              className="relative overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
                    {(p.name || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-lg font-medium">{p.name}</p>
                </div>
              </div>
              {p.isMuted ? (
                <div className="absolute bottom-4 right-4 rounded-full bg-destructive p-2">
                  <MicOff className="h-4 w-4 text-destructive-foreground" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 border-t border-border bg-card p-4">
        <button
          type="button"
          className="rounded-full bg-secondary p-3"
          onClick={() => {
            const next = !isMuted;
            setIsMuted(next);
            toggleAudio(!next);
          }}
        >
          {isMuted ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>
        <button
          type="button"
          className="rounded-full bg-secondary p-3"
          onClick={() => {
            const next = !isVideoOff;
            setIsVideoOff(next);
            toggleVideo(!next);
          }}
        >
          {isVideoOff ? (
            <VideoOff className="h-5 w-5" />
          ) : (
            <Video className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
