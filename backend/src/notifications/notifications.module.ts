import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { QueuesModule } from "../queues/queues.module";
import { NotificationsProcessor } from "../queues/notifications.processor";

const redisConfigured = Boolean(
  process.env.REDIS_URL || process.env.REDIS_HOST,
);

@Module({
  imports: [ConfigModule, QueuesModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    ...(redisConfigured ? [NotificationsProcessor] : []),
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
