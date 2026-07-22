"use client";

import { FormEvent, useEffect, useState } from "react";
import { Brain, Lightbulb, Send, Sparkles, Wand2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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

interface PracticeQuestion {
  question: string;
  options: string[];
  correctAnswer?: string;
}

interface LessonMentorPanelProps {
  lessonId: string;
  lessonTitle?: string;
  workspaceContext?: string;
}

export function LessonMentorPanel({
  lessonId,
  lessonTitle,
  workspaceContext,
}: LessonMentorPanelProps) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [hint, setHint] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [practice, setPractice] = useState<PracticeQuestion[]>([]);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setBooting(true);
    apiFetch<Array<{ id: string }>>(
      `/ai/conversations?lessonId=${encodeURIComponent(lessonId)}`,
    )
      .then(async (list) => {
        if (cancelled || !list?.[0]?.id) return;
        const full = await apiFetch<{
          id: string;
          messages: Array<{ role: string; content: string }>;
        }>(`/ai/conversations/${list[0].id}`);
        if (cancelled || !full) return;
        setConversationId(full.id);
        setMessages(
          (full.messages || []).map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        );
      })
      .catch(() => {
        /* fresh conversation is fine */
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const content = input.trim();
    const userMessage: TutorMessage = { role: "user", content };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");
    setHint("");

    try {
      const prompt =
        workspaceContext && workspaceContext.trim()
          ? `${content}\n\n[Workspace]\n${workspaceContext.slice(0, 1500)}`
          : content;

      const data = await apiFetch<TutorResponse>("/ai/tutor", {
        method: "POST",
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: prompt }],
          lessonId,
          conversationId: conversationId || undefined,
          topic: lessonTitle,
        }),
      });

      setConversationId(data.conversationId);
      setMessages([...next, { role: "assistant", content: data.response }]);
      setFollowUp(data.followUp || "");
      setHint(data.hint || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mentor unavailable");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const generatePractice = async () => {
    setPracticeLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ questions: PracticeQuestion[] }>(
        "/ai/quiz/generate",
        {
          method: "POST",
          body: JSON.stringify({ lessonId, count: 3, save: false }),
        },
      );
      setPractice(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quiz generation failed");
    } finally {
      setPracticeLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold">AI Mentor</h3>
            <p className="text-[10px] text-muted-foreground">
              {lessonTitle
                ? `Guiding: ${lessonTitle}`
                : "Lesson-aware Socratic coach"}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Persisted
        </Badge>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border bg-muted/20 p-4">
        {booting ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Ask about this lesson. I will guide you with questions instead of
            dumping answers. Your chat is saved so you can continue later.
          </p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={`${msg.role}-${i}`}
              className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "ml-8 bg-primary/15 text-foreground"
                  : "mr-8 bg-card text-muted-foreground"
              }`}
            >
              {msg.content}
            </div>
          ))
        )}
        {loading ? (
          <p className="text-xs text-muted-foreground">Thinking…</p>
        ) : null}
        {hint ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
            <p className="mb-1 flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
              <Lightbulb className="h-3 w-3" /> Hint
            </p>
            <p>{hint}</p>
          </div>
        ) : null}
        {followUp && !loading ? (
          <p className="text-xs italic text-muted-foreground">
            Follow-up: {followUp}
          </p>
        ) : null}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your mentor…"
          disabled={loading}
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Wand2 className="h-4 w-4" />
            Practice quiz
          </CardTitle>
          <CardDescription className="text-xs">
            Generate AI questions from this lesson (draft — not saved to the
            bank).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={generatePractice}
            disabled={practiceLoading}
          >
            {practiceLoading ? "Generating…" : "Generate 3 questions"}
          </Button>
          {practice.map((q, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border p-3 text-xs"
            >
              <p className="font-semibold text-foreground">
                {idx + 1}. {q.question}
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {q.options.map((opt) => (
                  <li key={opt}>• {opt}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
