import { api } from './api';

export interface WeeklyDay {
  date: string;
  hours: number;
}

export interface SubjectCourse {
  courseId: string;
  courseName: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

export interface SubjectBreakdown {
  courses: SubjectCourse[];
  overallProgress: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: number;
}

export interface HeatmapData {
  heatmap: HeatmapDay[];
  totalDays: number;
  totalSessions: number;
}

export interface CoursePrediction {
  courseId: string;
  courseName: string;
  completedLessons: number;
  totalLessons: number;
  progress: number;
  predictedCompletionDate: string | null;
  daysToComplete: number | null;
}

export interface Predictions {
  predictedWeeklyXP: number;
  streakRisk: 'low' | 'medium' | 'high';
  hoursSinceLastActive: number;
  coursePredictions: CoursePrediction[];
  optimalStudyHours: number[];
}

export interface SubjectProgress {
  courseName: string;
  progress: number;
}

export interface Insights {
  comparisonToAverage: {
    xp: number;
    streak: number;
    xpPercentile: number;
  };
  studyConsistency: {
    score: number;
    daysStudiedThisWeek: number;
    currentStreak: number;
  };
  strongestSubject: SubjectProgress | null;
  weakestSubject: SubjectProgress | null;
  subjectProgress: SubjectProgress[];
}

export interface LeaderboardStats {
  rank: number;
  totalUsers: number;
  topPercentile: number;
  userXP: number;
  averageXP: number;
  xpVsAverage: number;
  userLevel: number;
  averageLevel: number;
  userStreak: number;
  averageStreak: number;
}

export const analyticsApi = {
  getWeekly: () => api.get<WeeklyDay[]>('/analytics/weekly'),
  getSubjects: () => api.get<SubjectBreakdown>('/analytics/subjects'),
  getHeatmap: () => api.get<HeatmapData>('/analytics/heatmap'),
  getPredictions: () => api.get<Predictions>('/analytics/predictions'),
  getInsights: () => api.get<Insights>('/analytics/insights'),
  getLeaderboardStats: () => api.get<LeaderboardStats>('/analytics/leaderboard-stats'),
};
