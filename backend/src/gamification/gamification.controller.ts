import { Controller, Get, Post, Param, Query, UseGuards, Request, Body, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { XpService } from './xp.service';
import { StreakService } from './streak.service';
import { AchievementService } from './achievement.service';
import { LeaderboardService } from './leaderboard.service';
import { StudySessionService } from './study-session.service';

@ApiTags('Gamification')
@Controller('gamification')
export class GamificationController {
  constructor(
    private readonly xpService: XpService,
    private readonly streakService: StreakService,
    private readonly achievementService: AchievementService,
    private readonly leaderboardService: LeaderboardService,
    private readonly studySessionService: StudySessionService,
  ) {}

  @Get('xp-progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user XP progress and level info' })
  @ApiResponse({ status: 200, description: 'Return XP progress data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getXPProgress(@Request() req: any) {
    return this.xpService.getXPProgress(req.user.id);
  }

  @Post('check-in')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Daily check-in for streak' })
  @ApiResponse({ status: 200, description: 'Check-in recorded. Returns streak, XP, and new achievements.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async checkIn(@Request() req: any) {
    const streakResult = await this.streakService.updateStreak(req.user.id);
    const xpResult = await this.xpService.addXP(req.user.id, 100, 'Daily check-in');
    const achievements = await this.achievementService.checkAndAwardAchievements(req.user.id);

    return {
      streak: streakResult,
      xp: xpResult,
      newAchievements: achievements,
    };
  }

  @Post('streak-freeze')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Use a streak freeze' })
  @ApiResponse({ status: 200, description: 'Streak freeze applied.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async useStreakFreeze(@Request() req: any) {
    return this.streakService.useStreakFreeze(req.user.id);
  }

  @Get('achievements')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all achievements with user progress' })
  @ApiResponse({ status: 200, description: 'Return achievements list.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getAchievements(@Request() req: any) {
    return this.achievementService.getAchievements(req.user.id);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get global leaderboard' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['xp', 'streak', 'level'] })
  @ApiResponse({ status: 200, description: 'Return leaderboard entries.' })
  async getLeaderboard(
    @Query('limit') limit?: number,
    @Query('type') type?: 'xp' | 'streak' | 'level',
  ) {
    return this.leaderboardService.getLeaderboard(limit || 10, type || 'xp');
  }

  @Post('study-session/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a study session' })
  @ApiResponse({ status: 201, description: 'Study session started.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async startStudySession(@Request() req: any) {
    return this.studySessionService.startStudySession(req.user.id);
  }

  @Post('study-session/:sessionId/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End a study session' })
  @ApiResponse({ status: 200, description: 'Study session ended.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  async endStudySession(
    @Param('sessionId') sessionId: string,
    @Request() req: any,
  ) {
    return this.studySessionService.endStudySession(sessionId, req.user.id);
  }
}
