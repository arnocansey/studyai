import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  @ApiOperation({ summary: "Check server health status" })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get("ready")
  @ApiOperation({ summary: "Check dependency readiness status" })
  getReadiness() {
    return this.appService.getReadiness();
  }
}
