import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { LessonType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const include = {
      _count: {
        select: { modules: true },
      },
    } as const;

    let courses = await this.prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include,
    });

    // Empty prod DBs (never seeded) used to fall back to fake frontend IDs like routing-201
    if (courses.length === 0) {
      try {
        await this.ensureStarterCatalog();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Starter catalog bootstrap skipped: ${message}`);
      }
      courses = await this.prisma.course.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        include,
      });
    }

    return courses;
  }

  /** Idempotent bootstrap of the 3 core published courses when the catalog is empty. */
  async ensureStarterCatalog() {
    const count = await this.prisma.course.count();
    if (count > 0) return;

    this.logger.warn("No courses found — seeding starter catalog");

    const starters: Array<{
      title: string;
      slug: string;
      description: string;
      difficulty: string;
      moduleTitle: string;
      lesson: {
        title: string;
        type: LessonType;
        content: string;
        labConfig: Prisma.InputJsonValue;
      };
    }> = [
      {
        title: "Systems Programming & Scripting with Python",
        slug: "python-systems-programming",
        description:
          "Master systems automation, basic scripting syntax, data types, and file execution.",
        difficulty: "BEGINNER",
        moduleTitle: "Foundations & Basic Syntax",
        lesson: {
          title: "The Hello World Executable",
          type: LessonType.CODING_LAB,
          content:
            "# Hello World in Python\n\nWrite a script that prints `Hello, StudyAI!`.",
          labConfig: {
            language: "python",
            starterCode: "# Write your Python code below\nprint('')",
            solution: "print('Hello, StudyAI!')",
          },
        },
      },
      {
        title: "IP Subnetting & Network Topologies",
        slug: "ip-subnetting-topologies",
        description:
          "Learn subnet masks, CIDR notations, packet traversals, and routing cable setups.",
        difficulty: "INTERMEDIATE",
        moduleTitle: "CIDR & Routing Boundaries",
        lesson: {
          title: "Splitting Class C Subnets",
          type: LessonType.NETWORKING_LAB,
          content:
            "# Class C Subnetwork Design\n\nSegment `192.168.1.0/24` into 4 subnets.",
          labConfig: {
            networkRange: "192.168.1.0/24",
            requiredSubnets: 4,
            targetMask: "255.255.255.192",
          },
        },
      },
      {
        title: "Ethical Hacking & Linux Exploit Labs",
        slug: "ethical-hacking-linux-security",
        description:
          "Master bash navigation, directory permissions, file cracking, and privilege escalations.",
        difficulty: "ADVANCED",
        moduleTitle: "Linux Directory Navigation & Security",
        lesson: {
          title: "Exploiting SUID Binaries",
          type: LessonType.CYBER_LAB,
          content:
            "# Linux SUID Privilege Escalation\n\nExploit `/bin/vuln-helper` to capture the flag.",
          labConfig: {
            flag: "studyai{suid_priv_escalation_success}",
            environmentImage: "alpine-suid-vuln",
          },
        },
      },
    ];

    for (const starter of starters) {
      const course = await this.prisma.course.create({
        data: {
          title: starter.title,
          slug: starter.slug,
          description: starter.description,
          difficulty: starter.difficulty,
          published: true,
        },
      });
      const module = await this.prisma.module.create({
        data: {
          courseId: course.id,
          title: starter.moduleTitle,
          order: 1,
        },
      });
      await this.prisma.lesson.create({
        data: {
          moduleId: module.id,
          title: starter.lesson.title,
          type: starter.lesson.type,
          order: 1,
          content: starter.lesson.content,
          labConfig: starter.lesson.labConfig,
        },
      });
    }

    this.logger.log("Starter catalog created (3 courses)");
  }

  async findAllForManagement() {
    return this.prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { modules: true, enrollments: true },
        },
      },
    });
  }

  async create(data: {
    title: string;
    slug: string;
    description: string;
    difficulty?: string;
    published?: boolean;
    coverImage?: string;
  }) {
    return this.prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        difficulty: data.difficulty || "BEGINNER",
        published: data.published ?? false,
        coverImage: data.coverImage,
      },
      include: {
        _count: {
          select: { modules: true, enrollments: true },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      slug?: string;
      description?: string;
      difficulty?: string;
      published?: boolean;
      coverImage?: string;
    },
  ) {
    const existing = await this.prisma.course.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return this.prisma.course.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { modules: true, enrollments: true },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                order: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with slug ${slug} not found`);
    }

    return course;
  }

  async enroll(userId: string, courseIdOrSlug: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        OR: [{ id: courseIdOrSlug }, { slug: courseIdOrSlug }],
      },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException(
        `Course "${courseIdOrSlug}" not found. Refresh the page and enroll again.`,
      );
    }

    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });

    if (existing) {
      throw new ConflictException("Already enrolled in this course");
    }

    return this.prisma.enrollment.create({
      data: { userId, courseId: course.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
          },
        },
      },
    });
  }

  async unenroll(userId: string, courseId: string) {
    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!existing) {
      throw new NotFoundException("Enrollment not found");
    }

    await this.prisma.enrollment.delete({
      where: { userId_courseId: { userId, courseId } },
    });

    return { success: true };
  }

  async getMyProgress(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  select: {
                    id: true,
                    progress: {
                      where: { userId, completed: true },
                      select: { id: true },
                    },
                  },
                },
              },
            },
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return enrollments.map((enrollment) => {
      const lessons = enrollment.course.modules.flatMap((m) => m.lessons);
      const totalLessons = lessons.length;
      const completedLessons = lessons.filter(
        (l) => l.progress.length > 0,
      ).length;
      const progress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        enrollmentId: enrollment.id,
        courseId: enrollment.course.id,
        title: enrollment.course.title,
        slug: enrollment.course.slug,
        difficulty: enrollment.course.difficulty,
        joinedAt: enrollment.joinedAt,
        completed: enrollment.completed || progress === 100,
        totalLessons,
        completedLessons,
        progress,
        moduleCount: enrollment.course._count.modules,
      };
    });
  }

  async getCurriculum(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                order: true,
                content: true,
                labConfig: true,
                quizzes: {
                  select: {
                    id: true,
                    question: true,
                    options: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return course;
  }

  async addModule(courseId: string, title: string, order?: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) throw new NotFoundException("Course not found");

    const nextOrder =
      order ??
      ((
        await this.prisma.module.aggregate({
          where: { courseId },
          _max: { order: true },
        })
      )._max.order ?? 0) + 1;

    return this.prisma.module.create({
      data: { courseId, title, order: nextOrder },
      include: { lessons: true },
    });
  }

  async updateModule(
    moduleId: string,
    data: { title?: string; order?: number },
  ) {
    const existing = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });
    if (!existing) throw new NotFoundException("Module not found");

    return this.prisma.module.update({
      where: { id: moduleId },
      data,
      include: { lessons: { orderBy: { order: "asc" } } },
    });
  }

  async deleteModule(moduleId: string) {
    const existing = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });
    if (!existing) throw new NotFoundException("Module not found");
    await this.prisma.module.delete({ where: { id: moduleId } });
    return { success: true };
  }

  async addLesson(
    moduleId: string,
    data: {
      title: string;
      content?: string;
      type?:
        | "TEXT"
        | "VIDEO"
        | "CODING_LAB"
        | "NETWORKING_LAB"
        | "CYBER_LAB"
        | "QUIZ";
      order?: number;
      labConfig?: object;
    },
  ) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });
    if (!module) throw new NotFoundException("Module not found");

    const nextOrder =
      data.order ??
      ((
        await this.prisma.lesson.aggregate({
          where: { moduleId },
          _max: { order: true },
        })
      )._max.order ?? 0) + 1;

    return this.prisma.lesson.create({
      data: {
        moduleId,
        title: data.title,
        content: data.content || "",
        type: data.type || "TEXT",
        order: nextOrder,
        labConfig: data.labConfig || undefined,
      },
    });
  }

  async updateLesson(
    lessonId: string,
    data: {
      title?: string;
      content?: string;
      type?:
        | "TEXT"
        | "VIDEO"
        | "CODING_LAB"
        | "NETWORKING_LAB"
        | "CYBER_LAB"
        | "QUIZ";
      order?: number;
      labConfig?: object | null;
    },
  ) {
    const existing = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!existing) throw new NotFoundException("Lesson not found");

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        order: data.order,
        labConfig:
          data.labConfig === undefined
            ? undefined
            : data.labConfig === null
              ? Prisma.DbNull
              : (data.labConfig as Prisma.InputJsonValue),
      },
    });
  }

  async deleteLesson(lessonId: string) {
    const existing = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!existing) throw new NotFoundException("Lesson not found");
    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { success: true };
  }

  async addQuizQuestion(
    lessonId: string,
    data: { question: string; options: string[]; correctAnswer: string },
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException("Lesson not found");

    return this.prisma.quizQuestion.create({
      data: {
        lessonId,
        question: data.question,
        options: data.options,
        correctAnswer: data.correctAnswer,
      },
    });
  }

  async listEnrolledStudents(courseId?: string) {
    if (courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true },
      });
      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: courseId ? { courseId } : undefined,
      orderBy: { joinedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            xp: true,
            level: true,
            streak: true,
            createdAt: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return enrollments.map((row) => ({
      enrollmentId: row.id,
      joinedAt: row.joinedAt,
      completed: row.completed,
      user: row.user,
      course: row.course,
    }));
  }
}
