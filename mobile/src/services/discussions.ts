import { api } from './api';

export interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  upvotes: number;
  replyCount: number;
  pinned: boolean;
  createdAt: string;
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  upvotes: number;
  createdAt: string;
}

export const discussionsApi = {
  list: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    const q = params.toString() ? `?${params}` : '';
    return api.get<Discussion[]>(`/discussions${q}`);
  },
  getById: (id: string) => api.get<Discussion>(`/discussions/${id}`),
  create: (data: { title: string; content: string; category: string; tags?: string[] }) =>
    api.post<Discussion>('/discussions', data),
  reply: (id: string, content: string) =>
    api.post<DiscussionReply>(`/discussions/${id}/reply`, { content }),
  upvote: (id: string) => api.post(`/discussions/${id}/upvote`),
  pin: (id: string) => api.post(`/discussions/${id}/pin`),
};
