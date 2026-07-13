import { Controller, Post, Get, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Quiz')
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('lesson/:lessonId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get quiz questions for a lesson' })
  @ApiResponse({ status: 200, description: 'Return quiz questions.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Lesson not found.' })
  async getQuizForLesson(
    @Param('lessonId') lessonId: string,
    @Request() req: any,
  ) {
    return this.quizService.getQuizForLesson(lessonId, req.user.id);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a quiz answer' })
  @ApiResponse({ status: 200, description: 'Answer verified.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async verifyAnswer(
    @Body('questionId') questionId: string,
    @Body('answer') answer: string,
    @Request() req: any,
  ) {
    return this.quizService.verifyAnswer(req.user.id, questionId, answer);
  }

  @Get('adaptive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get adaptive quiz based on user level' })
  @ApiResponse({ status: 200, description: 'Return adaptive quiz.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getAdaptiveQuiz(
    @Query('topic') topic: string,
    @Query('difficulty') difficulty: string,
    @Request() req: any,
  ) {
    return this.quizService.getAdaptiveQuiz(req.user.id, topic, difficulty);
  }
}
