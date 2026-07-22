import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let prisma: any;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      findById: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue("mock-token"),
    };

    prisma = {
      refreshToken: {
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      authExchangeCode: {
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      account: {
        findUnique: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: string) => fallback ?? "30"),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.createUser as jest.Mock).mockResolvedValue({
        id: "1",
        email: "test@test.com",
        name: "Test",
        role: "STUDENT",
        xp: 0,
        streak: 0,
      });

      const result = await service.register({
        email: "test@test.com",
        name: "Test",
        password: "password123",
      });

      expect(result.user.email).toBe("test@test.com");
      expect(result.accessToken).toBe("mock-token");
      expect(result.refreshToken).toBeDefined();
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it("should throw if user already exists", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        id: "1",
        email: "test@test.com",
      });

      await expect(
        service.register({
          email: "test@test.com",
          name: "Test",
          password: "password123",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("login", () => {
    it("should throw if user not found", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({ email: "test@test.com", password: "password123" }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
