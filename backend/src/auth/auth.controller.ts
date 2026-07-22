import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Res,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ExchangeDto, RefreshDto } from "./dto/refresh.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import type { Response } from "express";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user account" })
  async register(@Body() dto: RegisterDto, @Request() req: any) {
    return this.authService.register(dto, req.headers?.["user-agent"]);
  }

  @Post("login")
  @ApiOperation({ summary: "Login with email and password" })
  async login(@Body() dto: LoginDto, @Request() req: any) {
    return this.authService.login(dto, req.headers?.["user-agent"]);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Rotate access + refresh tokens" })
  async refresh(@Body() dto: RefreshDto, @Request() req: any) {
    return this.authService.refresh(
      dto.refreshToken,
      req.headers?.["user-agent"],
    );
  }

  @Post("logout")
  @ApiOperation({ summary: "Revoke a refresh token" })
  async logout(@Body() body: { refreshToken?: string }) {
    return this.authService.logout(body?.refreshToken);
  }

  @Post("exchange")
  @ApiOperation({ summary: "Exchange one-time OAuth code for tokens" })
  async exchange(@Body() dto: ExchangeDto, @Request() req: any) {
    return this.authService.exchangeCode(dto.code, req.headers?.["user-agent"]);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current authenticated user profile" })
  async getMe(@Request() req: any) {
    return req.user;
  }

  @Get("providers")
  @ApiOperation({ summary: "Which OAuth providers are configured" })
  providers() {
    return {
      google: !!(
        this.config.get("GOOGLE_CLIENT_ID") &&
        this.config.get("GOOGLE_CLIENT_SECRET")
      ),
      github: !!(
        this.config.get("GITHUB_CLIENT_ID") &&
        this.config.get("GITHUB_CLIENT_SECRET")
      ),
    };
  }

  @Get("google")
  @ApiOperation({ summary: "Start Google OAuth" })
  googleStart(@Res() res: Response) {
    this.authService.assertOAuthConfigured("google");
    return res.redirect("/api/v1/auth/google/redirect");
  }

  @Get("google/redirect")
  @UseGuards(AuthGuard("google"))
  googleRedirect() {
    // Passport redirects to Google
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleCallback(@Request() req: any, @Res() res: Response) {
    const result = await this.authService.loginWithOAuth(
      req.user,
      req.headers?.["user-agent"],
    );
    return res.redirect(this.authService.getFrontendCallbackUrl(result.code));
  }

  @Get("github")
  @ApiOperation({ summary: "Start GitHub OAuth" })
  githubStart(@Res() res: Response) {
    this.authService.assertOAuthConfigured("github");
    return res.redirect("/api/v1/auth/github/redirect");
  }

  @Get("github/redirect")
  @UseGuards(AuthGuard("github"))
  githubRedirect() {
    // Passport redirects to GitHub
  }

  @Get("github/callback")
  @UseGuards(AuthGuard("github"))
  async githubCallback(@Request() req: any, @Res() res: Response) {
    const result = await this.authService.loginWithOAuth(
      req.user,
      req.headers?.["user-agent"],
    );
    return res.redirect(this.authService.getFrontendCallbackUrl(result.code));
  }
}
