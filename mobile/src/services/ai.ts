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

export const aiApi = {
  explain: (prompt: string, context?: string) =>
    api.post<{ explanation: string }>("/ai/explain", { prompt, context }),

  tutor: (
    messages: { role: "user" | "assistant"; content: string }[],
    topic?: string,
  ) => api.post<{ response: string }>("/ai/tutor", { messages, topic }),

  review: (code: string, language: string) =>
    api.post<{ review: string; suggestions: string[] }>("/ai/review", {
      code,
      language,
    }),

  hint: (question: string, difficulty?: string) =>
    api.post<{ hint: string }>("/ai/hint", { question, difficulty }),

  getLatestStudyPlan: () => api.get<StudyPlan | null>("/ai/study-plan/latest"),

  listStudyPlans: () => api.get<StudyPlan[]>("/ai/study-plan"),

  generateStudyPlan: (body: StudyPlanRequest) =>
    api.post<StudyPlan>("/ai/study-plan", body),
};
