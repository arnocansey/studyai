'use client';

import React, { useState } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface AiChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AiChat({ isOpen, onToggle }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I am your AI Study Coach. Ask me anything about programming, subnetting, or security exploits!' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userPrompt = input;
    const userMsg: ChatMessage = { role: 'user', content: userPrompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await apiFetch<{ explanation: string }>('/ai/explain', {
        method: 'POST',
        body: JSON.stringify({ prompt: userPrompt }),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.explanation }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I\'m currently offline. Try asking me about TCP Handshake, Subnetting, or SQL Injection!' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-cyber-purple to-cyber-blue text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 cursor-pointer glow-purple"
      >
        {isOpen ? (
          <ChevronRight className="w-6 h-6 rotate-90" />
        ) : (
          <Sparkles className="w-6 h-6 animate-pulse" />
        )}
      </button>

      {/* Chat Sidebar/Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-80 bg-zinc-950 border-l border-zinc-800 shadow-2xl z-40 transition-all duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col justify-between`}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyber-purple" />
            <h3 className="font-bold text-sm text-zinc-200">AI Study Tutor</h3>
          </div>
          <button onClick={onToggle} className="text-xs text-zinc-500 hover:text-zinc-300">
            Close
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-zinc-800/40 text-zinc-100 ml-auto border border-zinc-700/20'
                  : 'bg-cyber-purple/5 border border-cyber-purple/10 text-zinc-300'
              }`}
            >
              {msg.content.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </div>
          ))}
          {isLoading && (
            <div className="p-3 rounded-xl bg-cyber-purple/5 border border-cyber-purple/10 text-zinc-300 text-xs">
              <span className="animate-pulse">Thinking...</span>
            </div>
          )}
        </div>

        {/* Footer Chat Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 space-y-2 bg-zinc-900/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask: 'TCP Handshake', 'Subnetting'..."
              className="flex-1 h-9 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 placeholder-zinc-600 focus:border-cyber-purple focus:outline-none transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 rounded-lg bg-cyber-purple text-zinc-950 font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              Ask
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
