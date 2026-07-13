'use client';

import { LiveChat } from '@/components/chat';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 md:p-8">
      <LiveChat />
    </div>
  );
}
