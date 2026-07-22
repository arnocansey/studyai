import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Production DBs that were created with `db push` often never applied later
 * migrate files. Ensure auth tables exist so login/refresh cannot 500.
 */
const AUTH_TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "AuthExchangeCode" (
    "id" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthExchangeCode_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash")`,
  `CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AuthExchangeCode_codeHash_key" ON "AuthExchangeCode"("codeHash")`,
  `CREATE INDEX IF NOT EXISTS "AuthExchangeCode_userId_idx" ON "AuthExchangeCode"("userId")`,
  `DO $$ BEGIN
    ALTER TABLE "RefreshToken"
      ADD CONSTRAINT "RefreshToken_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_table THEN NULL;
  END $$`,
  `DO $$ BEGIN
    ALTER TABLE "AuthExchangeCode"
      ADD CONSTRAINT "AuthExchangeCode_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_table THEN NULL;
  END $$`,
];

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.connected = true;
      this.logger.log("Database connected");
      await this.ensureAuthTables();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Database connection failed: ${message}`);
      this.logger.warn(
        "Running in offline mode — database operations will fail",
      );
    }
  }

  private async ensureAuthTables() {
    try {
      for (const statement of AUTH_TABLE_STATEMENTS) {
        await this.$executeRawUnsafe(statement);
      }
      this.logger.log("Auth tables verified (RefreshToken / AuthExchangeCode)");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to ensure auth tables: ${message}`);
    }
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.$disconnect();
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
