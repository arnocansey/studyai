import { api } from "./api";

export interface StudyPlanWeek {
  week: number;
  theme: string;
  objectives: string[];
  activities: string[];
  deliverable: string;
}

export interface StudyPlan {
  id?: string;
  goal: string;
  level: string;
  weeklyHours: number;
  durationWeeks: number;
  milestones: string[];
  weeks: StudyPlanWeek[];
  focusAreas?: string[];
  createdAt?: string;
}

export interface StudyPlanRequest {
  goal: string;
  currentLevel: "beginner" | "intermediate" | "advanced";
  weeklyHours: number;
  focusAreas?: string[];
}

export interface CodeReviewResult {
  rating: number;
  feedback: string;
  improvements: string[];
  securityIssues: string[];
}

export interface TutorResponse {
  response: string;
  followUp: string;
  hint: string;
  conversationId: string;
}

export const aiApi = {
  explain: (prompt: string, context?: string, lessonId?: string) =>
    api.post<{ explanation: string }>("/ai/explain", {
      prompt,
      context,
      lessonId,
    }),

  tutor: (
    messages: { role: "user" | "assistant"; content: string }[],
    options?: { topic?: string; lessonId?: string; conversationId?: string },
  ) =>
    api.post<TutorResponse>("/ai/tutor", {
      messages,
      topic: options?.topic,
      lessonId: options?.lessonId,
      conversationId: options?.conversationId,
    }),

  review: (code: string, language: string) =>
    api.post<CodeReviewResult>("/ai/review", {
      code,
      language,
    }),

  hint: (question: string, difficulty?: string, lessonId?: string) =>
    api.post<{ hint: string }>("/ai/hint", {
      question,
      difficulty,
      lessonId,
    }),

  generateQuiz: (lessonId: string, count = 3, save = false) =>
    api.post<{
      lessonId: string;
      questions: Array<{
        id?: string;
        question: string;
        options: string[];
        correctAnswer?: string;
      }>;
      saved: boolean;
    }>("/ai/quiz/generate", { lessonId, count, save }),

  listConversations: (lessonId?: string) =>
    api.get<
      Array<{
        id: string;
        lessonId: string | null;
        topic: string | null;
        title: string | null;
        updatedAt: string;
      }>
    >(
      lessonId
        ? `/ai/conversations?lessonId=${encodeURIComponent(lessonId)}`
        : "/ai/conversations",
    ),

  getConversation: (id: string) =>
    api.get<{
      id: string;
      messages: Array<{ role: string; content: string }>;
    }>(`/ai/conversations/${id}`),

  getLatestStudyPlan: () => api.get<StudyPlan | null>("/ai/study-plan/latest"),

  listStudyPlans: () => api.get<StudyPlan[]>("/ai/study-plan"),

  generateStudyPlan: (body: StudyPlanRequest) =>
    api.post<StudyPlan>("/ai/study-plan", body),
};
