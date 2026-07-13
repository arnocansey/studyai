import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(private readonly prisma: PrismaService) {}

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
}
