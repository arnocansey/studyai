import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "StudyAI Backend Service",
    };
  }

  getReadiness() {
    const databaseReady = this.prisma.isConnected();

    return {
      status: databaseReady ? "ready" : "degraded",
      timestamp: new Date().toISOString(),
      service: "StudyAI Backend Service",
      dependencies: {
        database: databaseReady ? "ready" : "unavailable",
      },
    };
  }
}
