"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Snowflake, Calendar } from "lucide-react";
import { bffFetch } from "@/lib/api";

interface StreakData {
  streak: number;
  longestStreak: number;
  freezesRemaining: number;
  checkedInToday: boolean;
}

export function DailyCheckIn() {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkIn = async () => {
    setLoading(true);
    try {
      const payload = await bffFetch<any>("/api/gamification/check-in", {
        method: "POST",
      });
      setResult(payload);
      setData((prev) =>
        prev
          ? {
              ...prev,
              streak: payload.streak?.streak ?? prev.streak,
              checkedInToday: true,
            }
          : {
              streak: payload.streak?.streak ?? 1,
              longestStreak: payload.streak?.streak ?? 1,
              freezesRemaining: 0,
              checkedInToday: true,
            },
      );
    } catch (error) {
      console.error("Check-in failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30"
          >
            <Flame className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <p className="text-sm text-gray-500">Current Streak</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data?.streak || 0} days
            </p>
            {data?.longestStreak && (
              <p className="text-xs text-gray-500">
                Best: {data.longestStreak} days
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          {data?.checkedInToday ? (
            <div className="flex items-center gap-2 text-green-500">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Checked in today!</span>
            </div>
          ) : (
            <button
              onClick={checkIn}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/30"
            >
              {loading ? "Checking in..." : "Daily Check-in"}
            </button>
          )}
        </div>
      </div>

      {/* Streak Days Visualization */}
      <div className="mt-6 grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }, (_, i) => {
          const isActive = data && i < (data.streak % 7 || 7);
          return (
            <div
              key={i}
              className={`h-3 rounded-full transition-all ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          );
        })}
      </div>

      {/* Freezes */}
      {data?.freezesRemaining !== undefined && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Snowflake className="w-4 h-4 text-blue-400" />
          <span>{data.freezesRemaining} streak freezes available</span>
        </div>
      )}

      {/* Check-in Result */}
      {result?.xp && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl"
        >
          <p className="text-green-700 dark:text-green-400 font-medium">
            +{result.xp.xpGained} XP earned! 🎉
          </p>
        </motion.div>
      )}
    </div>
  );
}
