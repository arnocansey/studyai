import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { QueuesModule } from "../queues/queues.module";
import { StudyPlanProcessor } from "../queues/study-plan.processor";

const redisConfigured = Boolean(
  process.env.REDIS_URL || process.env.REDIS_HOST,
);

@Module({
  imports: [PrismaModule, QueuesModule],
  controllers: [AiController],
  providers: [AiService, ...(redisConfigured ? [StudyPlanProcessor] : [])],
  exports: [AiService],
})
export class AiModule {}
