"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Send, Brain } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

interface TutorResponse {
  response: string;
  followUp: string;
  hint: string;
  conversationId: string;
}

export function SocraticTutor({
  topic,
  lessonId,
}: {
  topic?: string;
  lessonId?: string;
}) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
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
        const data = await apiFetch<TutorResponse>("/ai/tutor", {
          method: "POST",
          body: JSON.stringify({
            messages: newMessages,
            topic,
            lessonId,
            conversationId: conversationId || undefined,
          }),
        });

        setResponse(data);
        setConversationId(data.conversationId);
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
    [messages, topic, lessonId, conversationId],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Socratic Mentor</h3>
            <p className="text-xs text-muted-foreground">
              Guided discovery · chats are saved
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-amber-500 opacity-50" />
            <p className="font-medium">Ask me anything!</p>
            <p className="text-sm mt-1">
              I&apos;ll help you discover the answer rather than just giving it
              to you.
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
              className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
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
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Hint
              </p>
              <p className="text-sm mt-1">{response.hint}</p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && sendMessage(input)
            }
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {response?.followUp && !loading && (
          <p className="text-sm text-muted-foreground mt-2 italic">
            {response.followUp}
          </p>
        )}
      </div>
    </div>
  );
}
