"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Lightbulb, Send, Brain } from "lucide-react";
import { bffFetch } from "@/lib/api";

interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

interface TutorResponse {
  response: string;
  followUp: string;
  hint: string;
}

export function SocraticTutor({ topic }: { topic?: string }) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<TutorResponse | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: TutorMessage = { role: "user", content };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
        const data = await bffFetch<TutorResponse>("/api/ai/tutor", {
          method: "POST",
          body: JSON.stringify({ messages: newMessages, topic }),
        });

        setResponse(data);

        setMessages([
          ...newMessages,
          { role: "assistant", content: data.response },
        ]);
      } catch (error) {
        console.error("Tutor error:", error);
      } finally {
        setLoading(false);
      }
    },
    [messages, topic],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Socratic Tutor
            </h3>
            <p className="text-xs text-gray-500">
              I'll guide you to the answer
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-yellow-500 opacity-50" />
            <p className="font-medium">Ask me anything!</p>
            <p className="text-sm mt-1">
              I'll help you discover the answer rather than just giving it to
              you.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        {response?.hint && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-3">
              <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Hint
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                {response.hint}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && sendMessage(input)
            }
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-indigo-700 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {response?.followUp && !loading && (
          <p className="text-sm text-gray-500 mt-2 italic">
            💬 {response.followUp}
          </p>
        )}
      </div>
    </div>
  );
}
