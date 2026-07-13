import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getWeeklyStudyHours(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await this.prisma.studySession.findMany({
      where: {
        userId,
        startedAt: { gte: sevenDaysAgo },
      },
      orderBy: { startedAt: 'asc' },
    });

    const dailyHours: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyHours[key] = 0;
    }

    for (const session of sessions) {
      const day = session.startedAt.toISOString().split('T')[0];
      if (dailyHours[day] !== undefined) {
        dailyHours[day] += session.duration / 3600;
      }
    }

    return Object.entries(dailyHours).map(([date, hours]) => ({
      date,
      hours: Math.round(hours * 100) / 100,
    }));
  }

  async getSubjectBreakdown(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    progress: { where: { userId, completed: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const breakdown = enrollments.map((enrollment) => {
      const course = enrollment.course;
      let totalLessons = 0;
      let completedLessons = 0;

      for (const mod of course.modules) {
        totalLessons += mod.lessons.length;
        completedLessons += mod.lessons.filter((l) => l.progress.length > 0).length;
      }

      return {
        courseId: course.id,
        courseName: course.title,
        totalLessons,
        completedLessons,
        progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      };
    });

    const totalAll = breakdown.reduce((s, b) => s + b.totalLessons, 0);
    const completedAll = breakdown.reduce((s, b) => s + b.completedLessons, 0);

    return {
      courses: breakdown,
      overallProgress: totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0,
    };
  }

  async getActivityHeatmap(userId: string) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const sessions = await this.prisma.studySession.findMany({
      where: {
        userId,
        startedAt: { gte: oneYearAgo },
      },
      orderBy: { startedAt: 'asc' },
    });

    const heatmap: Record<string, number> = {};
    const now = new Date();
    for (let i = 365; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      heatmap[d.toISOString().split('T')[0]] = 0;
    }

    for (const session of sessions) {
      const day = session.startedAt.toISOString().split('T')[0];
      if (heatmap[day] !== undefined) {
        heatmap[day] += 1;
      }
    }

    const maxCount = Math.max(...Object.values(heatmap), 1);

    return {
      heatmap: Object.entries(heatmap).map(([date, count]) => ({
        date,
        count,
        level: Math.min(Math.ceil((count / maxCount) * 4), 4),
      })),
      totalDays: Object.values(heatmap).filter((c) => c > 0).length,
      totalSessions: sessions.length,
    };
  }

  async getPredictions(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSessions = await this.prisma.studySession.findMany({
      where: {
        userId,
        startedAt: { gte: thirtyDaysAgo },
      },
      orderBy: { startedAt: 'asc' },
    });

    const dailyXP = new Map<string, number>();
    for (const s of recentSessions) {
      const day = s.startedAt.toISOString().split('T')[0];
      dailyXP.set(day, (dailyXP.get(day) || 0) + s.xpEarned);
    }

    const xpValues = Array.from(dailyXP.values());
    const avgDailyXP = xpValues.length > 0
      ? xpValues.reduce((a, b) => a + b, 0) / xpValues.length
      : 0;

    const predictedWeeklyXP = Math.round(avgDailyXP * 7);

    const now = new Date();
    const hoursSinceActive = user.lastActiveAt
      ? (now.getTime() - user.lastActiveAt.getTime()) / (1000 * 60 * 60)
      : Infinity;

    let streakRisk = 'low';
    if (hoursSinceActive > 36) streakRisk = 'high';
    else if (hoursSinceActive > 24) streakRisk = 'medium';

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId, completed: false },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    progress: { where: { userId, completed: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const coursePredictions = enrollments.map((enrollment) => {
      const course = enrollment.course;
      let totalLessons = 0;
      let completedLessons = 0;

      for (const mod of course.modules) {
        totalLessons += mod.lessons.length;
        completedLessons += mod.lessons.filter((l) => l.progress.length > 0).length;
      }

      const remaining = totalLessons - completedLessons;
      const completedDays = Math.max(
        (now.getTime() - enrollment.joinedAt.getTime()) / (1000 * 60 * 60 * 24),
        1,
      );
      const lessonsPerDay = completedLessons / completedDays;
      const daysToComplete = lessonsPerDay > 0 ? remaining / lessonsPerDay : Infinity;

      const completionDate = new Date();
      completionDate.setDate(completionDate.getDate() + Math.round(daysToComplete));

      return {
        courseId: course.id,
        courseName: course.title,
        completedLessons,
        totalLessons,
        progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        predictedCompletionDate: daysToComplete < 365 ? completionDate.toISOString().split('T')[0] : null,
        daysToComplete: daysToComplete < 365 ? Math.round(daysToComplete) : null,
      };
    });

    const hourCounts = new Array(24).fill(0);
    for (const s of recentSessions) {
      const hour = s.startedAt.getHours();
      hourCounts[hour] += 1;
    }
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const optimalHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((h) => h.hour);

    return {
      predictedWeeklyXP,
      streakRisk,
      hoursSinceLastActive: Math.round(hoursSinceActive * 10) / 10,
      coursePredictions,
      optimalStudyHours: optimalHours,
    };
  }

  async getInsights(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const allUsers = await this.prisma.user.findMany({
      select: { id: true, xp: true, streak: true, level: true },
    });

    const totalUsers = allUsers.length || 1;
    const avgXP = allUsers.reduce((s, u) => s + u.xp, 0) / totalUsers;
    const avgStreak = allUsers.reduce((s, u) => s + u.streak, 0) / totalUsers;

    const userXPPercentile = Math.round(
      (allUsers.filter((u) => u.xp < user.xp).length / totalUsers) * 100,
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = await this.prisma.studySession.findMany({
      where: {
        userId,
        startedAt: { gte: sevenDaysAgo },
      },
    });

    const daysWithSessions = new Set(
      recentSessions.map((s) => s.startedAt.toISOString().split('T')[0]),
    ).size;

    const consistencyScore = Math.round((daysWithSessions / 7) * 100);

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    progress: { where: { userId, completed: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const subjectProgress = enrollments.map((enrollment) => {
      const course = enrollment.course;
      let totalLessons = 0;
      let completedLessons = 0;

      for (const mod of course.modules) {
        totalLessons += mod.lessons.length;
        completedLessons += mod.lessons.filter((l) => l.progress.length > 0).length;
      }

      return {
        courseName: course.title,
        progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      };
    });

    subjectProgress.sort((a, b) => b.progress - a.progress);

    const strongest = subjectProgress.length > 0 ? subjectProgress[0] : null;
    const weakest = subjectProgress.length > 0 ? subjectProgress[subjectProgress.length - 1] : null;

    return {
      comparisonToAverage: {
        xp: Math.round(((user.xp - avgXP) / (avgXP || 1)) * 100),
        streak: Math.round(((user.streak - avgStreak) / (avgStreak || 1)) * 100),
        xpPercentile: userXPPercentile,
      },
      studyConsistency: {
        score: consistencyScore,
        daysStudiedThisWeek: daysWithSessions,
        currentStreak: user.streak,
      },
      strongestSubject: strongest,
      weakestSubject: weakest && strongest && weakest.courseName !== strongest.courseName
        ? weakest
        : null,
      subjectProgress,
    };
  }

  async getLeaderboardStats(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const allUsers = await this.prisma.user.findMany({
      select: { id: true, xp: true, level: true, streak: true },
      orderBy: { xp: 'desc' },
    });

    const totalUsers = allUsers.length || 1;
    const userRank = allUsers.findIndex((u) => u.id === userId) + 1;
    const topPercentile = Math.round(((totalUsers - userRank) / totalUsers) * 100);

    const avgXP = Math.round(allUsers.reduce((s, u) => s + u.xp, 0) / totalUsers);
    const avgLevel = Math.round(allUsers.reduce((s, u) => s + u.level, 0) / totalUsers);
    const avgStreak = Math.round(allUsers.reduce((s, u) => s + u.streak, 0) / totalUsers);

    return {
      rank: userRank,
      totalUsers,
      topPercentile,
      userXP: user.xp,
      averageXP: avgXP,
      xpVsAverage: Math.round(((user.xp - avgXP) / (avgXP || 1)) * 100),
      userLevel: user.level,
      averageLevel: avgLevel,
      userStreak: user.streak,
      averageStreak: avgStreak,
    };
  }
}
