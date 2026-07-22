import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  role: true,
  xp: true,
  level: true,
  streak: true,
  longestStreak: true,
  streakFreezes: true,
  lastActiveAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        ...publicUserSelect,
        badges: { include: { badge: true } },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async listUsers() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        xp: true,
        level: true,
        streak: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUserRole(userId: string, role: Role, actorUserId: string) {
    if (userId === actorUserId && role !== "ADMIN") {
      throw new ForbiddenException("Admins cannot remove their own admin role");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        xp: true,
        level: true,
        streak: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }

  async findOrCreateUserByEmail(email: string, name?: string) {
    let user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: {
        ...publicUserSelect,
        badges: { include: { badge: true } },
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          xp: 0,
          streak: 0,
        },
        select: {
          ...publicUserSelect,
          badges: { include: { badge: true } },
        },
      });
    }

    return user;
  }

  async createUser(data: {
    email: string;
    name: string;
    password: string;
    role: "STUDENT" | "INSTRUCTOR";
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role,
        xp: 0,
        streak: 0,
      },
      select: publicUserSelect,
    });
  }

  async checkIn(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const now = new Date();
    const lastActive = user.lastActiveAt;
    let isStreakIncremented = false;

    if (lastActive) {
      const diffTime = Math.abs(now.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        isStreakIncremented = true;
      } else if (diffDays > 1) {
        isStreakIncremented = false;
      } else {
        return {
          streak: user.streak,
          xp: user.xp,
          checkedInToday: true,
          xpAwarded: 0,
        };
      }
    } else {
      isStreakIncremented = true;
    }

    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: {
        streak: isStreakIncremented ? { increment: 1 } : 1,
        xp: { increment: 100 },
        lastActiveAt: now,
      },
    });

    return {
      streak: updatedUser.streak,
      xp: updatedUser.xp,
      checkedInToday: true,
      xpAwarded: 100,
    };
  }

  async updateLastActive(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });
  }
}
