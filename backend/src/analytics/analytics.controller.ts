import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('weekly')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly study hours (last 7 days)' })
  @ApiResponse({ status: 200, description: 'Return weekly study hours data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getWeeklyStudyHours(@Request() req: any) {
    return this.analyticsService.getWeeklyStudyHours(req.user.id);
  }

  @Get('subjects')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get XP breakdown by subject/course' })
  @ApiResponse({ status: 200, description: 'Return XP breakdown by subject.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getSubjectBreakdown(@Request() req: any) {
    return this.analyticsService.getSubjectBreakdown(req.user.id);
  }

  @Get('heatmap')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get activity heatmap (last 365 days)' })
  @ApiResponse({ status: 200, description: 'Return activity heatmap data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getActivityHeatmap(@Request() req: any) {
    return this.analyticsService.getActivityHeatmap(req.user.id);
  }

  @Get('predictions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ML-powered predictions' })
  @ApiResponse({ status: 200, description: 'Return learning predictions.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getPredictions(@Request() req: any) {
    return this.analyticsService.getPredictions(req.user.id);
  }

  @Get('insights')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get learning insights' })
  @ApiResponse({ status: 200, description: 'Return learning insights.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getInsights(@Request() req: any) {
    return this.analyticsService.getInsights(req.user.id);
  }

  @Get('leaderboard-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get competitive leaderboard stats' })
  @ApiResponse({ status: 200, description: 'Return leaderboard stats.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getLeaderboardStats(@Request() req: any) {
    return this.analyticsService.getLeaderboardStats(req.user.id);
  }
}
