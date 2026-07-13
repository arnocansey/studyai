'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Clock, Award, Target, BookOpen, 
  Calendar, Zap, Users, Flame, ArrowUp, ArrowDown
} from 'lucide-react';

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
}

export function AnalyticsDashboard() {
  const [data] = useState<AnalyticsData>({
    totalXP: 45250,
    xpTrend: 12.5,
    studyHours: 128,
    studyTrend: 8.3,
    coursesCompleted: 12,
    coursesTrend: 2,
    streak: 15,
    streakTrend: 5,
    weeklyActivity: [
      { day: 'Mon', hours: 2.5, xp: 450 },
      { day: 'Tue', hours: 3.2, xp: 580 },
      { day: 'Wed', hours: 1.8, xp: 320 },
      { day: 'Thu', hours: 4.1, xp: 750 },
      { day: 'Fri', hours: 2.9, xp: 520 },
      { day: 'Sat', hours: 5.2, xp: 940 },
      { day: 'Sun', hours: 3.8, xp: 680 },
    ],
    skillDistribution: [
      { skill: 'Python', level: 85, color: '#3B82F6' },
      { skill: 'JavaScript', level: 70, color: '#FBBF24' },
      { skill: 'Networking', level: 60, color: '#10B981' },
      { skill: 'Cybersecurity', level: 45, color: '#EF4444' },
      { skill: 'Cloud', level: 30, color: '#8B5CF6' },
    ],
    recentAchievements: [
      { name: 'Week Warrior', icon: '⚡', date: '2 days ago' },
      { name: 'Lab Expert', icon: '🔬', date: '5 days ago' },
      { name: 'XP Hunter', icon: '🚀', date: '1 week ago' },
    ],
    monthlyGoal: { current: 8500, target: 10000 },
  });

  const maxHours = Math.max(...data.weeklyActivity.map((d) => d.hours));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          Analytics
        </h3>
        <select className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm border-0 focus:ring-2 focus:ring-purple-500">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 3 months</option>
          <option>All time</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total XP',
            value: data.totalXP.toLocaleString(),
            trend: data.xpTrend,
            icon: Zap,
            color: 'text-yellow-500',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          },
          {
            label: 'Study Hours',
            value: `${data.studyHours}h`,
            trend: data.studyTrend,
            icon: Clock,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
          },
          {
            label: 'Courses Done',
            value: data.coursesCompleted,
            trend: data.coursesTrend,
            icon: BookOpen,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/20',
          },
          {
            label: 'Day Streak',
            value: `${data.streak} days`,
            trend: data.streakTrend,
            icon: Flame,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-xl ${stat.bg} border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className={`flex items-center gap-0.5 text-xs font-medium ${
                stat.trend > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.trend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(stat.trend)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Activity</h4>
          <div className="flex items-end justify-between h-40 gap-2">
            {data.weeklyActivity.map((day, i) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.hours / maxHours) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t-lg min-h-[4px]"
                />
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500">
              Total: {data.weeklyActivity.reduce((sum, d) => sum + d.hours, 0).toFixed(1)}h
            </span>
            <span className="text-sm text-purple-500 font-medium">
              +{data.weeklyActivity.reduce((sum, d) => sum + d.xp, 0).toLocaleString()} XP
            </span>
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Skill Distribution</h4>
          <div className="space-y-4">
            {data.skillDistribution.map((skill) => (
              <div key={skill.skill}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{skill.skill}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{skill.level}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Goal */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-500" /> Monthly Goal
          </h4>
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.monthlyGoal.current / data.monthlyGoal.target) * 352} 352`}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((data.monthlyGoal.current / data.monthlyGoal.target) * 100)}%
                </span>
                <span className="text-xs text-gray-500">of goal</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              {data.monthlyGoal.current.toLocaleString()} / {data.monthlyGoal.target.toLocaleString()} XP
            </p>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" /> Recent Achievements
          </h4>
          <div className="space-y-3">
            {data.recentAchievements.map((achievement, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{achievement.name}</p>
                  <p className="text-xs text-gray-500">{achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Streak Calendar */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" /> This Week
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs text-gray-500 pb-1">{day}</div>
            ))}
            {Array.from({ length: 7 }, (_, i) => {
              const isActive = i < 5; // Mon-Fri active
              const isToday = i === new Date().getDay();
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                    isActive
                      ? isToday
                        ? 'bg-purple-500 text-white ring-2 ring-purple-300'
                        : 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                  }`}
                >
                  {isActive ? '✓' : ''}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-gray-500 text-center">5/7 days active this week</p>
        </div>
      </div>
    </div>
  );
}
