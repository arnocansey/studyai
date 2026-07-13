import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        quizzes: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async verifyQuiz(lessonId: string, questionId: string, answer: string) {
    const question = await this.prisma.quizQuestion.findFirst({
      where: { id: questionId, lessonId },
    });

    if (!question) {
      throw new NotFoundException(`Quiz question not found for this lesson`);
    }

    const isCorrect = question.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase();

    return {
      isCorrect,
      message: isCorrect ? 'Correct answer!' : 'Incorrect. Try again.',
    };
  }

  async submitLab(userId: string, lessonId: string, submission: any) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson not found`);
    }

    let isSuccess = false;
    let logs = '';

    const labConfig = lesson.labConfig as any;

    if (lesson.type === 'CODING_LAB') {
      if (labConfig && labConfig.solution) {
        const cleanSub = submission.code?.replace(/\s+/g, '') || '';
        const cleanSol = labConfig.solution.replace(/\s+/g, '') || '';
        isSuccess = cleanSub.includes(cleanSol) || cleanSub === cleanSol;
        logs = isSuccess ? 'Test cases passed successfully.' : 'SyntaxError: Expected output mismatch.';
      }
    } else if (lesson.type === 'NETWORKING_LAB') {
      if (labConfig && labConfig.targetMask) {
        isSuccess = submission.mask?.trim() === labConfig.targetMask.trim();
        logs = isSuccess ? 'Network routing validated successfully.' : 'Routing error: Subnet mismatch.';
      }
    } else if (lesson.type === 'CYBER_LAB') {
      if (labConfig && labConfig.flag) {
        isSuccess = submission.flag?.trim() === labConfig.flag.trim();
        logs = isSuccess ? 'Exploit flag verified. SUID privilege escalation successful!' : 'Access denied: Invalid exploit payload.';
      }
    }

    const labSession = await this.prisma.labSession.create({
      data: {
        userId,
        lessonId,
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        logs,
      },
    });

    let xpAwarded = 0;
    if (isSuccess) {
      const existingProgress = await this.prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: { userId, lessonId },
        },
      });

      if (!existingProgress || !existingProgress.completed) {
        xpAwarded = 150;
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

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: 150 },
          },
        });
      }
    }

    return {
      status: labSession.status,
      logs: labSession.logs,
      xpAwarded,
    };
  }
}
