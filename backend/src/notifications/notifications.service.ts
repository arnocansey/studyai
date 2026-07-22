import { Injectable, Logger, OnModuleInit, Optional } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import * as webPush from "web-push";
import { PrismaService } from "../prisma/prisma.service";
import {
  isRedisEnabled,
  NOTIFICATIONS_QUEUE,
  NotificationJobData,
  NotificationJobPayload,
} from "../queues/queue.constants";

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private queueEnabled = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Optional()
    @InjectQueue(NOTIFICATIONS_QUEUE)
    private readonly notificationsQueue?: Queue<NotificationJobData> | null,
  ) {}

  onModuleInit() {
    this.queueEnabled =
      isRedisEnabled(this.configService) && Boolean(this.notificationsQueue);

    try {
      const publicKey = this.configService.get<string>("VAPID_PUBLIC_KEY");
      const privateKey = this.configService.get<string>("VAPID_PRIVATE_KEY");
      const email = this.configService.get<string>("VAPID_EMAIL");

      if (!publicKey || !privateKey || !email) {
        this.logger.warn(
          "VAPID not configured. Web push notifications disabled.",
        );
        return;
      }

      webPush.setVapidDetails(email, publicKey, privateKey);
      this.logger.log(
        `Web push initialized (queue=${this.queueEnabled ? "bullmq" : "sync"})`,
      );
    } catch (err) {
      this.logger.warn("Failed to initialize VAPID: " + err.message);
    }
  }

  getVapidPublicKey(): string | null {
    return this.configService.get<string>("VAPID_PUBLIC_KEY") || null;
  }

  async subscribe(
    userId: string,
    subscription: PushSubscription,
  ): Promise<void> {
    await this.prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });
    this.logger.log(`Push subscription saved for user ${userId}`);
  }

  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
    this.logger.log(`Push subscription removed for user ${userId}`);
  }

  /** Enqueue (or sync-deliver) a push to one user. */
  async sendToUser(
    userId: string,
    payload: NotificationJobPayload,
  ): Promise<void> {
    if (!this.queueEnabled) {
      await this.deliverToUser(userId, payload);
      return;
    }

    try {
      await this.notificationsQueue!.add(
        "send-user",
        { type: "send-user", userId, payload },
        { jobId: `user-${userId}-${payload.tag || Date.now()}` },
      );
      this.logger.log(`Queued push for user ${userId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Queue enqueue failed (${message}); delivering sync`);
      await this.deliverToUser(userId, payload);
    }
  }

  /** Enqueue (or sync-deliver) a broadcast push. */
  async sendToAll(payload: NotificationJobPayload): Promise<void> {
    if (!this.queueEnabled) {
      await this.deliverToAll(payload);
      return;
    }

    try {
      await this.notificationsQueue!.add(
        "broadcast",
        { type: "broadcast", payload },
        { jobId: `broadcast-${payload.tag || Date.now()}` },
      );
      this.logger.log("Queued broadcast push");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Queue enqueue failed (${message}); delivering sync`);
      await this.deliverToAll(payload);
    }
  }

  async deliverToUser(
    userId: string,
    payload: NotificationJobPayload,
  ): Promise<void> {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });
    const subs = subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));
    this.logger.log(
      `Sending notification to ${userId} (${subs.length} subscriptions)`,
    );

    const webPushPayload = JSON.stringify(payload);
    const failedEndpoints: string[] = [];

    for (const sub of subs) {
      try {
        await webPush.sendNotification(
          sub as unknown as webPush.PushSubscription,
          webPushPayload,
        );
        this.logger.log(`Push sent to ${sub.endpoint.substring(0, 50)}...`);
      } catch (error: any) {
        this.logger.error(
          `Failed to push to ${sub.endpoint.substring(0, 50)}...: ${error.message}`,
        );
        if (error.statusCode === 404 || error.statusCode === 410) {
          failedEndpoints.push(sub.endpoint);
        }
      }
    }

    for (const endpoint of failedEndpoints) {
      await this.unsubscribe(userId, endpoint);
      this.logger.log(`Removed stale subscription for user ${userId}`);
    }
  }

  async deliverToAll(payload: NotificationJobPayload): Promise<void> {
    const users = await this.prisma.pushSubscription.findMany({
      select: { userId: true },
      distinct: ["userId"],
    });

    for (const { userId } of users) {
      this.logger.log(`Broadcast to ${userId}`);
      await this.deliverToUser(userId, payload);
    }
  }

  async getSubscriptions(userId: string): Promise<PushSubscription[]> {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    return subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));
  }
}
