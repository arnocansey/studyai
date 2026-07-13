'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, TrendingUp, Users } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatarUrl: string | null;
  xp: number;
  streak: number;
  level: number;
}

export function Leaderboard({ type = 'xp' }: { type?: 'xp' | 'streak' | 'level' }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [selectedType, setSelectedType] = useState(type);

  useEffect(() => {
    fetch(`/api/gamification/leaderboard?limit=10&type=${selectedType}`)
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {});
  }, [selectedType]);

  const typeConfig = {
    xp: { icon: TrendingUp, label: 'XP', color: 'text-purple-500' },
    streak: { icon: Flame, label: 'Streak', color: 'text-orange-500' },
    level: { icon: Trophy, label: 'Level', color: 'text-yellow-500' },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          Leaderboard
        </h3>
        <div className="flex gap-1">
          {(['xp', 'streak', 'level'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedType === t
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {typeConfig[t].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              entry.rank <= 3
                ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20'
                : 'bg-gray-50 dark:bg-gray-800/50'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                entry.rank === 1
                  ? 'bg-yellow-500 text-white'
                  : entry.rank === 2
                    ? 'bg-gray-400 text-white'
                    : entry.rank === 3
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {entry.rank}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {entry.name || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500">Level {entry.level}</p>
            </div>

            <div className="text-right">
              <p className={`font-bold ${typeConfig[selectedType].color}`}>
                {selectedType === 'xp'
                  ? `${entry.xp.toLocaleString()} XP`
                  : selectedType === 'streak'
                    ? `${entry.streak} days`
                    : `Lvl ${entry.level}`}
              </p>
            </div>
          </motion.div>
        ))}

        {entries.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No entries yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
}
