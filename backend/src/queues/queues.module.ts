import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import {
  getRedisConnection,
  isRedisEnabled,
  NOTIFICATIONS_QUEUE,
  STUDY_PLAN_QUEUE,
} from "./queue.constants";

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        if (!isRedisEnabled(config)) {
          return {
            connection: {
              host: "127.0.0.1",
              port: 6379,
              maxRetriesPerRequest: null,
              enableOfflineQueue: false,
              lazyConnect: true,
            },
          };
        }

        return {
          connection: getRedisConnection(config),
        };
      },
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
  exports: [BullModule],
})
export class QueuesModule {}
