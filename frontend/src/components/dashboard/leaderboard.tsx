'use client';

import React from 'react';
import { Trophy } from 'lucide-react';

interface LeaderboardProps {
  userXP: number;
  username: string;
}

export function Leaderboard({ userXP, username }: LeaderboardProps) {
  const leaderboardData = [
    { rank: 1, name: 'NullPointer', xp: 14200, self: false },
    { rank: 2, name: 'SubnetSamurai', xp: 12100, self: false },
    { rank: 3, name: 'CryptoDaemon', xp: 9800, self: false },
    { rank: 4, name: 'BufferOverflow', xp: 8400, self: false },
    { rank: 5, name: `${username} (You)`, xp: userXP, self: true },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-white">Global Leaderboards</h2>
      <p className="text-zinc-400 text-sm">Compete with engineers worldwide. Earn XP points by completing labs, challenges, and check-ins.</p>

      <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-800 max-w-2xl space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-900 pb-2">
          <span>Rank & Name</span>
          <span>XP Points</span>
        </div>

        <div className="space-y-3">
          {leaderboardData.map((lead) => (
            <div
              key={lead.rank}
              className={`flex justify-between items-center px-4 py-3 rounded-xl border ${
                lead.self
                  ? 'bg-cyber-purple/10 border-cyber-purple/30 text-cyber-purple'
                  : 'bg-zinc-900/30 border-zinc-800/80 text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-sm font-bold text-zinc-500">{lead.rank}</span>
                <span className="text-sm font-semibold">{lead.name}</span>
              </div>
              <span className="text-sm font-bold">{lead.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
