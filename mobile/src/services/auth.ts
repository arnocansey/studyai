import {
  api,
  setAuthToken,
  setRefreshToken,
  clearAuthTokens,
  loadRefreshToken,
} from "./api";

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
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

function persistTokens(res: AuthResponse) {
  if (res.accessToken) setAuthToken(res.accessToken);
  if (res.refreshToken) setRefreshToken(res.refreshToken);
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    persistTokens(res);
    return res;
  },

  register: async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });
    persistTokens(res);
    return res;
  },

  refresh: async (): Promise<AuthResponse | null> => {
    const refreshToken = await loadRefreshToken();
    if (!refreshToken) return null;
    const res = await api.post<AuthResponse>("/auth/refresh", { refreshToken });
    persistTokens(res);
    return res;
  },

  getMe: async (): Promise<UserProfile> => {
    return api.get<UserProfile>("/auth/me");
  },

  logout: async () => {
    const refreshToken = await loadRefreshToken();
    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // ignore
    }
    clearAuthTokens();
  },

  getOAuthUrl: (provider: "google" | "github") => {
    const base =
      (globalThis as any).expoConfig?.extra?.apiBase ||
      process.env.EXPO_PUBLIC_API_BASE ||
      "https://studyaibackend-rxzz.onrender.com/api/v1";
    return `${base}/auth/${provider}`;
  },
};
