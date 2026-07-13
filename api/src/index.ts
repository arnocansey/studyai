import { z } from 'zod';

// User Schema & Types
export const UserRoleSchema = z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  role: UserRoleSchema,
  xp: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  createdAt: z.string(), // ISO String dates are easier for JSON transport
  updatedAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

// Course Schema & Types
export const CourseDifficultySchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
export type CourseDifficulty = z.infer<typeof CourseDifficultySchema>;

export const CourseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  coverImage: z.string().nullable().optional(),
  published: z.boolean(),
  difficulty: CourseDifficultySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Course = z.infer<typeof CourseSchema>;

// Lesson Schema & Types
export const LessonTypeSchema = z.enum([
  'TEXT',
  'VIDEO',
  'CODING_LAB',
  'NETWORKING_LAB',
  'CYBER_LAB',
  'QUIZ',
]);
export type LessonType = z.infer<typeof LessonTypeSchema>;

export const LessonSchema = z.object({
  id: z.string().uuid(),
  moduleId: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  type: LessonTypeSchema,
  order: z.number().int(),
  labConfig: z.any().optional(),
});
export type Lesson = z.infer<typeof LessonSchema>;

// API Health Check Response
export const HealthCheckResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  service: z.string(),
});
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
export const ApiHealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  service: z.string(),
});
export type ApiHealthResponse = z.infer<typeof ApiHealthResponseSchema>;
