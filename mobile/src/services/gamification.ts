import { api } from './api';

export interface XpProgress {
  totalXp: number;
  level: number;
  xpToNextLevel: number;
  streak: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  xpReward: number;
  rarity: string;
}

export interface GamificationProfile {
  id: string;
  userId: string;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
  streakFrozen: boolean;
}

export const gamificationApi = {
  getXpProgress: () => api.get<XpProgress>('/gamification/xp-progress'),
  checkIn: () => api.post<{ profile: GamificationProfile; xpEarned: number }>('/gamification/check-in'),
  streakFreeze: () => api.post('/gamification/streak-freeze'),
  getAchievements: () => api.get<Achievement[]>('/gamification/achievements'),
  getLeaderboard: (limit = 10, type = 'xp') =>
    api.get<LeaderboardEntry[]>(`/gamification/leaderboard?limit=${limit}&type=${type}`),
  startStudySession: () => api.post<{ sessionId: string }>('/gamification/study-session/start'),
  endStudySession: (sessionId: string, xpEarned?: number) =>
    api.post(`/gamification/study-session/${sessionId}/end`, { xpEarned }),
};
