'use client';

import { Hash, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { ChatRoom } from '@/hooks/use-chat-socket';

interface OnlineUser {
  userId: string;
  userName: string;
}

interface ChatSidebarProps {
  rooms: ChatRoom[];
  currentRoom: string;
  onRoomChange: (roomId: string) => void;
  onlineUsers: OnlineUser[];
  isConnected: boolean;
}

export function ChatSidebar({ rooms, currentRoom, onRoomChange, onlineUsers, isConnected }: ChatSidebarProps) {
  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-500" />
            Chat
          </h3>
          <div className="flex items-center gap-1">
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-red-500" />
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <p className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Channels</p>
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => onRoomChange(room.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
              currentRoom === room.id
                ? 'bg-purple-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span className="flex-1 truncate">{room.name}</span>
          </button>
        ))}

        <p className="text-xs font-semibold text-gray-500 uppercase px-2 mt-6 mb-2">
          Online — {onlineUsers.length + 1}
        </p>
        <div className="flex items-center gap-2 px-3 py-1.5">
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs">
              Y
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">You</span>
        </div>
        {onlineUsers.map((user) => (
          <div key={user.userId} className="flex items-center gap-2 px-3 py-1.5">
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs">
                {user.userName[0]}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.userName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
