import { api } from './api';

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  estimatedHours: number;
  lessonsCount: number;
  tags: string[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  type: string;
  quiz?: any;
}

export const coursesApi = {
  list: () => api.get<Course[]>('/courses'),
  getBySlug: (slug: string) => api.get<Course>(`/courses/${slug}`),
  getLesson: (id: string) => api.get<Lesson>(`/lessons/${id}`),
  verifyQuiz: (lessonId: string, questionId: string, answer: string) =>
    api.post(`/lessons/${lessonId}/verify-quiz`, { questionId, answer }),
  submitLab: (lessonId: string, userId: string, submission: any) =>
    api.post(`/lessons/${lessonId}/submit-lab`, { userId, submission }),
};
