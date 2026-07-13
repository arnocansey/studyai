import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

class QuizVerifyDto {
  @ApiProperty({ description: 'The ID of the question to verify' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ description: 'The user answer to verify' })
  @IsString()
  @IsNotEmpty()
  answer: string;
}

class LabSubmitDto {
  @ApiProperty({ description: 'The lab execution output to submit' })
  submission: any;
}

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lesson by ID' })
  @ApiResponse({ status: 200, description: 'Return lesson data.' })
  @ApiResponse({ status: 404, description: 'Lesson not found.' })
  findById(@Param('id') id: string) {
    return this.lessonsService.findById(id);
  }

  @Post(':id/verify-quiz')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify quiz answer for a lesson' })
  @ApiResponse({ status: 200, description: 'Quiz answer verified.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Lesson not found.' })
  verifyQuiz(
    @Param('id') id: string,
    @Body() dto: QuizVerifyDto,
  ) {
    return this.lessonsService.verifyQuiz(id, dto.questionId, dto.answer);
  }

  @Post(':id/submit-lab')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit lab execution output' })
  @ApiResponse({ status: 200, description: 'Lab submission accepted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Lesson not found.' })
  submitLab(
    @Param('id') id: string,
    @Body() dto: LabSubmitDto,
    @Request() req: any,
  ) {
    return this.lessonsService.submitLab(req.user.id, id, dto.submission);
  }
}
