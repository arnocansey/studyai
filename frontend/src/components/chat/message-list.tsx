'use client';

import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Smile, Reply } from 'lucide-react';
import { ChatMessage } from '@/hooks/use-chat-socket';
import { ReactionBar } from './reaction-bar';
import { EmojiPicker } from './emoji-picker';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  currentRoom: string;
  showEmoji: string | null;
  onToggleEmoji: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: ChatMessage) => void;
  typingUsers: string[];
  formatTime: (date: Date) => string;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(function MessageList(
  { messages, currentUserId, currentRoom, showEmoji, onToggleEmoji, onReact, onReply, typingUsers, formatTime },
  ref
) {
  const filteredMessages = messages.filter((m) => m.room === currentRoom);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {filteredMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">No messages yet. Start the conversation!</p>
        </div>
      )}

      <AnimatePresence>
        {filteredMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`group flex gap-3 ${msg.userId === currentUserId ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 ${
              msg.userId === 'system'
                ? 'bg-yellow-500'
                : msg.userId === currentUserId
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-purple-500 to-indigo-600'
            }`}>
              {msg.userId === 'system' ? '🤖' : msg.userName[0]}
            </div>

            <div className={`max-w-[70%] ${msg.userId === currentUserId ? 'text-right' : ''}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-medium text-gray-900 dark:text-white text-sm">{msg.userName}</span>
                <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
              </div>

              {msg.replyTo && (
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <Reply className="w-3 h-3" /> Replying to a message
                </div>
              )}

              <div
                className={`inline-block px-4 py-2 rounded-2xl ${
                  msg.userId === currentUserId
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                    : msg.userId === 'system'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-gray-700 dark:text-gray-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>

              <ReactionBar reactions={msg.reactions || []} onReact={(emoji) => onReact(msg.id, emoji)} currentUserId={currentUserId} />

              <div className="hidden group-hover:flex items-center gap-1 mt-1">
                <button
                  onClick={() => onToggleEmoji(msg.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <Smile className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={() => onReply(msg)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <Reply className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {showEmoji === msg.id && (
                  <div className="absolute mt-8 z-10">
                    <EmojiPicker onSelect={(emoji) => onReact(msg.id, emoji)} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {typingUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-gray-500 text-sm"
        >
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
        </motion.div>
      )}

      <div ref={ref} />
    </div>
  );
});
