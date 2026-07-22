import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import {
  isOnline,
  addToSyncQueue,
  getOfflineData,
  saveOfflineData,
} from "./offline";
import { cache } from "./cache";

const EXTRA = Constants.expoConfig?.extra || {};
const API_BASE =
  EXTRA.apiBase ||
  process.env.EXPO_PUBLIC_API_BASE ||
  "https://studyaibackend-rxzz.onrender.com/api/v1";

let authToken: string | null = null;
let refreshToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    SecureStore.setItemAsync("auth_token", token);
  } else {
    SecureStore.deleteItemAsync("auth_token");
  }
}

export function setRefreshToken(token: string | null) {
  refreshToken = token;
  if (token) {
    SecureStore.setItemAsync("refresh_token", token);
  } else {
    SecureStore.deleteItemAsync("refresh_token");
  }
}

export function clearAuthTokens() {
  setAuthToken(null);
  setRefreshToken(null);
}

export async function loadAuthToken(): Promise<string | null> {
  if (authToken) return authToken;
  const stored = await SecureStore.getItemAsync("auth_token");
  if (stored) {
    authToken = stored;
    return stored;
  }
  return null;
}

export async function loadRefreshToken(): Promise<string | null> {
  if (refreshToken) return refreshToken;
  const stored = await SecureStore.getItemAsync("refresh_token");
  if (stored) {
    refreshToken = stored;
    return stored;
  }
  return null;
}

async function tryRefreshAccessToken(): Promise<string | null> {
  const currentRefresh = await loadRefreshToken();
  if (!currentRefresh) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: currentRefresh }),
    });
    if (!res.ok) {
      clearAuthTokens();
      return null;
    }
    const data = await res.json();
    if (data.accessToken) setAuthToken(data.accessToken);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    return data.accessToken || null;
  } catch {
    return null;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
  _retried = false,
): Promise<T> {
  const token = await loadAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const method = (options.method || "GET").toUpperCase();

  if (method === "GET") {
    const online = await isOnline();
    if (!online) {
      const cached = await cache.get<T>(path);
      if (cached !== null) return cached;
      const offlineData = await getOfflineData<T>(path);
      if (offlineData !== null) return offlineData;
      throw new Error("No network and no cached data available");
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401 && !_retried && path !== "/auth/refresh") {
      const next = await tryRefreshAccessToken();
      if (next) return apiFetch<T>(path, options, true);
    }

    if (!res.ok) {
      const body = await res.text();
      let message = `API error ${res.status}`;
      try {
        const json = JSON.parse(body);
        message = json.message || message;
      } catch {}
      throw new Error(message);
    }

    const text = await res.text();
    if (!text) return undefined as T;
    const data = JSON.parse(text) as T;
    await cache.set(path, data);
    return data;
  }

  const online = await isOnline();
  if (!online) {
    await addToSyncQueue({
      method: method as "POST" | "PUT" | "PATCH" | "DELETE",
      path,
      body: options.body ? JSON.parse(options.body as string) : undefined,
    });
    throw new Error("Offline: operation queued for sync");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (
    res.status === 401 &&
    !_retried &&
    path !== "/auth/refresh" &&
    path !== "/auth/login"
  ) {
    const next = await tryRefreshAccessToken();
    if (next) return apiFetch<T>(path, options, true);
  }

  if (!res.ok) {
    const body = await res.text();
    let message = `API error ${res.status}`;
    try {
      const json = JSON.parse(body);
      message = json.message || message;
    } catch {}
    throw new Error(message);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const api = {
  get: <T = any>(path: string) => apiFetch<T>(path),
  post: <T = any>(path: string, body?: any) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T = any>(path: string, body?: any) =>
    apiFetch<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
