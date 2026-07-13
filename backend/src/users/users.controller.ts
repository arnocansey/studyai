import { Controller, Get, Post, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return user details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMe(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Register a new student or instructor' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'User already exists.' })
  async signup(
    @Body() body: { email: string; name?: string; role?: 'STUDENT' | 'INSTRUCTOR' }
  ) {
    try {
      return await this.usersService.registerUser(body.email, body.name, body.role);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('check-in')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger daily check-in streak reward' })
  @ApiResponse({ status: 200, description: 'Check-in success.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async checkIn(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return this.usersService.checkIn(user.email);
  }
}
