import { Module } from '@nestjs/common';
import { GamificationController } from './gamification.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { XpService } from './xp.service';
import { StreakService } from './streak.service';
import { AchievementService } from './achievement.service';
import { LeaderboardService } from './leaderboard.service';
import { StudySessionService } from './study-session.service';

@Module({
  imports: [PrismaModule],
  controllers: [GamificationController],
  providers: [
    XpService,
    AchievementService,
    StreakService,
    LeaderboardService,
    StudySessionService,
  ],
  exports: [
    XpService,
    AchievementService,
    StreakService,
    LeaderboardService,
    StudySessionService,
  ],
})
export class GamificationModule {}
