"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Hash, Search, Bell, BellOff, Users, Reply, X } from "lucide-react";
import { useChatSocket, ChatMessage, ChatRoom } from "@/hooks/use-chat-socket";
import { ChatSidebar } from "./chat-sidebar";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { useAuthStore } from "@/lib/auth-store";

const DEFAULT_ROOMS: ChatRoom[] = [
  { id: "general", name: "General", type: "group", members: [] },
  { id: "help", name: "Help & Questions", type: "group", members: [] },
  { id: "study", name: "Study Group", type: "study-group", members: [] },
];

export function LiveChat() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const currentUserId = user?.id || "";
  const currentUserName = user?.name || user?.email || "You";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>(DEFAULT_ROOMS);
  const [currentRoom, setCurrentRoom] = useState("general");
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage: socketSend,
    sendReaction,
    startTyping,
    stopTyping,
    getHistory,
    getRooms,
    onNewMessage,
    onMessageUpdated,
    onRoomCreated,
  } = useChatSocket({
    userId: currentUserId,
    userName: currentUserName,
    token,
  });

  useEffect(() => {
    if (!isConnected) return;

    getHistory(currentRoom, 50).then((history) => {
      setMessages(history);
    });

    getRooms().then((roomList) => {
      if (roomList.length > 0) {
        setRooms(roomList);
      }
    });
  }, [isConnected, currentRoom, getHistory, getRooms]);

  useEffect(() => {
    const unsub = onNewMessage((message) => {
      if (message.room === currentRoom) {
        setMessages((prev) => [...prev, message]);
      }
    });
    return unsub;
  }, [onNewMessage, currentRoom]);

  useEffect(() => {
    const unsub = onMessageUpdated((updated) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updated.id ? updated : msg)),
      );
    });
    return unsub;
  }, [onMessageUpdated]);

  useEffect(() => {
    const unsub = onRoomCreated((room) => {
      setRooms((prev) => {
        if (prev.find((r) => r.id === room.id)) return prev;
        return [...prev, room];
      });
    });
    return unsub;
  }, [onRoomCreated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;
    socketSend(input, currentRoom, replyTo?.id);
    setInput("");
    setReplyTo(null);
    stopTyping(currentRoom);
  }, [input, currentRoom, replyTo, socketSend, stopTyping]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      startTyping(currentRoom);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(currentRoom);
      }, 2000);
    },
    [currentRoom, startTyping, stopTyping],
  );

  const handleRoomChange = useCallback(
    (roomId: string) => {
      setCurrentRoom(roomId);
      setMessages([]);
      getHistory(roomId, 50).then(setMessages);
    },
    [getHistory],
  );

  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      sendReaction(messageId, currentRoom, emoji);
      setShowEmoji(null);
    },
    [currentRoom, sendReaction],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        sendMessage();
      }
    },
    [sendMessage],
  );

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentRoomName = rooms.find((r) => r.id === currentRoom)?.name || "";

  if (!token || !currentUserId) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Sign in to use live chat.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <ChatSidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onRoomChange={handleRoomChange}
        onlineUsers={onlineUsers}
        isConnected={isConnected}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-gray-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {currentRoomName}
            </h4>
            {!isConnected && (
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                Disconnected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Search className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {isMuted ? (
                <BellOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Bell className="w-4 h-4 text-gray-500" />
              )}
            </button>
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {onlineUsers.length + 1}
              </span>
            </div>
          </div>
        </div>

        {showSearch && (
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          </div>
        )}

        <MessageList
          ref={messagesEndRef}
          messages={messages.filter(
            (m) =>
              m.room === currentRoom &&
              (!searchQuery ||
                m.content.toLowerCase().includes(searchQuery.toLowerCase())),
          )}
          currentUserId={currentUserId}
          currentRoom={currentRoom}
          showEmoji={showEmoji}
          onToggleEmoji={(id) => setShowEmoji(showEmoji === id ? null : id)}
          onReact={addReaction}
          onReply={setReplyTo}
          typingUsers={typingUsers}
          formatTime={formatTime}
        />

        {replyTo && (
          <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-t border-purple-200 dark:border-purple-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Reply className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Replying to{" "}
                <span className="font-medium text-purple-600">
                  {replyTo.userName}
                </span>
              </span>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1 hover:bg-purple-100 dark:hover:bg-purple-800 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        <ChatInput
          input={input}
          onInputChange={handleInputChange}
          onSend={sendMessage}
          onKeyDown={handleKeyDown}
          isConnected={isConnected}
          placeholder={
            isConnected ? `Message #${currentRoomName}` : "Connecting..."
          }
          inputRef={inputRef}
        />
      </div>
    </div>
  );
}
