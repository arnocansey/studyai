import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { QueuesModule } from "../queues/queues.module";
import { NotificationsProcessor } from "../queues/notifications.processor";

@Module({
  imports: [ConfigModule, QueuesModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
