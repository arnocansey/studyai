"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  Award,
  Target,
  BookOpen,
  Calendar,
  Zap,
  Flame,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

interface AnalyticsData {
  totalXP: number;
  xpTrend: number;
  studyHours: number;
  studyTrend: number;
  coursesCompleted: number;
  coursesTrend: number;
  streak: number;
  streakTrend: number;
  weeklyActivity: { day: string; hours: number; xp: number }[];
  skillDistribution: { skill: string; level: number; color: string }[];
  recentAchievements: { name: string; icon: string; date: string }[];
  monthlyGoal: { current: number; target: number };
  loading: boolean;
  error: string;
}

const COLORS = [
  "#3B82F6",
  "#FBBF24",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AnalyticsDashboard() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<AnalyticsData>({
    totalXP: user?.xp || 0,
    xpTrend: 0,
    studyHours: 0,
    studyTrend: 0,
    coursesCompleted: 0,
    coursesTrend: 0,
    streak: user?.streak || 0,
    streakTrend: 0,
    weeklyActivity: DAY_LABELS.map((day) => ({ day, hours: 0, xp: 0 })),
    skillDistribution: [],
    recentAchievements: [],
    monthlyGoal: { current: 0, target: 10000 },
    loading: true,
    error: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [weekly, subjects, insights, xpProgress, achievements] =
          await Promise.all([
            apiFetch<Array<{ date: string; hours: number }>>(
              "/analytics/weekly",
            ),
            apiFetch<{
              courses: Array<{
                courseName: string;
                progress: number;
                completedLessons: number;
              }>;
              overallProgress: number;
            }>("/analytics/subjects"),
            apiFetch<{
              studyConsistency?: number;
              comparisonToAverage?: number;
            }>("/analytics/insights").catch(() => ({})),
            apiFetch<{ xp: number; level: number }>(
              "/gamification/xp-progress",
            ).catch(() => ({
              xp: user?.xp || 0,
              level: 1,
            })),
            apiFetch<
              Array<{
                title?: string;
                name?: string;
                earned?: boolean;
                earnedAt?: string | null;
              }>
            >("/gamification/achievements").catch(() => []),
          ]);

        if (cancelled) return;

        const weeklyActivity = (weekly || []).map((row) => {
          const day = DAY_LABELS[new Date(row.date).getDay()] || "Day";
          return {
            day,
            hours: Number(row.hours) || 0,
            xp: Math.round((Number(row.hours) || 0) * 180),
          };
        });

        while (weeklyActivity.length < 7) {
          weeklyActivity.unshift({ day: "—", hours: 0, xp: 0 });
        }

        const skillDistribution = (subjects?.courses || [])
          .slice(0, 6)
          .map((course, i) => ({
            skill: course.courseName,
            level: course.progress || 0,
            color: COLORS[i % COLORS.length],
          }));

        const earned = (achievements || [])
          .filter((a) => a.earned)
          .slice(0, 3)
          .map((a) => ({
            name: a.title || a.name || "Achievement",
            icon: "★",
            date: a.earnedAt
              ? new Date(a.earnedAt).toLocaleDateString()
              : "Recently",
          }));

        const studyHours = weeklyActivity.reduce((sum, d) => sum + d.hours, 0);
        const coursesCompleted = (subjects?.courses || []).filter(
          (c) => c.progress >= 100,
        ).length;

        setData({
          totalXP: xpProgress.xp ?? user?.xp ?? 0,
          xpTrend: insights.comparisonToAverage || 0,
          studyHours: Math.round(studyHours * 10) / 10,
          studyTrend: insights.studyConsistency || 0,
          coursesCompleted,
          coursesTrend: subjects?.overallProgress || 0,
          streak: user?.streak || 0,
          streakTrend: 0,
          weeklyActivity: weeklyActivity.slice(-7),
          skillDistribution:
            skillDistribution.length > 0
              ? skillDistribution
              : [{ skill: "No enrollments yet", level: 0, color: "#71717a" }],
          recentAchievements: earned,
          monthlyGoal: {
            current: xpProgress.xp ?? user?.xp ?? 0,
            target: Math.max(10000, (xpProgress.xp ?? 0) + 2000),
          },
          loading: false,
          error: "",
        });
      } catch (err) {
        if (cancelled) return;
        setData((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error ? err.message : "Failed to load analytics",
        }));
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.xp, user?.streak]);

  const maxHours = useMemo(
    () => Math.max(1, ...data.weeklyActivity.map((d) => d.hours)),
    [data.weeklyActivity],
  );

  if (data.loading) {
    return (
      <div className="rounded-xl border border-gray-200 p-8 text-sm text-gray-500 dark:border-gray-700">
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          Analytics
        </h3>
      </div>

      {data.error && <p className="text-sm text-red-400">{data.error}</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total XP",
            value: data.totalXP.toLocaleString(),
            trend: data.xpTrend,
            icon: Zap,
            color: "text-yellow-500",
            bg: "bg-yellow-50 dark:bg-yellow-900/20",
          },
          {
            label: "Study Hours",
            value: `${data.studyHours}h`,
            trend: data.studyTrend,
            icon: Clock,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
          },
          {
            label: "Courses Done",
            value: data.coursesCompleted,
            trend: data.coursesTrend,
            icon: BookOpen,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-900/20",
          },
          {
            label: "Day Streak",
            value: `${data.streak} days`,
            trend: data.streakTrend,
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-900/20",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl border border-gray-200 p-4 dark:border-gray-700 ${stat.bg}`}
          >
            <div className="mb-2 flex items-center justify-between">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  stat.trend >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {stat.trend >= 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {Math.abs(Math.round(stat.trend))}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Weekly Activity
          </h4>
          <div className="flex h-40 items-end justify-between gap-2">
            {data.weeklyActivity.map((day, i) => (
              <div
                key={`${day.day}-${i}`}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.hours / maxHours) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="min-h-[4px] w-full rounded-t-lg bg-gradient-to-t from-purple-500 to-indigo-500"
                />
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Course Progress
          </h4>
          <div className="space-y-4">
            {data.skillDistribution.map((skill) => (
              <div key={skill.skill}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {skill.skill}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {skill.level}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Target className="h-4 w-4 text-purple-500" /> XP Goal
          </h4>
          <p className="text-center text-sm text-gray-500">
            {data.monthlyGoal.current.toLocaleString()} /{" "}
            {data.monthlyGoal.target.toLocaleString()} XP
          </p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-purple-500"
              style={{
                width: `${Math.min(100, (data.monthlyGoal.current / data.monthlyGoal.target) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Award className="h-4 w-4 text-yellow-500" /> Recent Achievements
          </h4>
          <div className="space-y-3">
            {data.recentAchievements.length === 0 ? (
              <p className="text-sm text-gray-500">
                No achievements earned yet.
              </p>
            ) : (
              data.recentAchievements.map((achievement, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-2">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {achievement.name}
                    </p>
                    <p className="text-xs text-gray-500">{achievement.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Calendar className="h-4 w-4 text-orange-500" /> This Week
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {data.weeklyActivity.map((day, i) => (
              <div
                key={`${day.day}-cell-${i}`}
                className={`flex aspect-square items-center justify-center rounded-lg text-sm ${
                  day.hours > 0
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-700"
                }`}
              >
                {day.hours > 0 ? "✓" : ""}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-gray-500">
            {data.weeklyActivity.filter((d) => d.hours > 0).length}/7 days
            active this week
          </p>
        </div>
      </div>
    </div>
  );
}
