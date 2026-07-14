'use client';

import React from 'react';
import { BookOpen, Code, Terminal, Trophy, Cpu, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  username: string;
  userRole: string;
}

export function Sidebar({ activeTab, onTabChange, username, userRole }: SidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'courses', label: 'Courses', icon: Code },
    { id: 'labs', label: 'Simulated Labs', icon: Terminal },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md flex flex-col justify-between hidden md:flex">
      <div>
        {/* Logo */}
        <div className="h-16 px-6 border-b border-zinc-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyber-purple to-cyber-blue flex items-center justify-center shadow-lg">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">StudyAI</span>
            <span className="w-2 h-2 rounded-full bg-cyber-green inline-block ml-1 animate-pulse" />
          </div>
        </div>

        {/* Nav Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-zinc-800/40 text-white font-medium shadow-inner border border-zinc-700/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* User Card + Logout */}
      <div className="p-4 border-t border-zinc-800/80 space-y-3">
        <div className="flex items-center gap-3 p-2 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-purple via-cyber-blue to-cyber-green p-[2px]">
            <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center font-bold text-sm">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{username}</p>
            <p className="text-xs text-zinc-500">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-900/30 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
