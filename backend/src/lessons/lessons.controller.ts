import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { LessonsService } from "./lessons.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

class QuizVerifyDto {
  @ApiProperty({ description: "The ID of the question to verify" })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ description: "The user answer to verify" })
  @IsString()
  @IsNotEmpty()
  answer: string;
}

class LabSubmitDto {
  @ApiProperty({ description: "The lab execution output to submit" })
  submission: any;
}

class ReviewSubmissionDto {
  @ApiProperty({ enum: ["SUCCESS", "FAILED", "REVIEWED"] })
  @IsEnum(["SUCCESS", "FAILED", "REVIEWED"] as const)
  status: "SUCCESS" | "FAILED" | "REVIEWED";
}

@ApiTags("Lessons")
@Controller("lessons")
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get("submissions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List lab submissions for review" })
  @ApiResponse({ status: 200, description: "Return lab submissions." })
  @ApiResponse({
    status: 403,
    description: "Instructor or admin role required.",
  })
  listSubmissions() {
    return this.lessonsService.listLabSubmissions();
  }

  @Patch("submissions/:submissionId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update lab submission review status" })
  @ApiResponse({ status: 200, description: "Submission updated." })
  @ApiResponse({
    status: 403,
    description: "Instructor or admin role required.",
  })
  reviewSubmission(
    @Param("submissionId") submissionId: string,
    @Body() dto: ReviewSubmissionDto,
  ) {
    return this.lessonsService.reviewLabSubmission(submissionId, dto.status);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get lesson by ID" })
  @ApiResponse({ status: 200, description: "Return lesson data." })
  @ApiResponse({ status: 404, description: "Lesson not found." })
  findById(@Param("id") id: string) {
    return this.lessonsService.findById(id);
  }

  @Post(":id/complete")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark a lesson as complete" })
  @ApiResponse({ status: 200, description: "Lesson marked complete." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Lesson not found." })
  completeLesson(@Param("id") id: string, @Request() req: any) {
    return this.lessonsService.completeLesson(req.user.id, id);
  }

  @Post(":id/verify-quiz")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Verify quiz answer for a lesson" })
  @ApiResponse({ status: 200, description: "Quiz answer verified." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Lesson not found." })
  verifyQuiz(@Param("id") id: string, @Body() dto: QuizVerifyDto) {
    return this.lessonsService.verifyQuiz(id, dto.questionId, dto.answer);
  }

  @Post(":id/submit-lab")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Submit lab execution output" })
  @ApiResponse({ status: 200, description: "Lab submission accepted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Lesson not found." })
  submitLab(
    @Param("id") id: string,
    @Body() dto: LabSubmitDto,
    @Request() req: any,
  ) {
    return this.lessonsService.submitLab(req.user.id, id, dto.submission);
  }
}
