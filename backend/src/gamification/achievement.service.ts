import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { XpService } from './xp.service';

@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly xpService: XpService,
  ) {}

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
          await this.xpService.addXP(userId, achievement.xpReward, `Achievement: ${achievement.title}`);
        }

        newAchievements.push(achievement);
      }
    }

    return newAchievements;
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
}
