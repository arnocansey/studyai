import { authApi } from "../auth";
import {
  api,
  setAuthToken,
  setRefreshToken,
  clearAuthTokens,
  loadRefreshToken,
} from "../api";

jest.mock("../api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
  setAuthToken: jest.fn(),
  setRefreshToken: jest.fn(),
  clearAuthTokens: jest.fn(),
  loadAuthToken: jest.fn(),
  loadRefreshToken: jest.fn(),
}));

describe("Auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("calls POST /auth/login with credentials", async () => {
      (api.post as jest.Mock).mockResolvedValue({
        accessToken: "jwt-token-123",
        refreshToken: "refresh-123",
        user: {
          id: "1",
          email: "test@test.com",
          name: "Test",
          role: "STUDENT",
        },
      });

      const result = await authApi.login("test@test.com", "password123");

      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@test.com",
        password: "password123",
      });
      expect(setAuthToken).toHaveBeenCalledWith("jwt-token-123");
      expect(setRefreshToken).toHaveBeenCalledWith("refresh-123");
      expect(result.accessToken).toBe("jwt-token-123");
    });
  });

  describe("register", () => {
    it("calls POST /auth/register with user data", async () => {
      (api.post as jest.Mock).mockResolvedValue({
        accessToken: "jwt-new-456",
        refreshToken: "refresh-456",
        user: {
          id: "2",
          email: "new@test.com",
          name: "New User",
          role: "STUDENT",
        },
      });

      const result = await authApi.register(
        "New User",
        "new@test.com",
        "pass456",
      );

      expect(api.post).toHaveBeenCalledWith("/auth/register", {
        name: "New User",
        email: "new@test.com",
        password: "pass456",
      });
      expect(setAuthToken).toHaveBeenCalledWith("jwt-new-456");
      expect(result.user.name).toBe("New User");
    });
  });

  describe("getMe", () => {
    it("calls GET /auth/me", async () => {
      (api.get as jest.Mock).mockResolvedValue({
        id: "1",
        email: "test@test.com",
        name: "Test",
        role: "STUDENT",
        xp: 1000,
        level: 5,
        streak: 7,
      });

      const profile = await authApi.getMe();

      expect(api.get).toHaveBeenCalledWith("/auth/me");
      expect(profile.name).toBe("Test");
      expect(profile.xp).toBe(1000);
    });
  });

  describe("logout", () => {
    it("revokes refresh token and clears auth", async () => {
      (loadRefreshToken as jest.Mock).mockResolvedValue("refresh-123");
      (api.post as jest.Mock).mockResolvedValue({ success: true });

      await authApi.logout();

      expect(api.post).toHaveBeenCalledWith("/auth/logout", {
        refreshToken: "refresh-123",
      });
      expect(clearAuthTokens).toHaveBeenCalled();
    });
  });
});
