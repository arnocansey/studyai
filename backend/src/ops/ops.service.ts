import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OpsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      users,
      courseCount,
      enrollmentCount,
      pendingSubmissions,
      streakAgg,
      roleGroups,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.course.count(),
      this.prisma.enrollment.count(),
      this.prisma.labSession.count({
        where: {
          OR: [{ status: "FAILED" }, { endedAt: null }],
        },
      }),
      this.prisma.user.aggregate({
        where: { deletedAt: null, role: "STUDENT" },
        _avg: { streak: true },
        _count: { id: true },
      }),
      this.prisma.user.groupBy({
        by: ["role"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
    ]);

    const usersByRole = {
      STUDENT: 0,
      INSTRUCTOR: 0,
      ADMIN: 0,
    };
    for (const row of roleGroups) {
      usersByRole[row.role] = row._count._all;
    }

    const enrolledStudents = await this.prisma.enrollment.findMany({
      select: { userId: true },
      distinct: ["userId"],
    });

    return {
      totalUsers: users,
      usersByRole,
      courseCount,
      enrollmentCount,
      enrolledStudents: enrolledStudents.length,
      pendingSubmissions,
      avgStudentStreak: Math.round((streakAgg._avg.streak || 0) * 10) / 10,
      studentCount: streakAgg._count.id,
    };
  }

  async listAuditLogs(limit = 50, action?: string) {
    const take = Math.min(Math.max(limit, 1), 200);
    return this.prisma.auditLog.findMany({
      where: action ? { action: { contains: action } } : undefined,
      orderBy: { timestamp: "desc" },
      take,
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    });
  }

  async writeAudit(params: {
    userId?: string | null;
    action: string;
    details?: Record<string, unknown>;
    ipAddress?: string | null;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId || undefined,
        action: params.action,
        details: (params.details || {}) as Prisma.InputJsonValue,
        ipAddress: params.ipAddress || undefined,
      },
    });
  }
}
