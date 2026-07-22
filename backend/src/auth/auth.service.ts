import {
  Injectable,
  UnauthorizedException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  xp: number;
  streak: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto, userAgent?: string) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new UnauthorizedException(
        "An account with this email already exists.",
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.createUser({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: "STUDENT",
    });

    return this.issueAuthResponse(user, userAgent);
  }

  async login(dto: LoginDto, userAgent?: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    return this.issueAuthResponse(user, userAgent);
  }

  async refresh(refreshToken: string, userAgent?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token required.");
    }

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            xp: true,
            streak: true,
            deletedAt: true,
          },
        },
      },
    });

    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt < new Date() ||
      stored.user.deletedAt
    ) {
      throw new UnauthorizedException("Invalid or expired refresh token.");
    }

    // Rotate: revoke old token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueAuthResponse(stored.user, userAgent);
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return { success: true };
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  async loginWithOAuth(
    profile: {
      provider: "google" | "github";
      providerAccountId: string;
      email: string;
      name?: string;
      accessToken?: string;
      refreshToken?: string;
    },
    userAgent?: string,
  ) {
    if (!profile.email) {
      throw new UnauthorizedException(
        "OAuth provider did not return an email address.",
      );
    }

    const existingAccount = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            xp: true,
            streak: true,
            deletedAt: true,
          },
        },
      },
    });

    let user: AuthUser;

    if (existingAccount?.user && !existingAccount.user.deletedAt) {
      user = existingAccount.user;
      await this.prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          access_token: profile.accessToken,
          refresh_token: profile.refreshToken,
        },
      });
    } else {
      const created = await this.usersService.findOrCreateUserByEmail(
        profile.email,
        profile.name,
      );
      user = created;

      await this.prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: profile.provider,
            providerAccountId: profile.providerAccountId,
          },
        },
        create: {
          userId: user.id,
          type: "oauth",
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
          access_token: profile.accessToken,
          refresh_token: profile.refreshToken,
        },
        update: {
          userId: user.id,
          access_token: profile.accessToken,
          refresh_token: profile.refreshToken,
        },
      });
    }

    const tokens = await this.issueAuthResponse(user, userAgent);
    const code = await this.createExchangeCode(user.id);
    return { ...tokens, code };
  }

  async exchangeCode(code: string, userAgent?: string) {
    if (!code) throw new UnauthorizedException("Exchange code required.");
    const codeHash = this.hashToken(code);
    const record = await this.prisma.authExchangeCode.findUnique({
      where: { codeHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            xp: true,
            streak: true,
            deletedAt: true,
          },
        },
      },
    });

    if (
      !record ||
      record.usedAt ||
      record.expiresAt < new Date() ||
      record.user.deletedAt
    ) {
      throw new UnauthorizedException("Invalid or expired exchange code.");
    }

    await this.prisma.authExchangeCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return this.issueAuthResponse(record.user, userAgent);
  }

  assertOAuthConfigured(provider: "google" | "github") {
    if (provider === "google") {
      if (
        !this.config.get("GOOGLE_CLIENT_ID") ||
        !this.config.get("GOOGLE_CLIENT_SECRET")
      ) {
        throw new ServiceUnavailableException(
          "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
        );
      }
    } else {
      if (
        !this.config.get("GITHUB_CLIENT_ID") ||
        !this.config.get("GITHUB_CLIENT_SECRET")
      ) {
        throw new ServiceUnavailableException(
          "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.",
        );
      }
    }
  }

  getFrontendCallbackUrl(code: string) {
    const frontend = this.config.get<string>(
      "FRONTEND_URL",
      "http://localhost:3000",
    );
    return `${frontend.replace(/\/$/, "")}/api/auth/callback?code=${encodeURIComponent(code)}`;
  }

  private async issueAuthResponse(user: AuthUser, userAgent?: string) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        xp: user.xp,
        streak: user.streak,
      },
      accessToken,
      refreshToken,
    };
  }

  private generateAccessToken(user: {
    id: string;
    email: string;
    role: string;
    name?: string | null;
  }) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
    });
  }

  private async createRefreshToken(userId: string, userAgent?: string) {
    const raw = crypto.randomBytes(48).toString("base64url");
    const days = Number(this.config.get("JWT_REFRESH_DAYS", "30"));
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(raw),
        expiresAt,
        userAgent: userAgent?.slice(0, 255),
      },
    });

    return raw;
  }

  private async createExchangeCode(userId: string) {
    const raw = crypto.randomBytes(24).toString("base64url");
    await this.prisma.authExchangeCode.create({
      data: {
        userId,
        codeHash: this.hashToken(raw),
        expiresAt: new Date(Date.now() + 60 * 1000),
      },
    });
    return raw;
  }

  private hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
