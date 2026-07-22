export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

import { useAuthStore } from "@/lib/auth-store";

function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().token;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getClientToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    const message = Array.isArray(errorData.message)
      ? errorData.message.join(", ")
      : errorData.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

/** Same-origin BFF fetch — sends cookie + optional bearer for /api/* routes */
export async function bffFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getClientToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    const message = Array.isArray(errorData.message)
      ? errorData.message.join(", ")
      : errorData.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}
