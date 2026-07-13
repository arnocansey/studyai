import { api, setAuthToken } from './api';

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  xp: number;
  level: number;
  streak: number;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    if (res.accessToken) {
      setAuthToken(res.accessToken);
    }
    return res;
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', { name, email, password });
    if (res.accessToken) {
      setAuthToken(res.accessToken);
    }
    return res;
  },

  getMe: async (): Promise<UserProfile> => {
    return api.get<UserProfile>('/auth/me');
  },

  logout: () => {
    setAuthToken(null);
  },
};
