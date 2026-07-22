"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Target,
  Brain,
  Code,
  BookOpen,
  ChevronRight,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  XPDisplay,
  AchievementShowcase,
  DailyCheckIn,
  Leaderboard,
  QuizWidget,
  SocraticTutor,
} from "@/components/gamification";
import { bffFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
}

export default function GamificationDashboard() {
  const authUser = useAuthStore((s) => s.user);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "quiz" | "tutor">(
    "overview",
  );

  useEffect(() => {
    if (authUser) {
      setUser({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        xp: authUser.xp,
        level: 1,
        streak: authUser.streak,
      });
    }
    bffFetch<UserProfile & { accessToken?: string }>("/api/auth/me")
      .then((data) => {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          xp: data.xp,
          level: (data as any).level || 1,
          streak: data.streak,
        });
      })
      .catch(() => {});
  }, [authUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-500" />
            Gamification Hub
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your progress, earn achievements, and level up!
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "overview", label: "Overview", icon: Trophy },
            { id: "quiz", label: "Quiz", icon: Target },
            { id: "tutor", label: "AI Tutor", icon: Brain },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* XP Display */}
            <XPDisplay />

            {/* Daily Check-in & Leaderboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailyCheckIn />
              <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                <Leaderboard />
              </div>
            </div>

            {/* Achievements */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <AchievementShowcase />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total XP",
                  value: user?.xp || 0,
                  icon: Zap,
                  color: "text-purple-500",
                },
                {
                  label: "Level",
                  value: user?.level || 1,
                  icon: Trophy,
                  color: "text-yellow-500",
                },
                {
                  label: "Streak",
                  value: `${user?.streak || 0} days`,
                  icon: Flame,
                  color: "text-orange-500",
                },
                {
                  label: "Courses",
                  value: "3",
                  icon: BookOpen,
                  color: "text-blue-500",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
                >
                  <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "quiz" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-500" />
                Adaptive Quiz
              </h2>
              <QuizWidget lessonId="demo-lesson-1" />
            </div>
          </motion.div>
        )}

        {activeTab === "tutor" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <SocraticTutor topic="programming" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
