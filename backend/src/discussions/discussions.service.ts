import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { XpService } from '../gamification/xp.service';

@Injectable()
export class DiscussionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xpService: XpService,
  ) {}

  async createDiscussion(data: {
    title: string;
    content: string;
    category: string;
    tags?: string[];
    authorId: string;
  }) {
    const discussion = await this.prisma.discussion.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        authorId: data.authorId,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, level: true } },
      },
    });

    await this.xpService.addXP(data.authorId, 10, 'Created discussion');

    return discussion;
  }

  async getDiscussions(filters?: { category?: string; search?: string }) {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } },
      ];
    }

    return this.prisma.discussion.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, level: true } },
        _count: { select: { replies: true } },
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });
  }

  async getDiscussion(id: string) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, level: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true, level: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!discussion) throw new NotFoundException('Discussion not found');

    await this.prisma.discussion.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return discussion;
  }

  async reply(discussionId: string, authorId: string, content: string) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) throw new NotFoundException('Discussion not found');

    const reply = await this.prisma.discussionReply.create({
      data: {
        discussionId,
        authorId,
        content,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, level: true } },
      },
    });

    await this.xpService.addXP(authorId, 5, 'Replied to discussion');

    return reply;
  }

  async upvote(discussionId: string, userId: string) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) throw new NotFoundException('Discussion not found');

    if (discussion.authorId === userId) {
      return { success: true, message: 'Cannot upvote your own discussion' };
    }

    const existing = await this.prisma.discussionUpvote.findUnique({
      where: {
        discussionId_userId: { discussionId, userId },
      },
    });

    if (existing) {
      return { success: true, message: 'Already upvoted' };
    }

    await this.prisma.discussionUpvote.create({
      data: { discussionId, userId },
    });

    await this.prisma.discussion.update({
      where: { id: discussionId },
      data: { upvotes: { increment: 1 } },
    });

    await this.xpService.addXP(discussion.authorId, 2, 'Received upvote');

    return { success: true };
  }

  async pinDiscussion(id: string) {
    const discussion = await this.prisma.discussion.findUnique({ where: { id } });
    if (!discussion) throw new NotFoundException('Discussion not found');

    return this.prisma.discussion.update({
      where: { id },
      data: { pinned: !discussion.pinned },
    });
  }
}
