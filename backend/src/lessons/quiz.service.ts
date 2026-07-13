import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { XpService } from '../gamification/xp.service';
import { AchievementService } from '../gamification/achievement.service';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly xpService: XpService,
    private readonly achievementService: AchievementService,
  ) {}

  async getQuizForLesson(lessonId: string, userId: string) {
    // Get user's lesson progress for this lesson
    const lessonProgress = await this.prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    // Get all questions for this lesson
    const questions = await this.prisma.quizQuestion.findMany({
      where: { lessonId },
    });

    const completed = lessonProgress?.completed || false;
    const masteryLevel = completed ? 100 : 0;

    return {
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        // Don't send correct answer to client
      })),
      masteryLevel,
      totalQuestions: questions.length,
      completedQuestions: completed ? questions.length : 0,
    };
  }

  async verifyAnswer(userId: string, questionId: string, answer: string) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: { lesson: true },
    });

    if (!question) throw new Error('Question not found');

    const isCorrect = question.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase();

    // Award XP based on correctness
    let xpAwarded = 0;
    if (isCorrect) {
      xpAwarded = 25; // Base XP for correct answer
      await this.xpService.addXP(userId, xpAwarded, 'Quiz correct answer');
    }

    // Update lesson progress
    await this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId: question.lessonId },
      },
      update: {
        completed: isCorrect,
        completedAt: isCorrect ? new Date() : undefined,
      },
      create: {
        userId,
        lessonId: question.lessonId,
        completed: isCorrect,
        completedAt: isCorrect ? new Date() : undefined,
      },
    });

    // Check achievements
    await this.achievementService.checkAndAwardAchievements(userId);

    return {
      isCorrect,
      message: isCorrect ? 'Correct answer!' : 'Incorrect. Try again.',
      xpAwarded,
      // Don't reveal correct answer
      correctAnswer: undefined,
    };
  }

  async getAdaptiveQuiz(userId: string, topic: string, difficulty?: string) {
    // Get user's skill level for this topic
    const userSkills = await this.prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    const topicSkill = userSkills.find(
      (s) => s.skill.category === topic || s.skill.name.includes(topic)
    );

    const currentLevel = topicSkill?.level || 0;

    // Determine appropriate difficulty
    let targetDifficulty = difficulty || 'medium';
    if (!difficulty) {
      if (currentLevel < 30) targetDifficulty = 'easy';
      else if (currentLevel < 70) targetDifficulty = 'medium';
      else targetDifficulty = 'hard';
    }

    // Get questions matching difficulty
    const questions = await this.prisma.quizQuestion.findMany({
      where: {
        lesson: {
          module: {
            course: {
              slug: { contains: topic, mode: 'insensitive' },
            },
          },
        },
      },
      take: 10,
    });

    return {
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
      })),
      difficulty: targetDifficulty,
      userLevel: currentLevel,
      estimatedTime: questions.length * 2, // 2 minutes per question
    };
  }
}
