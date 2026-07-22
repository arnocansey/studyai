import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { XpService } from "../gamification/xp.service";
import { AchievementService } from "../gamification/achievement.service";

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly xpService: XpService,
    private readonly achievementService: AchievementService,
  ) {}

  async getQuizForLesson(lessonId: string, userId: string) {
    const lessonProgress = await this.prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

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

    if (!question) throw new NotFoundException("Question not found");

    const isCorrect =
      question.correctAnswer.trim().toLowerCase() ===
      answer.trim().toLowerCase();

    let xpAwarded = 0;

    if (isCorrect) {
      const awardKey = `QUIZ_CORRECT:${questionId}`;
      const alreadyAwarded = await this.prisma.auditLog.findFirst({
        where: { userId, action: awardKey },
        select: { id: true },
      });

      if (!alreadyAwarded) {
        xpAwarded = 25;
        await this.xpService.addXP(userId, xpAwarded, "Quiz correct answer");
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: awardKey,
            details: { questionId, lessonId: question.lessonId },
          },
        });
      }

      await this.maybeCompleteLesson(userId, question.lessonId);
      await this.achievementService.checkAndAwardAchievements(userId);
    } else {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: `QUIZ_WRONG:${questionId}`,
          details: { questionId, lessonId: question.lessonId, answer },
        },
      });
    }

    return {
      isCorrect,
      message: isCorrect ? "Correct answer!" : "Incorrect. Try again.",
      xpAwarded,
      correctAnswer: undefined,
    };
  }

  private async maybeCompleteLesson(userId: string, lessonId: string) {
    const existingProgress = await this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    if (existingProgress?.completed) {
      return;
    }

    const questions = await this.prisma.quizQuestion.findMany({
      where: { lessonId },
      select: { id: true },
    });

    if (questions.length === 0) {
      return;
    }

    const correctCount = await this.prisma.auditLog.count({
      where: {
        userId,
        action: { in: questions.map((q) => `QUIZ_CORRECT:${q.id}`) },
      },
    });

    if (correctCount < questions.length) {
      return;
    }

    await this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });
  }

  async getAdaptiveQuiz(userId: string, topic: string, difficulty?: string) {
    const userSkills = await this.prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    const topicSkill = userSkills.find(
      (s) => s.skill.category === topic || s.skill.name.includes(topic),
    );

    const currentLevel = topicSkill?.level || 0;

    let targetDifficulty = difficulty || "medium";
    if (!difficulty) {
      if (currentLevel < 30) targetDifficulty = "easy";
      else if (currentLevel < 70) targetDifficulty = "medium";
      else targetDifficulty = "hard";
    }

    const questions = await this.prisma.quizQuestion.findMany({
      where: {
        lesson: {
          module: {
            course: {
              slug: { contains: topic, mode: "insensitive" },
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
      estimatedTime: questions.length * 2,
    };
  }
}
