export const AUTH_COOKIE = "studyai_token";
export const REFRESH_COOKIE = "studyai_refresh";

export const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  // Cookie lifetime can exceed JWT lifetime; /api/auth/me refreshes when JWT expires.
  maxAge: 60 * 60 * 24 * 30,
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

/** @deprecated use accessCookieOptions */
export const authCookieOptions = accessCookieOptions;

export function clearAuthCookies(response: {
  cookies: {
    set: (
      name: string,
      value: string,
      options: Record<string, unknown>,
    ) => void;
  };
}) {
  response.cookies.set(AUTH_COOKIE, "", { ...accessCookieOptions, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", {
    ...refreshCookieOptions,
    maxAge: 0,
  });
}

export function setAuthCookies(
  response: {
    cookies: {
      set: (
        name: string,
        value: string,
        options: Record<string, unknown>,
      ) => void;
    };
  },
  tokens: { accessToken?: string; refreshToken?: string },
) {
  if (tokens.accessToken) {
    response.cookies.set(AUTH_COOKIE, tokens.accessToken, accessCookieOptions);
  }
  if (tokens.refreshToken) {
    response.cookies.set(
      REFRESH_COOKIE,
      tokens.refreshToken,
      refreshCookieOptions,
    );
  }
}
