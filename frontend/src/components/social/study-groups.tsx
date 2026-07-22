"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Search, BookOpen, X } from "lucide-react";
import { bffFetch } from "@/lib/api";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  maxMembers: number;
  memberCount: number;
  creator: { id: string; name: string; avatarUrl: string | null };
  members: {
    userId: string;
    role: string;
    user: { name: string; avatarUrl: string | null };
  }[];
  createdAt: string;
  isPublic: boolean;
}

export function StudyGroupList() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGroups = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await bffFetch<StudyGroup[]>("/api/study-groups");
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      setGroups([]);
      setError(
        err instanceof Error ? err.message : "Failed to load study groups",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGroups();
  }, []);

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.topic.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Users className="h-5 w-5 text-purple-500" />
          Study Groups
        </h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 rounded-xl bg-purple-500 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-purple-600"
        >
          <Plus className="h-4 w-4" /> Create
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-gray-100 py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnimatePresence>
          {filtered.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-purple-500/50 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-medium text-gray-900 dark:text-white">
                    {group.name}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                    {group.description}
                  </p>
                </div>
                {group.isPublic && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Public
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" /> {group.topic}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {group.memberCount}/
                  {group.maxMembers}
                </span>
              </div>

              <div className="mt-3 flex items-center">
                <div className="flex -space-x-2">
                  {(group.members || []).slice(0, 5).map((m, idx) => (
                    <div
                      key={idx}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-purple-500 to-indigo-600 text-xs font-medium text-white dark:border-gray-800"
                    >
                      {m.user?.name?.[0] || "?"}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && !loading && (
        <div className="py-8 text-center text-gray-500">
          <Users className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p>No study groups found</p>
        </div>
      )}

      <CreateGroupModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);
          void loadGroups();
        }}
      />
    </div>
  );
}

function CreateGroupModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    topic: "programming",
    maxMembers: 10,
    isPublic: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    setLoading(true);
    setError("");
    try {
      await bffFetch("/api/study-groups", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create Study Group
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl bg-gray-100 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full resize-none rounded-xl bg-gray-100 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Topic
              </label>
              <select
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full rounded-xl bg-gray-100 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="programming">Programming</option>
                <option value="networking">Networking</option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="cloud">Cloud Computing</option>
                <option value="ai">AI/ML</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Members
              </label>
              <input
                type="number"
                value={form.maxMembers}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxMembers: parseInt(e.target.value) || 10,
                  })
                }
                min={2}
                max={50}
                className="w-full rounded-xl bg-gray-100 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              className="h-4 w-4 rounded text-purple-500"
            />
            Make this group public
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2 text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={create}
            disabled={!form.name.trim() || loading}
            className="flex-1 rounded-xl bg-purple-500 py-2 font-medium text-white transition-all hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
