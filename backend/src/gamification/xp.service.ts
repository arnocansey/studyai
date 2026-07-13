import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const XP_PER_LEVEL = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800,
  4700, 5700, 6800, 8000, 9300, 10700, 12200, 13800, 15500, 17300,
  19200, 21200, 23300, 25500, 27800, 30200, 32700, 35300, 38000, 40800,
];

@Injectable()
export class XpService {
  private readonly logger = new Logger(XpService.name);

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
    for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
      if (xp >= XP_PER_LEVEL[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  getXPForLevel(level: number): number {
    return XP_PER_LEVEL[level - 1] || 0;
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
}
