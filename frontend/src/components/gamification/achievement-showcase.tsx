'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Target, Flame, Shield } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  xpReward: number;
  earned: boolean;
  earnedAt: string | null;
}

const tierColors = {
  bronze: 'from-orange-400 to-orange-600',
  silver: 'from-gray-300 to-gray-500',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-400 to-blue-600',
};

const tierIcons = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
};

export function AchievementShowcase() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gamification/achievements')
      .then((r) => r.json())
      .then(setAchievements)
      .catch(() => {});
  }, []);

  const earnedCount = achievements.filter((a) => a.earned).length;
  const filtered = selectedTier
    ? achievements.filter((a) => a.tier === selectedTier)
    : achievements;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Achievements
        </h3>
        <span className="text-sm text-gray-500">
          {earnedCount}/{achievements.length} earned
        </span>
      </div>

      {/* Tier Filter */}
      <div className="flex gap-2">
        {(['bronze', 'silver', 'gold', 'platinum'] as const).map((tier) => (
          <button
            key={tier}
            onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              selectedTier === tier
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            {tierIcons[tier]} {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <AnimatePresence>
          {filtered.map((achievement, i) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                achievement.earned
                  ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10'
                  : 'border-gray-200 dark:border-gray-700 opacity-50 grayscale'
              }`}
            >
              {achievement.earned && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">{achievement.title}</p>
              <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
              <p className="text-xs text-purple-500 mt-2">+{achievement.xpReward} XP</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function AchievementToast({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-2xl"
    >
      <div className="text-4xl">{achievement.icon}</div>
      <div>
        <p className="text-sm text-yellow-100">Achievement Unlocked!</p>
        <p className="font-bold text-white">{achievement.title}</p>
        <p className="text-sm text-yellow-100">+{achievement.xpReward} XP</p>
      </div>
    </motion.div>
  );
}
