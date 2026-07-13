import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  private readonly XP_PER_LEVEL = [
    0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800,
    4700, 5700, 6800, 8000, 9300, 10700, 12200, 13800, 15500, 17300,
    19200, 21200, 23300, 25500, 27800, 30200, 32700, 35300, 38000, 40800,
  ];

  constructor(private readonly prisma: PrismaService) {}

  async addXP(userId: string, amount: number, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const newXP = user.xp + amount;
    const newLevel = this.calculateLevel(newXP);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        level: newLevel,
      },
    });

    if (newLevel > user.level) {
      await this.checkLevelAchievements(userId, newLevel);
    }

    return {
      xp: updatedUser.xp,
      level: updatedUser.level,
      xpGained: amount,
      reason,
      leveledUp: newLevel > user.level,
      previousLevel: user.level,
    };
  }

  calculateLevel(xp: number): number {
    for (let i = this.XP_PER_LEVEL.length - 1; i >= 0; i--) {
      if (xp >= this.XP_PER_LEVEL[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  getXPForLevel(level: number): number {
    return this.XP_PER_LEVEL[level - 1] || 0;
  }

  getXPProgress(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } }).then((user) => {
      if (!user) return null;
      const currentLevelXP = this.getXPForLevel(user.level);
      const nextLevelXP = this.getXPForLevel(user.level + 1);
      const progress = nextLevelXP > currentLevelXP
        ? ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
        : 100;

      return {
        level: user.level,
        xp: user.xp,
        currentLevelXP,
        nextLevelXP,
        progress: Math.min(progress, 100),
        xpToNextLevel: nextLevelXP - user.xp,
      };
    });
  }

  async updateStreak(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const now = new Date();
    const lastActive = user.lastActiveAt;

    if (!lastActive) {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          streak: 1,
          longestStreak: 1,
          lastActiveAt: now,
        },
      });
      return { streak: updated.streak, isNewStreak: true, checkedInToday: false };
    }

    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);

    if (diffHours < 24 && this.isSameDay(now, lastActive)) {
      return {
        streak: user.streak,
        isNewStreak: false,
        checkedInToday: true,
      };
    }

    if (diffHours >= 24 && diffHours <= 48) {
      const newStreak = user.streak + 1;
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          streak: newStreak,
          longestStreak: Math.max(newStreak, user.longestStreak),
          lastActiveAt: now,
        },
      });

      await this.checkStreakAchievements(userId, newStreak);

      return { streak: updated.streak, isNewStreak: true, checkedInToday: false };
    }

    if (user.streakFreezes > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          streakFreezes: { decrement: 1 },
          lastActiveAt: now,
        },
      });

      await this.prisma.streakFreeze.create({
        data: { userId },
      });

      return {
        streak: user.streak,
        isNewStreak: false,
        freezeUsed: true,
        freezesRemaining: user.streakFreezes - 1,
      };
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        streak: 1,
        lastActiveAt: now,
      },
    });

    return { streak: updated.streak, isNewStreak: false, streakBroken: true };
  }

  async useStreakFreeze(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.streakFreezes <= 0) {
      throw new Error('No streak freezes available');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { streakFreezes: { decrement: 1 } },
    });

    await this.prisma.streakFreeze.create({
      data: { userId },
    });

    return { freezesRemaining: user.streakFreezes - 1 };
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  async checkAndAwardAchievements(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: { include: { achievement: true } },
        enrollments: true,
        labSessions: true,
        studySessions: true,
      },
    });

    if (!user) return [];

    const earnedIds = new Set(user.achievements.map((ua) => ua.achievementId));
    const newAchievements: any[] = [];

    const allAchievements = await this.prisma.achievement.findMany();

    for (const achievement of allAchievements) {
      if (earnedIds.has(achievement.id)) continue;

      const requirement = achievement.requirement as any;
      let earned = false;

      switch (requirement.type) {
        case 'lessons_completed':
          earned = user.enrollments.length >= requirement.count;
          break;
        case 'labs_completed':
          earned = user.labSessions.filter((s) => s.status === 'SUCCESS').length >= requirement.count;
          break;
        case 'xp_earned':
          earned = user.xp >= requirement.count;
          break;
        case 'level_reached':
          earned = user.level >= requirement.count;
          break;
        case 'study_hours':
          const totalSeconds = user.studySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
          earned = totalSeconds / 3600 >= requirement.count;
          break;
      }

      if (earned) {
        await this.prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        });

        if (achievement.xpReward > 0) {
          await this.addXP(userId, achievement.xpReward, `Achievement: ${achievement.title}`);
        }

        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  private async checkLevelAchievements(userId: string, level: number) {
    await this.checkAndAwardAchievements(userId);
  }

  private async checkStreakAchievements(userId: string, streak: number) {
    await this.checkAndAwardAchievements(userId);
  }

  async getAchievements(userId: string) {
    const achievements = await this.prisma.achievement.findMany({
      include: {
        users: {
          where: { userId },
          select: { earnedAt: true },
        },
      },
      orderBy: { category: 'asc' },
    });

    return achievements.map((a) => ({
      ...a,
      earned: a.users.length > 0,
      earnedAt: a.users[0]?.earnedAt || null,
    }));
  }

  async getLeaderboard(limit: number = 10, type: 'xp' | 'streak' | 'level' = 'xp') {
    const orderBy = type === 'xp'
      ? { xp: 'desc' as const }
      : type === 'streak'
        ? { streak: 'desc' as const }
        : { level: 'desc' as const };

    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        xp: true,
        streak: true,
        level: true,
      },
      orderBy,
      take: limit,
    });

    return users.map((user, index) => ({
      rank: index + 1,
      ...user,
    }));
  }

  async startStudySession(userId: string) {
    return this.prisma.studySession.create({
      data: { userId, duration: 0, xpEarned: 0 },
    });
  }

  async endStudySession(sessionId: string, userId: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');

    if (session.userId !== userId) {
      throw new ForbiddenException('You can only end your own study sessions');
    }

    const duration = Math.floor(
      (Date.now() - session.startedAt.getTime()) / 1000
    );

    const xpEarned = Math.min(Math.floor(duration / 60) * 10, 100);

    const updated = await this.prisma.studySession.update({
      where: { id: sessionId },
      data: {
        duration,
        xpEarned,
        endedAt: new Date(),
      },
    });

    if (xpEarned > 0) {
      await this.addXP(userId, xpEarned, 'Study session');
    }

    return updated;
  }
}
