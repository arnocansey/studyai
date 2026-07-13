import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementService } from './achievement.service';

@Injectable()
export class StreakService {
  private readonly logger = new Logger(StreakService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly achievementService: AchievementService,
  ) {}

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

      await this.achievementService.checkAndAwardAchievements(userId);

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
}
