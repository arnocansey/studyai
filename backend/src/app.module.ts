import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { CoursesModule } from "./courses/courses.module";
import { LessonsModule } from "./lessons/lessons.module";
import { UsersModule } from "./users/users.module";
import { AiModule } from "./ai/ai.module";
import { AuthModule } from "./auth/auth.module";
import { GamificationModule } from "./gamification/gamification.module";
import { StudyGroupsModule } from "./study-groups/study-groups.module";
import { DiscussionsModule } from "./discussions/discussions.module";
import { ChatModule } from "./chat/chat.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { CollaborativeModule } from "./collaborative/collaborative.module";
import { VideoModule } from "./video/video.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { OpsModule } from "./ops/ops.module";
import { QueuesModule } from "./queues/queues.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>("THROTTLE_TTL", 60) * 1000,
            limit: configService.get<number>("THROTTLE_LIMIT", 60),
          },
        ],
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    QueuesModule.forRoot(),
    AuthModule,
    CoursesModule,
    LessonsModule,
    UsersModule,
    AiModule,
    GamificationModule,
    StudyGroupsModule,
    DiscussionsModule,
    ChatModule,
    NotificationsModule,
    CollaborativeModule,
    VideoModule,
    AnalyticsModule,
    OpsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
