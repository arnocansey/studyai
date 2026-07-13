import { api } from './api';

export const aiApi = {
  explain: (prompt: string, context?: string) =>
    api.post<{ explanation: string }>('/ai/explain', { prompt, context }),
  tutor: (messages: { role: 'user' | 'assistant'; content: string }[], topic?: string) =>
    api.post<{ response: string }>('/ai/tutor', { messages, topic }),
  review: (code: string, language: string) =>
    api.post<{ review: string; suggestions: string[] }>('/ai/review', { code, language }),
  hint: (question: string, difficulty?: string) =>
    api.post<{ hint: string }>('/ai/hint', { question, difficulty }),
};
