'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, ThumbsUp, MessageCircle, Tag, Clock, Search, TrendingUp, Pin } from 'lucide-react';

interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: { name: string; avatarUrl: string | null; level: number };
  upvotes: number;
  viewCount: number;
  replyCount: number;
  pinned: boolean;
  createdAt: string;
}

export function DiscussionForum() {
  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: '1',
      title: 'Best resources for learning subnetting?',
      content: 'I\'m struggling with CIDR notation and subnet calculations. Any recommended resources or tips?',
      category: 'help',
      tags: ['networking', 'subnetting', 'resources'],
      author: { name: 'Alex Kim', avatarUrl: null, level: 12 },
      upvotes: 24,
      viewCount: 156,
      replyCount: 8,
      pinned: false,
      createdAt: '2h ago',
    },
    {
      id: '2',
      title: '🎯 Weekly Challenge: Build a Network Scanner',
      content: 'This week\'s challenge: Build a simple network scanner using Python and scapy. Share your solutions!',
      category: 'challenge',
      tags: ['python', 'networking', 'challenge'],
      author: { name: 'StudyAI Bot', avatarUrl: null, level: 99 },
      upvotes: 45,
      viewCount: 312,
      replyCount: 15,
      pinned: true,
      createdAt: '1d ago',
    },
    {
      id: '3',
      title: 'My journey from zero to ethical hacker',
      content: 'After 6 months of studying on StudyAI, I passed my CEH exam! Here\'s what I learned...',
      category: 'career',
      tags: ['cybersecurity', 'career', 'certification'],
      author: { name: 'Sarah Chen', avatarUrl: null, level: 42 },
      upvotes: 89,
      viewCount: 567,
      replyCount: 23,
      pinned: false,
      createdAt: '3d ago',
    },
    {
      id: '4',
      title: 'React vs Vue in 2026 - Which should I learn?',
      content: 'Starting a new project and can\'t decide between React and Vue. What are your thoughts?',
      category: 'general',
      tags: ['javascript', 'react', 'vue', 'discussion'],
      author: { name: 'Marcus Lee', avatarUrl: null, level: 28 },
      upvotes: 34,
      viewCount: 234,
      replyCount: 19,
      pinned: false,
      createdAt: '5d ago',
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  const categories = [
    { id: 'general', label: 'General', icon: MessageSquare },
    { id: 'help', label: 'Help', icon: MessageCircle },
    { id: 'challenge', label: 'Challenges', icon: TrendingUp },
    { id: 'career', label: 'Career', icon: Tag },
  ];

  const filtered = discussions.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !selectedCategory || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-500" />
          Discussion Forum
        </h3>
        <button
          onClick={() => setShowNewPost(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-all"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search discussions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            !selectedCategory
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            <cat.icon className="w-3.5 h-3.5" /> {cat.label}
          </button>
        ))}
      </div>

      {/* Discussions */}
      <div className="space-y-3">
        {filtered.map((discussion, i) => (
          <motion.div
            key={discussion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500/30 transition-all cursor-pointer"
          >
            {discussion.pinned && (
              <div className="flex items-center gap-1 text-yellow-500 text-xs font-medium mb-2">
                <Pin className="w-3 h-3" /> Pinned
              </div>
            )}

            <h4 className="font-medium text-gray-900 dark:text-white">{discussion.title}</h4>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{discussion.content}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {discussion.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs">
                  {discussion.author.name[0]}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{discussion.author.name}</span>
                <span className="text-xs text-gray-400">Lvl {discussion.author.level}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" /> {discussion.upvotes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" /> {discussion.replyCount}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {discussion.createdAt}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
