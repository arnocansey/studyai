import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { OpsService } from "./ops.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@ApiTags("Ops")
@Controller("ops")
export class OpsController {
  constructor(private readonly opsService: OpsService) {}

  @Get("summary")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("INSTRUCTOR", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Instructor/admin operations summary metrics" })
  getSummary() {
    return this.opsService.getSummary();
  }

  @Get("audit")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List recent audit log entries (admin)" })
  listAudit(@Query("limit") limit?: string, @Query("action") action?: string) {
    return this.opsService.listAuditLogs(
      limit ? Number(limit) : 50,
      action || undefined,
    );
  }
}
