import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  NotFoundException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
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
import { Role } from "@prisma/client";
import { IsEnum } from "class-validator";

class UpdateUserRoleDto {
  @ApiProperty({ enum: Role, description: "New role for the user" })
  @IsEnum(Role)
  role: Role;
}

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "Return user details." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async getMe(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List users (admin only)" })
  @ApiResponse({ status: 200, description: "Return users." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Admin role required." })
  async listUsers() {
    return this.usersService.listUsers();
  }

  @Patch(":id/role")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a user role (admin only)" })
  @ApiResponse({ status: 200, description: "User role updated." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Admin role required." })
  @ApiResponse({ status: 404, description: "User not found." })
  async updateRole(
    @Param("id") id: string,
    @Body() body: UpdateUserRoleDto,
    @Request() req: any,
  ) {
    return this.usersService.updateUserRole(id, body.role, req.user.id);
  }

  @Post("check-in")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Trigger daily check-in streak reward" })
  @ApiResponse({ status: 200, description: "Check-in success." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async checkIn(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) throw new NotFoundException("User not found");
    return this.usersService.checkIn(user.email);
  }
}
