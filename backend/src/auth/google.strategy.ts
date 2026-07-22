import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Strategy, Profile, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>("GOOGLE_CLIENT_ID") || "unused",
      clientSecret: config.get<string>("GOOGLE_CLIENT_SECRET") || "unused",
      callbackURL:
        config.get<string>("GOOGLE_CALLBACK_URL") ||
        "http://localhost:4000/api/v1/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;
    done(null, {
      provider: "google" as const,
      providerAccountId: profile.id,
      email,
      name: profile.displayName,
      accessToken,
      refreshToken,
    });
  }
}
