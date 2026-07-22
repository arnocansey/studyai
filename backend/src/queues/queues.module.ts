import { DynamicModule, Global, Module, Logger } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule, getQueueToken } from "@nestjs/bullmq";
import {
  getRedisConnection,
  isRedisEnabled,
  NOTIFICATIONS_QUEUE,
  STUDY_PLAN_QUEUE,
} from "./queue.constants";

/**
 * Provides BullMQ only when a real Redis endpoint is configured.
 * Without Redis, exports null queue tokens so services can fall back to sync paths.
 */
@Global()
@Module({})
export class QueuesModule {
  private static readonly logger = new Logger(QueuesModule.name);

  static forRoot(): DynamicModule {
    const flag = process.env.REDIS_ENABLED;
    const hasEndpoint = Boolean(
      process.env.REDIS_URL || process.env.REDIS_HOST,
    );
    const useRedis = flag !== "false" && flag !== "0" && hasEndpoint;

    if (!useRedis) {
      this.logger.warn(
        "Redis/BullMQ disabled — using sync notification & study-plan paths",
      );
      return {
        module: QueuesModule,
        global: true,
        providers: [
          {
            provide: getQueueToken(NOTIFICATIONS_QUEUE),
            useValue: null,
          },
          {
            provide: getQueueToken(STUDY_PLAN_QUEUE),
            useValue: null,
          },
          {
            provide: "QUEUES_ENABLED",
            useValue: false,
          },
        ],
        exports: [
          getQueueToken(NOTIFICATIONS_QUEUE),
          getQueueToken(STUDY_PLAN_QUEUE),
          "QUEUES_ENABLED",
        ],
      };
    }

    return {
      module: QueuesModule,
      global: true,
      imports: [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => ({
            connection: getRedisConnection(config),
          }),
          inject: [ConfigService],
        }),
        BullModule.registerQueue(
          {
            name: NOTIFICATIONS_QUEUE,
            defaultJobOptions: {
              attempts: 3,
              backoff: { type: "exponential", delay: 2000 },
              removeOnComplete: 100,
              removeOnFail: 200,
            },
          },
          {
            name: STUDY_PLAN_QUEUE,
            defaultJobOptions: {
              attempts: 2,
              backoff: { type: "exponential", delay: 3000 },
              removeOnComplete: 50,
              removeOnFail: 100,
            },
          },
        ),
      ],
      providers: [
        {
          provide: "QUEUES_ENABLED",
          useValue: true,
        },
      ],
      exports: [BullModule, "QUEUES_ENABLED"],
    };
  }
}
