'use client';

import React from 'react';
import { Search, Flame, Award } from 'lucide-react';

interface HeaderProps {
  streak: number;
  userXP: number;
  checkedIn: boolean;
  onCheckIn: () => void;
}

export function Header({ streak, userXP, checkedIn, onCheckIn }: HeaderProps) {
  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md px-6 flex items-center justify-between z-10">
      {/* Left search */}
      <div className="relative w-80 max-w-xs">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search concepts, labs, tools..."
          className="w-full h-9 pl-9 pr-4 rounded-xl bg-zinc-900/40 border border-zinc-800 focus:border-zinc-700 focus:outline-none text-sm placeholder-zinc-500 transition-all"
        />
      </div>

      {/* Right Status */}
      <div className="flex items-center gap-4">
        {/* Daily check-in button */}
        <button
          onClick={onCheckIn}
          disabled={checkedIn}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300 ${
            checkedIn
              ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
              : 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-orange-500/40 text-orange-400 hover:from-orange-500/30 hover:to-yellow-500/30 glow-orange cursor-pointer'
          }`}
        >
          <Flame className={`w-4 h-4 ${checkedIn ? '' : 'animate-bounce'}`} />
          <span>{checkedIn ? 'Checked In!' : 'Check In (+100 XP)'}</span>
        </button>

        {/* Streak widget */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900/50 rounded-full border border-zinc-800">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="text-xs font-bold text-orange-400">{streak} Days</span>
        </div>

        {/* XP widget */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-zinc-900/80 via-purple-900/20 to-zinc-900/80 bg-[length:200%_100%] animate-gradient-shift rounded-full border border-cyber-purple/30">
          <Award className="w-4 h-4 text-cyber-purple" />
          <span className="text-xs font-bold text-zinc-300">{userXP} XP</span>
        </div>
      </div>
    </header>
  );
}
