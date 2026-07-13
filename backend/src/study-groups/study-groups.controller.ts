import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { StudyGroupsService } from './study-groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Study Groups')
@Controller('study-groups')
export class StudyGroupsController {
  constructor(private readonly studyGroupsService: StudyGroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all study groups' })
  @ApiResponse({ status: 200, description: 'Return all study groups.' })
  async getGroups(
    @Query('topic') topic?: string,
    @Query('search') search?: string,
    @Request() req?: any,
  ) {
    return this.studyGroupsService.getGroups({
      topic,
      search,
      userId: req?.user?.id,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a study group' })
  @ApiResponse({ status: 201, description: 'Study group created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createGroup(
    @Body() body: { name: string; description: string; topic: string; maxMembers?: number; isPublic?: boolean },
    @Request() req: any,
  ) {
    return this.studyGroupsService.createGroup({
      ...body,
      creatorId: req.user.id,
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user study groups' })
  @ApiResponse({ status: 200, description: 'Return user study groups.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyGroups(@Request() req: any) {
    return this.studyGroupsService.getUserGroups(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get study group by ID' })
  @ApiResponse({ status: 200, description: 'Return study group details.' })
  @ApiResponse({ status: 404, description: 'Study group not found.' })
  async getGroup(@Param('id') id: string) {
    return this.studyGroupsService.getGroup(id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a study group' })
  @ApiResponse({ status: 200, description: 'Joined study group.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Study group not found.' })
  async joinGroup(@Param('id') id: string, @Request() req: any) {
    return this.studyGroupsService.joinGroup(id, req.user.id);
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave a study group' })
  @ApiResponse({ status: 200, description: 'Left study group.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Study group not found.' })
  async leaveGroup(@Param('id') id: string, @Request() req: any) {
    return this.studyGroupsService.leaveGroup(id, req.user.id);
  }
}
