"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  ThumbsUp,
  MessageCircle,
  Tag,
  Clock,
  Search,
  TrendingUp,
  Pin,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: { name: string | null; avatarUrl: string | null; level: number };
  upvotes: number;
  viewCount: number;
  replyCount: number;
  pinned: boolean;
  createdAt: string;
}

function formatRelative(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function DiscussionForum() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "general",
    tags: "",
  });
  const [saving, setSaving] = useState(false);

  const categories = [
    { id: "general", label: "General", icon: MessageSquare },
    { id: "help", label: "Help", icon: MessageCircle },
    { id: "challenge", label: "Challenges", icon: TrendingUp },
    { id: "career", label: "Career", icon: Tag },
  ];

  const loadDiscussions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (search.trim()) params.set("search", search.trim());
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiFetch<any[]>(`/discussions${query}`);
      setDiscussions(
        (data || []).map((d) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          category: d.category,
          tags: d.tags || [],
          author: d.author || { name: "User", avatarUrl: null, level: 1 },
          upvotes: d.upvotes || 0,
          viewCount: d.viewCount || 0,
          replyCount: d._count?.replies ?? d.replyCount ?? 0,
          pinned: !!d.pinned,
          createdAt: d.createdAt,
        })),
      );
    } catch (err) {
      setDiscussions([]);
      setError(
        err instanceof Error ? err.message : "Failed to load discussions",
      );
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDiscussions();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadDiscussions]);

  const filtered = useMemo(() => discussions, [discussions]);

  const createPost = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch("/discussions", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content.trim(),
          category: form.category,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      setForm({ title: "", content: "", category: "general", tags: "" });
      setShowNewPost(false);
      await loadDiscussions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create discussion",
      );
    } finally {
      setSaving(false);
    }
  };

  const upvote = async (id: string) => {
    try {
      await apiFetch(`/discussions/${id}/upvote`, { method: "POST" });
      setDiscussions((current) =>
        current.map((d) =>
          d.id === id ? { ...d, upvotes: d.upvotes + 1 } : d,
        ),
      );
    } catch {
      // ignore duplicate upvote errors
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <MessageSquare className="h-5 w-5 text-purple-500" />
          Discussion Forum
        </h3>
        <button
          onClick={() => setShowNewPost(true)}
          className="flex items-center gap-1 rounded-xl bg-purple-500 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-purple-600"
        >
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search discussions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-gray-100 py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-all ${
            !selectedCategory
              ? "bg-purple-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
            }
            className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-all ${
              selectedCategory === cat.id
                ? "bg-purple-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            <cat.icon className="h-3.5 w-3.5" /> {cat.label}
          </button>
        ))}
      </div>

      {showNewPost && (
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              New discussion
            </h4>
            <button
              onClick={() => setShowNewPost(false)}
              className="text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            className="w-full rounded-xl bg-gray-100 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
          />
          <textarea
            value={form.content}
            onChange={(e) =>
              setForm((f) => ({ ...f, content: e.target.value }))
            }
            placeholder="What's on your mind?"
            rows={4}
            className="w-full rounded-xl bg-gray-100 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="rounded-xl bg-gray-100 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="tags, comma, separated"
              className="min-w-[200px] flex-1 rounded-xl bg-gray-100 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={createPost}
              disabled={saving}
              className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading discussions…</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No discussions yet. Start the conversation.
          </p>
        ) : (
          filtered.map((discussion, i) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-purple-500/30 dark:border-gray-700 dark:bg-gray-800"
            >
              {discussion.pinned && (
                <div className="mb-2 flex items-center gap-1 text-xs font-medium text-yellow-500">
                  <Pin className="h-3 w-3" /> Pinned
                </div>
              )}
              <h4 className="font-medium text-gray-900 dark:text-white">
                {discussion.title}
              </h4>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                {discussion.content}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {discussion.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-xs text-white">
                    {(discussion.author.name || "U")[0]}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {discussion.author.name || "User"}
                  </span>
                  <span className="text-xs text-gray-400">
                    Lvl {discussion.author.level}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void upvote(discussion.id);
                    }}
                    className="flex items-center gap-1 hover:text-purple-500"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> {discussion.upvotes}
                  </button>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />{" "}
                    {discussion.replyCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />{" "}
                    {formatRelative(discussion.createdAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
