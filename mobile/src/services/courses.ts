import { api } from "./api";

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  coverImage?: string | null;
  published?: boolean;
  _count?: { modules: number; enrollments?: number };
  // Derived / legacy-friendly fields used by older screens
  icon?: string;
  lessonsCount?: number;
  tags?: string[];
  estimatedHours?: number;
}

export interface CourseLessonSummary {
  id: string;
  title: string;
  type: string;
  order: number;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: CourseLessonSummary[];
}

export interface CourseDetail extends Course {
  modules: CourseModule[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  order: number;
  type: string;
  quizzes?: QuizQuestion[];
  labConfig?: unknown;
}

export interface CourseProgress {
  enrollmentId: string;
  courseId: string;
  title: string;
  slug: string;
  difficulty: string;
  joinedAt: string;
  completed: boolean;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  moduleCount: number;
}

export interface QuizVerifyResult {
  isCorrect: boolean;
  message: string;
  xpAwarded?: number;
}

export interface CompleteLessonResult {
  completed: boolean;
  xpAwarded: number;
  alreadyCompleted: boolean;
}

function normalizeCourse(course: Course): Course {
  return {
    ...course,
    icon: course.icon || "📚",
    lessonsCount: course.lessonsCount ?? course._count?.modules ?? 0,
    tags: course.tags || [],
    estimatedHours: course.estimatedHours ?? 0,
  };
}

export const coursesApi = {
  list: async () => {
    const courses = await api.get<Course[]>("/courses");
    return courses.map(normalizeCourse);
  },

  getBySlug: async (slug: string) => {
    const course = await api.get<CourseDetail>(`/courses/${slug}`);
    return {
      ...normalizeCourse(course),
      modules: course.modules || [],
    } as CourseDetail;
  },

  getMyProgress: () => api.get<CourseProgress[]>("/courses/my-progress"),

  enroll: (courseId: string) => api.post(`/courses/${courseId}/enroll`, {}),

  unenroll: (courseId: string) => api.delete(`/courses/${courseId}/enroll`),

  getLesson: (id: string) => api.get<Lesson>(`/lessons/${id}`),

  completeLesson: (lessonId: string) =>
    api.post<CompleteLessonResult>(`/lessons/${lessonId}/complete`, {}),

  /** Prefer /quiz/verify — awards XP once per question and auto-completes when all correct */
  verifyQuiz: (questionId: string, answer: string) =>
    api.post<QuizVerifyResult>("/quiz/verify", { questionId, answer }),

  getQuizForLesson: (lessonId: string) =>
    api.get<{
      questions: QuizQuestion[];
      masteryLevel: number;
      totalQuestions: number;
      completedQuestions: number;
    }>(`/quiz/lesson/${lessonId}`),

  submitLab: (lessonId: string, submission: unknown) =>
    api.post(`/lessons/${lessonId}/submit-lab`, { submission }),
};
