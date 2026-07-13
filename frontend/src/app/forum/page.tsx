"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, ThumbsUp, Search, Sparkles, Tag, ArrowLeft, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";

interface Thread {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  category: string;
  likes: number;
  replies: number;
  snippet: string;
  createdAt: string;
}

export default function ForumPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "thread-1",
      title: "Buffer overflow offset calculation for vuln-helper",
      author: "CryptoDaemon",
      authorRole: "Level 18 Elite Hacker",
      category: "Cybersecurity",
      likes: 24,
      replies: 7,
      snippet: "I'm trying to exploit the SUID vuln-helper binary. I noticed that 16 characters overwrite the buffer, but I keep getting a segfault instead of shell execution. Any payload tips?",
      createdAt: "2 hours ago"
    },
    {
      id: "thread-2",
      title: "Understanding classless subnet divisions (/26 vs /27)",
      author: "SubnetSamurai",
      authorRole: "Level 15 Network Architect",
      category: "Networking",
      likes: 18,
      replies: 4,
      snippet: "Can anyone explain the host bit borrowing math? I get that borrowing 2 bits creates 4 subnets with 62 hosts, but how does /27 divide class C ranges?",
      createdAt: "5 hours ago"
    },
    {
      id: "thread-3",
      title: "Why use print() vs sys.stdout.write() in Python automation scripts?",
      author: "NullPointer",
      authorRole: "Level 22 Staff Dev",
      category: "Programming",
      likes: 32,
      replies: 12,
      snippet: "What are the performance implications when writing massive logs? I heard sys.stdout bypasses the automatic newline overhead but print is more readable.",
      createdAt: "1 day ago"
    }
  ]);

  // Auth Redirect check
  useEffect(() => {
    const session = localStorage.getItem("studyai_session");
    if (!session) {
      router.push("/login");
    }
  }, [router]);

  const filteredThreads = threads.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.snippet.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 cyber-grid flex">
      
      {/* Sidebar Nav */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/60 backdrop-blur-md flex flex-col justify-between hidden md:flex">
        <div>
          <div className="h-16 px-6 border-b border-zinc-800/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyber-purple to-cyber-blue flex items-center justify-center shadow-lg">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">StudyAI Forum</span>
          </div>

          <nav className="p-4 space-y-1">
            <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 transition-all">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        
        {/* Forum Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white">Student Discussions</h1>
            <p className="text-xs text-zinc-400">Ask questions, share code payloads, and configure network layouts with other cadets.</p>
          </div>

          <div className="relative w-80">
            <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threads and issues..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-zinc-950 border border-zinc-850 focus:border-cyber-purple text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Categories Tab */}
        <div className="flex gap-2">
          {["All", "Programming", "Networking", "Cybersecurity"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${selectedCategory === cat ? "bg-cyber-purple/10 border-cyber-purple/40 text-cyber-purple" : "bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:text-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Threads List */}
        <div className="space-y-4">
          {filteredThreads.length > 0 ? (
            filteredThreads.map((thread) => (
              <div 
                key={thread.id}
                className="p-5 rounded-2xl bg-zinc-950/30 border border-zinc-850 hover:border-zinc-700/60 hover:bg-zinc-900/10 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-cyber-purple px-2 py-0.5 bg-cyber-purple/10 rounded-full border border-cyber-purple/20">
                      {thread.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">• {thread.createdAt}</span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-200 hover:text-cyber-purple cursor-pointer transition-colors">
                    {thread.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {thread.snippet}
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-[8px] text-zinc-400">
                      {thread.author[0]}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-semibold">{thread.author}</span>
                    <span className="text-[10px] text-zinc-600">({thread.authorRole})</span>
                  </div>
                </div>

                {/* Counters */}
                <div className="flex gap-4 flex-shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-850 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{thread.likes}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-850 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{thread.replies}</span>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-zinc-950/20 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-zinc-650" />
              <p className="text-sm font-semibold text-zinc-400">No threads found matching your query.</p>
              <button 
                onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                className="text-xs text-cyber-purple underline"
              >
                Clear Search filters
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
