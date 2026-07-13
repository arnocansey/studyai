import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AiService, TutorMessage } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiProperty } from '@nestjs/swagger';

class ExplainDto {
  @ApiProperty({ description: 'The concept or question to explain', example: 'What is a closure in JavaScript?' })
  prompt: string;

  @ApiProperty({ description: 'Optional context for the explanation', required: false })
  context?: string;
}

class TutorDto {
  @ApiProperty({ description: 'Conversation messages', type: 'array', items: { type: 'object', properties: { role: { type: 'string' }, content: { type: 'string' } } } })
  messages: TutorMessage[];

  @ApiProperty({ description: 'Optional topic focus', required: false })
  topic?: string;
}

class ReviewDto {
  @ApiProperty({ description: 'The code to review', example: 'function add(a, b) { return a + b; }' })
  code: string;

  @ApiProperty({ description: 'Programming language', example: 'javascript' })
  language: string;
}

class HintDto {
  @ApiProperty({ description: 'The question to get a hint for', example: 'Write a function to reverse a linked list' })
  question: string;

  @ApiProperty({ description: 'Hint difficulty level', enum: ['easy', 'medium', 'hard'], default: 'medium', required: false })
  difficulty?: 'easy' | 'medium' | 'hard';
}

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('explain')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Explain a concept directly' })
  @ApiResponse({ status: 200, description: 'Return the AI explanation.' })
  @ApiResponse({ status: 400, description: 'Invalid prompt.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async explainConcept(
    @Body() body: ExplainDto,
  ) {
    if (!body.prompt || body.prompt.trim().length === 0) {
      throw new BadRequestException('Prompt is required');
    }
    if (body.prompt.length > 5000) {
      throw new BadRequestException('Prompt too long (max 5000 characters)');
    }
    const explanation = await this.aiService.explainConcept(body.prompt, body.context);
    return { explanation };
  }

  @Post('tutor')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Socratic tutor — guided learning' })
  @ApiResponse({ status: 200, description: 'Return guided tutor response.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async socraticTutor(
    @Body() body: TutorDto,
    @Request() req: any,
  ) {
    return this.aiService.socraticTutor(body.messages, body.topic, req.user?.id);
  }

  @Post('review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI-powered code review' })
  @ApiResponse({ status: 200, description: 'Return code review feedback.' })
  @ApiResponse({ status: 400, description: 'Invalid code input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async reviewCode(
    @Body() body: ReviewDto,
  ) {
    if (!body.code || body.code.length > 50000) {
      throw new BadRequestException('Code is required and must be under 50,000 characters');
    }
    return this.aiService.reviewCode(body.code, body.language);
  }

  @Post('hint')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a hint for a question' })
  @ApiResponse({ status: 200, description: 'Return the generated hint.' })
  @ApiResponse({ status: 400, description: 'Invalid question.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async generateHint(
    @Body() body: HintDto,
  ) {
    if (!body.question || body.question.trim().length === 0) {
      throw new BadRequestException('Question is required');
    }
    const hint = await this.aiService.generateHint(body.question, body.difficulty || 'medium');
    return { hint };
  }
}
