import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { AiService, TutorMessage } from "./ai.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiProperty,
} from "@nestjs/swagger";

class ExplainDto {
  @ApiProperty({
    description: "The concept or question to explain",
    example: "What is a closure in JavaScript?",
  })
  prompt: string;

  @ApiProperty({
    description: "Optional context for the explanation",
    required: false,
  })
  context?: string;

  @ApiProperty({
    description: "Optional lesson ID to load curriculum context",
    required: false,
  })
  lessonId?: string;
}

class TutorDto {
  @ApiProperty({
    description: "Conversation messages",
    type: "array",
    items: {
      type: "object",
      properties: { role: { type: "string" }, content: { type: "string" } },
    },
  })
  messages: TutorMessage[];

  @ApiProperty({ description: "Optional topic focus", required: false })
  topic?: string;

  @ApiProperty({
    description: "Existing conversation ID for persistence",
    required: false,
  })
  conversationId?: string;

  @ApiProperty({
    description: "Lesson ID for lesson-aware mentoring",
    required: false,
  })
  lessonId?: string;
}

class ReviewDto {
  @ApiProperty({
    description: "The code to review",
    example: "function add(a, b) { return a + b; }",
  })
  code: string;

  @ApiProperty({ description: "Programming language", example: "javascript" })
  language: string;
}

class HintDto {
  @ApiProperty({
    description: "The question to get a hint for",
    example: "Write a function to reverse a linked list",
  })
  question: string;

  @ApiProperty({
    description: "Hint difficulty level",
    enum: ["easy", "medium", "hard"],
    default: "medium",
    required: false,
  })
  difficulty?: "easy" | "medium" | "hard";

  @ApiProperty({ description: "Optional lesson ID", required: false })
  lessonId?: string;
}

class StudyPlanDto {
  @ApiProperty({
    description: "Learning goal",
    example: "Prepare for a junior cybersecurity analyst role",
  })
  goal: string;

  @ApiProperty({
    description: "Current skill level",
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
    required: false,
  })
  currentLevel?: "beginner" | "intermediate" | "advanced";

  @ApiProperty({
    description: "Hours available per week",
    example: 8,
    required: false,
  })
  weeklyHours?: number;

  @ApiProperty({
    description: "Optional target completion date as ISO date",
    example: "2026-09-01",
    required: false,
  })
  targetDate?: string;

  @ApiProperty({
    description: "Optional focus areas",
    example: ["Linux", "networking", "web security"],
    required: false,
  })
  focusAreas?: string[];
}

class GenerateQuizDto {
  @ApiProperty({ description: "Lesson ID to generate questions from" })
  lessonId: string;

  @ApiProperty({
    description: "Number of questions (1-8)",
    required: false,
    default: 3,
  })
  count?: number;

  @ApiProperty({
    description: "Persist questions into the lesson quiz bank",
    required: false,
    default: false,
  })
  save?: boolean;
}

@ApiTags("AI")
@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("explain")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Explain a concept directly" })
  @ApiResponse({ status: 200, description: "Return the AI explanation." })
  @ApiResponse({ status: 400, description: "Invalid prompt." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async explainConcept(@Body() body: ExplainDto) {
    if (!body.prompt || body.prompt.trim().length === 0) {
      throw new BadRequestException("Prompt is required");
    }
    if (body.prompt.length > 5000) {
      throw new BadRequestException("Prompt too long (max 5000 characters)");
    }

    let context = body.context;
    if (body.lessonId) {
      const lesson = await this.aiService.loadLessonContext(body.lessonId);
      if (lesson) {
        context = [
          context,
          `Lesson: ${lesson.title} (${lesson.type})`,
          lesson.content.slice(0, 2000),
        ]
          .filter(Boolean)
          .join("\n\n");
      }
    }

    const explanation = await this.aiService.explainConcept(
      body.prompt,
      context,
    );
    return { explanation };
  }

  @Post("tutor")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Socratic mentor — guided learning with persistence",
  })
  @ApiResponse({ status: 200, description: "Return guided tutor response." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async socraticTutor(@Body() body: TutorDto, @Request() req: any) {
    return this.aiService.socraticTutor(
      body.messages || [],
      body.topic,
      req.user.id,
      {
        conversationId: body.conversationId,
        lessonId: body.lessonId,
      },
    );
  }

  @Get("conversations")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List mentor conversations for the current user" })
  listConversations(@Request() req: any, @Query("lessonId") lessonId?: string) {
    return this.aiService.listConversations(req.user.id, lessonId);
  }

  @Get("conversations/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a mentor conversation with messages" })
  async getConversation(@Request() req: any, @Param("id") id: string) {
    const conversation = await this.aiService.getConversation(req.user.id, id);
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }
    return conversation;
  }

  @Post("review")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "AI-powered code review" })
  @ApiResponse({ status: 200, description: "Return code review feedback." })
  @ApiResponse({ status: 400, description: "Invalid code input." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async reviewCode(@Body() body: ReviewDto) {
    if (!body.code || body.code.length > 50000) {
      throw new BadRequestException(
        "Code is required and must be under 50,000 characters",
      );
    }
    return this.aiService.reviewCode(body.code, body.language);
  }

  @Post("hint")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a hint for a question" })
  @ApiResponse({ status: 200, description: "Return the generated hint." })
  @ApiResponse({ status: 400, description: "Invalid question." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async generateHint(@Body() body: HintDto) {
    if (!body.question || body.question.trim().length === 0) {
      throw new BadRequestException("Question is required");
    }
    const hint = await this.aiService.generateHint(
      body.question,
      body.difficulty || "medium",
      body.lessonId,
    );
    return { hint };
  }

  @Post("quiz/generate")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Generate practice quiz questions from a lesson (AI)",
  })
  async generateQuiz(@Body() body: GenerateQuizDto, @Request() req: any) {
    if (!body.lessonId) {
      throw new BadRequestException("lessonId is required");
    }
    // Only instructors/admins may persist into the live quiz bank
    const save =
      Boolean(body.save) &&
      (req.user.role === "INSTRUCTOR" || req.user.role === "ADMIN");

    return this.aiService.generateQuizFromLesson(body.lessonId, req.user.id, {
      count: body.count,
      save,
    });
  }

  @Get("study-plan/latest")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the most recent saved study plan" })
  @ApiResponse({
    status: 200,
    description: "Return latest study plan or null.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async getLatestStudyPlan(@Request() req: any) {
    return this.aiService.getLatestStudyPlan(req.user.id);
  }

  @Get("study-plan")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List saved study plans for the current user" })
  @ApiResponse({ status: 200, description: "Return saved study plans." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async listStudyPlans(@Request() req: any) {
    return this.aiService.listStudyPlans(req.user.id);
  }

  @Post("study-plan")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Generate a personalized study plan" })
  @ApiResponse({ status: 200, description: "Return a structured study plan." })
  @ApiResponse({ status: 400, description: "Invalid study plan request." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async generateStudyPlan(@Body() body: StudyPlanDto, @Request() req: any) {
    if (!body.goal || body.goal.trim().length === 0) {
      throw new BadRequestException("Goal is required");
    }
    if (body.goal.length > 1000) {
      throw new BadRequestException("Goal too long (max 1000 characters)");
    }
    if (
      body.weeklyHours !== undefined &&
      (body.weeklyHours < 1 || body.weeklyHours > 80)
    ) {
      throw new BadRequestException("Weekly hours must be between 1 and 80");
    }

    return this.aiService.generateStudyPlan(
      {
        goal: body.goal,
        currentLevel: body.currentLevel || "beginner",
        weeklyHours: body.weeklyHours || 6,
        targetDate: body.targetDate,
        focusAreas: body.focusAreas || [],
      },
      req.user?.id,
    );
  }
}
