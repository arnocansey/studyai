import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudyGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async createGroup(data: {
    name: string;
    description: string;
    topic: string;
    maxMembers?: number;
    isPublic?: boolean;
    creatorId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const group = await tx.studyGroup.create({
        data: {
          name: data.name,
          description: data.description,
          topic: data.topic,
          maxMembers: data.maxMembers || 10,
          isPublic: data.isPublic ?? true,
          creatorId: data.creatorId,
        },
      });

      // Add creator as admin member
      await tx.studyGroupMember.create({
        data: {
          groupId: group.id,
          userId: data.creatorId,
          role: 'admin',
        },
      });

      return this.getGroup(group.id);
    });
  }

  async getGroups(filters?: { topic?: string; search?: string; userId?: string }) {
    const where: any = {};

    if (filters?.topic) {
      where.topic = filters.topic;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Only show public groups or groups the user is a member of
    if (filters?.userId) {
      where.OR = [
        { isPublic: true },
        { members: { some: { userId: filters.userId } } },
      ];
    } else {
      where.isPublic = true;
    }

    return this.prisma.studyGroup.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          take: 10,
        },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getGroup(id: string) {
    const group = await this.prisma.studyGroup.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
        _count: { select: { members: true } },
      },
    });

    if (!group) throw new NotFoundException('Study group not found');
    return group;
  }

  async joinGroup(groupId: string, userId: string) {
    const group = await this.getGroup(groupId);

    if (group._count.members >= group.maxMembers) {
      throw new ForbiddenException('Group is full');
    }

    const existingMember = await this.prisma.studyGroupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (existingMember) {
      throw new ForbiddenException('Already a member of this group');
    }

    await this.prisma.studyGroupMember.create({
      data: {
        groupId,
        userId,
        role: 'member',
      },
    });

    return this.getGroup(groupId);
  }

  async leaveGroup(groupId: string, userId: string) {
    const member = await this.prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!member) throw new NotFoundException('Not a member of this group');
    if (member.role === 'admin') throw new ForbiddenException('Admin cannot leave group');

    await this.prisma.studyGroupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });

    return { success: true };
  }

  async getUserGroups(userId: string) {
    return this.prisma.studyGroup.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
