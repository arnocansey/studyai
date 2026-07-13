import { Controller, Get, Post, Param, Body, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Discussions')
@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all discussions' })
  @ApiResponse({ status: 200, description: 'Return all discussions.' })
  async getDiscussions(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.discussionsService.getDiscussions({ category, search });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a discussion' })
  @ApiResponse({ status: 201, description: 'Discussion created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createDiscussion(
    @Body() body: { title: string; content: string; category: string; tags?: string[] },
    @Request() req: any,
  ) {
    return this.discussionsService.createDiscussion({
      ...body,
      authorId: req.user.id,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get discussion by ID' })
  @ApiResponse({ status: 200, description: 'Return the discussion.' })
  @ApiResponse({ status: 404, description: 'Discussion not found.' })
  async getDiscussion(@Param('id') id: string) {
    return this.discussionsService.getDiscussion(id);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reply to a discussion' })
  @ApiResponse({ status: 201, description: 'Reply posted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Discussion not found.' })
  async reply(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    return this.discussionsService.reply(id, req.user.id, content);
  }

  @Post(':id/upvote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upvote a discussion' })
  @ApiResponse({ status: 200, description: 'Upvote applied.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Discussion not found.' })
  async upvote(@Param('id') id: string, @Request() req: any) {
    return this.discussionsService.upvote(id, req.user.id);
  }

  @Post(':id/pin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pin/unpin a discussion (admin only)' })
  @ApiResponse({ status: 200, description: 'Pin state toggled.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin role required.' })
  @ApiResponse({ status: 404, description: 'Discussion not found.' })
  async pinDiscussion(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can pin discussions');
    }
    return this.discussionsService.pinDiscussion(id);
  }
}
