import { ConfigService } from "@nestjs/config";

export type RedisConnectionOptions = {
  host: string;
  port: number;
  password?: string;
  maxRetriesPerRequest: null;
  enableOfflineQueue?: boolean;
  lazyConnect?: boolean;
};

export function getRedisConnection(
  config: ConfigService,
): RedisConnectionOptions {
  const url = config.get<string>("REDIS_URL");
  if (url) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 6379,
      password: parsed.password
        ? decodeURIComponent(parsed.password)
        : undefined,
      maxRetriesPerRequest: null,
    };
  }

  const host = config.get<string>("REDIS_HOST");
  if (!host) {
    throw new Error(
      "Redis is enabled but neither REDIS_URL nor REDIS_HOST is set",
    );
  }

  return {
    host,
    port: Number(config.get<number>("REDIS_PORT", 6379)),
    password: config.get<string>("REDIS_PASSWORD") || undefined,
    maxRetriesPerRequest: null,
  };
}

/** True only when a real Redis endpoint is configured (not localhost-by-default). */
export function isRedisEnabled(config: ConfigService): boolean {
  const flag = config.get<string>("REDIS_ENABLED");
  if (flag === "false" || flag === "0") return false;

  const hasEndpoint = Boolean(
    config.get<string>("REDIS_URL") || config.get<string>("REDIS_HOST"),
  );

  if (flag === "true" || flag === "1") return hasEndpoint;

  // Auto-enable only when an explicit endpoint exists
  return hasEndpoint;
}

export const NOTIFICATIONS_QUEUE = "notifications";
export const STUDY_PLAN_QUEUE = "study-plan";

export type StudyPlanJobData = {
  userId: string;
  goal: string;
  currentLevel: "beginner" | "intermediate" | "advanced";
  weeklyHours: number;
  targetDate?: string;
  focusAreas: string[];
};

export type NotificationJobPayload = {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  tag?: string;
};

export type SendUserNotificationJob = {
  type: "send-user";
  userId: string;
  payload: NotificationJobPayload;
};

export type BroadcastNotificationJob = {
  type: "broadcast";
  payload: NotificationJobPayload;
};

export type NotificationJobData =
  SendUserNotificationJob | BroadcastNotificationJob;
