import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { CoursesService } from "./courses.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiProperty,
} from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

class CourseMutationDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  slug: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverImage?: string;
}

class CourseUpdateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverImage?: string;
}

class ModuleCreateDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  order?: number;
}

class ModuleUpdateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  order?: number;
}

class LessonCreateDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    required: false,
    enum: [
      "TEXT",
      "VIDEO",
      "CODING_LAB",
      "NETWORKING_LAB",
      "CYBER_LAB",
      "QUIZ",
    ],
  })
  @IsOptional()
  @IsEnum([
    "TEXT",
    "VIDEO",
    "CODING_LAB",
    "NETWORKING_LAB",
    "CYBER_LAB",
    "QUIZ",
  ] as const)
  type?:
    "TEXT" | "VIDEO" | "CODING_LAB" | "NETWORKING_LAB" | "CYBER_LAB" | "QUIZ";

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  order?: number;
}

class LessonUpdateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    required: false,
    enum: [
      "TEXT",
      "VIDEO",
      "CODING_LAB",
      "NETWORKING_LAB",
      "CYBER_LAB",
      "QUIZ",
    ],
  })
  @IsOptional()
  @IsEnum([
    "TEXT",
    "VIDEO",
    "CODING_LAB",
    "NETWORKING_LAB",
    "CYBER_LAB",
    "QUIZ",
  ] as const)
  type?:
    "TEXT" | "VIDEO" | "CODING_LAB" | "NETWORKING_LAB" | "CYBER_LAB" | "QUIZ";

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  order?: number;
}

class QuizQuestionDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  question: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty()
  @IsString()
  @MinLength(1)
  correctAnswer: string;
}

@ApiTags("Courses")
@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get("manage/all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  findAllForManagement() {
    return this.coursesService.findAllForManagement();
  }

  @Get("my-progress")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyProgress(@Request() req: any) {
    return this.coursesService.getMyProgress(req.user.id);
  }

  @Get("students")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List enrolled students across all courses" })
  listStudents() {
    return this.coursesService.listEnrolledStudents();
  }

  @Get(":id/students")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List enrolled students for a course" })
  listCourseStudents(@Param("id") id: string) {
    return this.coursesService.listEnrolledStudents(id);
  }

  @Get(":id/curriculum")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get full course curriculum for editing" })
  getCurriculum(@Param("id") id: string) {
    return this.coursesService.getCurriculum(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  create(@Body() dto: CourseMutationDto) {
    return this.coursesService.create(dto);
  }

  @Post(":id/modules")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  addModule(@Param("id") id: string, @Body() dto: ModuleCreateDto) {
    return this.coursesService.addModule(id, dto.title, dto.order);
  }

  @Post(":id/enroll")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  enroll(@Param("id") id: string, @Request() req: any) {
    return this.coursesService.enroll(req.user.id, id);
  }

  @Delete(":id/enroll")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  unenroll(@Param("id") id: string, @Request() req: any) {
    return this.coursesService.unenroll(req.user.id, id);
  }

  @Patch("modules/:moduleId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  updateModule(
    @Param("moduleId") moduleId: string,
    @Body() dto: ModuleUpdateDto,
  ) {
    return this.coursesService.updateModule(moduleId, dto);
  }

  @Delete("modules/:moduleId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  deleteModule(@Param("moduleId") moduleId: string) {
    return this.coursesService.deleteModule(moduleId);
  }

  @Post("modules/:moduleId/lessons")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  addLesson(@Param("moduleId") moduleId: string, @Body() dto: LessonCreateDto) {
    return this.coursesService.addLesson(moduleId, dto);
  }

  @Patch("lessons/:lessonId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  updateLesson(
    @Param("lessonId") lessonId: string,
    @Body() dto: LessonUpdateDto,
  ) {
    return this.coursesService.updateLesson(lessonId, dto);
  }

  @Delete("lessons/:lessonId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  deleteLesson(@Param("lessonId") lessonId: string) {
    return this.coursesService.deleteLesson(lessonId);
  }

  @Post("lessons/:lessonId/quiz-questions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  addQuizQuestion(
    @Param("lessonId") lessonId: string,
    @Body() dto: QuizQuestionDto,
  ) {
    return this.coursesService.addQuizQuestion(lessonId, dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  update(@Param("id") id: string, @Body() dto: CourseUpdateDto) {
    return this.coursesService.update(id, dto);
  }

  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.coursesService.findBySlug(slug);
  }
}
