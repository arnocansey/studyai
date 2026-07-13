import { Controller, Get, Param } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published courses' })
  @ApiResponse({ status: 200, description: 'Return all published courses.' })
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a course by its slug' })
  @ApiResponse({ status: 200, description: 'Return the course details.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }
}
