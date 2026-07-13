import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS Configuration
  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Security Headers
  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Prefix routes
  app.setGlobalPrefix('api/v1');

  // Input Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger Documentation Setup (development only)
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('StudyAI API')
      .setDescription(
        'StudyAI is an AI-powered adaptive learning platform with gamification, collaborative tools, real-time video sessions, and intelligent tutoring.\n\n' +
        '## Authentication\n' +
        'All protected endpoints require a Bearer token in the `Authorization` header.\n\n' +
        '## Modules\n' +
        '- **Auth** – Registration, login, and user profile\n' +
        '- **Users** – User management and daily check-in\n' +
        '- **Courses** – Course catalog browsing\n' +
        '- **Lessons** – Lesson content, quiz verification, and lab submissions\n' +
        '- **Quiz** – Adaptive quizzing engine\n' +
        '- **Gamification** – XP, streaks, achievements, leaderboards, and study sessions\n' +
        '- **AI** – Socratic tutor, concept explanations, code review, and hints\n' +
        '- **Discussions** – Forum-style discussion threads with replies and voting\n' +
        '- **Study Groups** – Collaborative study group management\n' +
        '- **Notifications** – Push notification subscriptions and delivery\n' +
        '- **Analytics** – Study analytics, heatmaps, predictions, and insights',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
        'access-token',
      )
      .addTag('Auth', 'Registration, login, and user profile')
      .addTag('Users', 'User management and daily check-in')
      .addTag('Courses', 'Course catalog browsing')
      .addTag('Lessons', 'Lesson content, quiz verification, and lab submissions')
      .addTag('Quiz', 'Adaptive quizzing engine')
      .addTag('Gamification', 'XP, streaks, achievements, leaderboards, and study sessions')
      .addTag('AI', 'Socratic tutor, concept explanations, code review, and hints')
      .addTag('Discussions', 'Forum-style discussion threads')
      .addTag('Study Groups', 'Collaborative study group management')
      .addTag('Notifications', 'Push notification subscriptions and delivery')
      .addTag('Analytics', 'Study analytics, heatmaps, predictions, and insights')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  console.log(`🚀 StudyAI backend running on: http://localhost:${port}/api/v1`);
  if (nodeEnv !== 'production') {
    console.log(`📄 Swagger documentation available on: http://localhost:${port}/docs`);
  }
}
bootstrap();
