import { api } from './api';

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  maxMembers: number;
  isPublic: boolean;
  memberCount: number;
  createdAt: string;
}

export const studyGroupsApi = {
  list: (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get<StudyGroup[]>(`/study-groups${q}`);
  },
  getMy: () => api.get<StudyGroup[]>('/study-groups/my'),
  getById: (id: string) => api.get<StudyGroup>(`/study-groups/${id}`),
  create: (data: { name: string; description: string; topic: string; maxMembers?: number }) =>
    api.post<StudyGroup>('/study-groups', data),
  join: (id: string) => api.post(`/study-groups/${id}/join`),
  leave: (id: string) => api.delete(`/study-groups/${id}/leave`),
};
