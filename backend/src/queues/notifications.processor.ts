import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { NotificationsService } from "../notifications/notifications.service";
import { NOTIFICATIONS_QUEUE, NotificationJobData } from "./queue.constants";

@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    this.logger.debug(
      `Processing notification job ${job.id} (${job.data.type})`,
    );

    if (job.data.type === "send-user") {
      await this.notificationsService.deliverToUser(
        job.data.userId,
        job.data.payload,
      );
      return;
    }

    if (job.data.type === "broadcast") {
      await this.notificationsService.deliverToAll(job.data.payload);
      return;
    }

    this.logger.warn(
      `Unknown notification job type: ${(job.data as any).type}`,
    );
  }
}
