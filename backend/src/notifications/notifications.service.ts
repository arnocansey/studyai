import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webPush from 'web-push';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  tag?: string;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private subscriptions: Map<string, PushSubscription[]> = new Map();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    try {
      const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
      const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
      const email = this.configService.get<string>('VAPID_EMAIL');

      if (!publicKey || !privateKey || !email) {
        this.logger.warn('VAPID not configured. Web push notifications disabled.');
        return;
      }

      webPush.setVapidDetails(email, publicKey, privateKey);
      this.logger.log('Web push notifications initialized');
    } catch (err) {
      this.logger.warn('Failed to initialize VAPID: ' + err.message);
    }
  }

  getVapidPublicKey(): string | null {
    return this.configService.get<string>('VAPID_PUBLIC_KEY') || null;
  }

  subscribe(userId: string, subscription: PushSubscription): void {
    const existing = this.subscriptions.get(userId) || [];
    const isDuplicate = existing.some((s) => s.endpoint === subscription.endpoint);
    if (!isDuplicate) {
      existing.push(subscription);
      this.subscriptions.set(userId, existing);
      this.logger.log(`Push subscription added for user ${userId}`);
    }
  }

  unsubscribe(userId: string, endpoint: string): void {
    const existing = this.subscriptions.get(userId) || [];
    this.subscriptions.set(
      userId,
      existing.filter((s) => s.endpoint !== endpoint),
    );
    this.logger.log(`Push subscription removed for user ${userId}`);
  }

  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    const subs = this.subscriptions.get(userId) || [];
    this.logger.log(`Sending notification to ${userId} (${subs.length} subscriptions)`);

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
      this.unsubscribe(userId, endpoint);
      this.logger.log(`Removed stale subscription for user ${userId}`);
    }
  }

  async sendToAll(payload: NotificationPayload): Promise<void> {
    for (const [userId, subs] of this.subscriptions.entries()) {
      this.logger.log(`Broadcast to ${userId} (${subs.length} subscriptions)`);
      await this.sendToUser(userId, payload);
    }
  }

  getSubscriptions(userId: string): PushSubscription[] {
    return this.subscriptions.get(userId) || [];
  }
}
