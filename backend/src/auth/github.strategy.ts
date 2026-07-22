import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Strategy, Profile } from "passport-github2";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>("GITHUB_CLIENT_ID") || "unused",
      clientSecret: config.get<string>("GITHUB_CLIENT_SECRET") || "unused",
      callbackURL:
        config.get<string>("GITHUB_CALLBACK_URL") ||
        "http://localhost:4000/api/v1/auth/github/callback",
      scope: ["user:email"],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: unknown) => void,
  ) {
    const email =
      profile.emails?.[0]?.value ||
      (profile.username
        ? `${profile.username}@users.noreply.github.com`
        : undefined);
    done(null, {
      provider: "github" as const,
      providerAccountId: profile.id,
      email,
      name: profile.displayName || profile.username,
      accessToken,
      refreshToken,
    });
  }
}
