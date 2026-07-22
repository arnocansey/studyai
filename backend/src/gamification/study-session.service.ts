import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { XpService } from "./xp.service";

@Injectable()
export class StudySessionService {
  private readonly logger = new Logger(StudySessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly xpService: XpService,
  ) {}

  async startStudySession(userId: string) {
    return this.prisma.studySession.create({
      data: { userId, duration: 0, xpEarned: 0 },
    });
  }

  async endStudySession(sessionId: string, userId: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException("Session not found");

    if (session.userId !== userId) {
      throw new ForbiddenException("You can only end your own study sessions");
    }

    if (session.endedAt) {
      throw new BadRequestException("Study session already ended");
    }

    const duration = Math.floor(
      (Date.now() - session.startedAt.getTime()) / 1000,
    );

    const xpEarned = Math.min(Math.floor(duration / 60) * 10, 100);

    const updated = await this.prisma.studySession.update({
      where: { id: sessionId },
      data: {
        duration,
        xpEarned,
        endedAt: new Date(),
      },
    });

    if (xpEarned > 0) {
      await this.xpService.addXP(userId, xpEarned, "Study session");
    }

    return updated;
  }
}
