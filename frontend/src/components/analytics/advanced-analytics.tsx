'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, TrendingUp, Calendar, Target, Zap, Clock, 
  BookOpen, Award, ChevronRight, Sparkles
} from 'lucide-react';

interface LearningData {
  dailyStudy: { date: string; hours: number; xp: number }[];
  skillProgress: { skill: string; current: number; predicted: number; trend: number }[];
  optimalTimes: { hour: number; productivity: number }[];
  recommendations: { type: string; title: string; reason: string; priority: 'high' | 'medium' | 'low' }[];
  predictions: {
    nextLevelDate: string;
    estimatedXP: number;
    suggestedFocus: string;
    burnoutRisk: 'low' | 'medium' | 'high';
  };
}

export function AdvancedAnalytics() {
  const [data] = useState<LearningData>({
    dailyStudy: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: Math.random() * 4 + 1,
      xp: Math.floor(Math.random() * 500 + 100),
    })),
    skillProgress: [
      { skill: 'Python', current: 85, predicted: 92, trend: 12 },
      { skill: 'Networking', current: 60, predicted: 75, trend: 18 },
      { skill: 'Cybersecurity', current: 45, predicted: 65, trend: 25 },
      { skill: 'Cloud', current: 30, predicted: 50, trend: 30 },
    ],
    optimalTimes: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      productivity: Math.max(20, 100 - Math.abs(i - 14) * 8 + Math.random() * 20),
    })),
    recommendations: [
      {
        type: 'course',
        title: 'Advanced Python Decorators',
        reason: 'Based on your Python progress, you\'re ready for advanced concepts',
        priority: 'high',
      },
      {
        type: 'challenge',
        title: 'Weekly CTF Challenge',
        reason: 'Your cybersecurity skills need more practice',
        priority: 'medium',
      },
      {
        type: 'review',
        title: 'Review Subnetting Basics',
        reason: 'You haven\'t practiced networking in 5 days',
        priority: 'low',
      },
    ],
    predictions: {
      nextLevelDate: '2026-07-25',
      estimatedXP: 52000,
      suggestedFocus: 'Cybersecurity',
      burnoutRisk: 'low',
    },
  });

  const [selectedTab, setSelectedTab] = useState<'overview' | 'predictions' | 'recommendations'>('overview');

  // Calculate ML-like insights
  const insights = useMemo(() => {
    const totalHours = data.dailyStudy.reduce((sum, d) => sum + d.hours, 0);
    const avgHours = totalHours / 30;
    const consistency = data.dailyStudy.filter((d) => d.hours > 0).length / 30;
    const improvementRate = data.skillProgress.reduce((sum, s) => sum + s.trend, 0) / data.skillProgress.length;

    return {
      totalHours: totalHours.toFixed(1),
      avgHours: avgHours.toFixed(1),
      consistency: (consistency * 100).toFixed(0),
      improvementRate: improvementRate.toFixed(1),
      learningVelocity: (avgHours * 45).toFixed(0), // estimated XP per hour
    };
  }, [data]);

  const priorityColors = {
    high: 'text-red-500 bg-red-100 dark:bg-red-900/30',
    medium: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
    low: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  };

  const burnoutColors = {
    low: 'text-green-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          AI-Powered Analytics
        </h3>
        <div className="flex gap-2">
          {(['overview', 'predictions', 'recommendations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1 rounded-xl text-sm font-medium transition-all capitalize ${
                selectedTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {selectedTab === 'overview' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Study Hours', value: `${insights.totalHours}h`, icon: Clock, color: 'text-blue-500' },
              { label: 'Daily Average', value: `${insights.avgHours}h`, icon: Calendar, color: 'text-green-500' },
              { label: 'Consistency', value: `${insights.consistency}%`, icon: Target, color: 'text-purple-500' },
              { label: 'Learning Velocity', value: `${insights.learningVelocity} XP/day`, icon: Zap, color: 'text-yellow-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Study Activity Chart */}
          <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">30-Day Study Activity</h4>
            <div className="h-40 flex items-end gap-1">
              {data.dailyStudy.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.hours / 5) * 100}%` }}
                    transition={{ delay: i * 0.02, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t"
                    title={`${day.date}: ${day.hours.toFixed(1)}h, ${day.xp} XP`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Optimal Study Times */}
          <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Optimal Study Times</h4>
            <div className="h-32 flex items-end gap-1">
              {data.optimalTimes.map((time) => (
                <div key={time.hour} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${time.productivity}%`,
                      backgroundColor: time.productivity > 70 ? '#10B981' : time.productivity > 40 ? '#F59E0B' : '#EF4444',
                    }}
                  />
                  {time.hour % 4 === 0 && (
                    <span className="text-xs text-gray-500 mt-1">{time.hour}:00</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              🎯 Best study time: <span className="text-green-500 font-medium">2:00 PM - 4:00 PM</span>
            </p>
          </div>
        </>
      )}

      {selectedTab === 'predictions' && (
        <>
          {/* Predictions Card */}
          <div className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" />
              <h4 className="font-semibold">AI Predictions</h4>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-purple-200 text-sm">Next Level</p>
                <p className="text-2xl font-bold">{data.predictions.nextLevelDate}</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm">Estimated XP</p>
                <p className="text-2xl font-bold">{data.predictions.estimatedXP.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm">Suggested Focus</p>
                <p className="text-2xl font-bold">{data.predictions.suggestedFocus}</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm">Burnout Risk</p>
                <p className={`text-2xl font-bold ${burnoutColors[data.predictions.burnoutRisk]}`}>
                  {data.predictions.burnoutRisk.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Skill Predictions */}
          <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Skill Growth Predictions</h4>
            <div className="space-y-4">
              {data.skillProgress.map((skill) => (
                <div key={skill.skill}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{skill.skill}</span>
                    <span className="text-sm text-green-500 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> +{skill.trend}%
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.current}%` }}
                      className="absolute h-full bg-purple-500 rounded-full"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.predicted}%` }}
                      className="absolute h-full bg-purple-300 dark:bg-purple-600 rounded-full opacity-50"
                      style={{ left: `${skill.current}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>Current: {skill.current}%</span>
                    <span>Predicted: {skill.predicted}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedTab === 'recommendations' && (
        <div className="space-y-4">
          {data.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[rec.priority]}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{rec.type}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{rec.reason}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </motion.div>
          ))}

          {/* AI Insight */}
          <div className="p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold text-purple-900 dark:text-purple-300">AI Insight</h4>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Based on your learning patterns, you're most productive in the afternoon (2-4 PM). 
              Consider scheduling your challenging cybersecurity practice during these hours for optimal retention.
              Your consistency score of {insights.consistency}% is above average - keep it up!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
