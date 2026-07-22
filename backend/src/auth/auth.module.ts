import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { GoogleStrategy } from "./google.strategy";
import { GithubStrategy } from "./github.strategy";
import { UsersModule } from "../users/users.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>("JWT_SECRET");
        if (!secret) {
          throw new Error("JWT_SECRET environment variable is required");
        }
        return {
          secret,
          signOptions: {
            expiresIn: configService.get<string>(
              "JWT_EXPIRATION",
              "15m",
            ) as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, GithubStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
