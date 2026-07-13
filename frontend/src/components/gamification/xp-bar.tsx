'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface XPProgress {
  level: number;
  xp: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
  xpToNextLevel: number;
}

export function XPBar() {
  const [data, setData] = useState<XPProgress | null>(null);

  useEffect(() => {
    fetch('/api/gamification/xp-progress')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
          {data.level}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lvl {data.level}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${data.progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{data.xp - data.currentLevelXP} XP</span>
          <span>{data.xpToNextLevel} XP to next level</span>
        </div>
      </div>
    </div>
  );
}

export function XPDisplay() {
  const [data, setData] = useState<XPProgress | null>(null);

  useEffect(() => {
    fetch('/api/gamification/xp-progress')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/30">
        {data.level}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">Level {data.level}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.xp.toLocaleString()} XP</p>
        <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${data.progress}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
