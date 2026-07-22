import { IoAdapter } from "@nestjs/platform-socket.io";
import { INestApplication, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ServerOptions } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { getRedisConnection, isRedisEnabled } from "../queues/queue.constants";

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;

  constructor(
    app: INestApplication,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<boolean> {
    if (!isRedisEnabled(this.configService)) {
      this.logger.warn(
        "Redis disabled — Socket.IO running in single-instance mode",
      );
      return false;
    }

    const connection = getRedisConnection(this.configService);

    try {
      this.pubClient = new Redis({
        ...connection,
        lazyConnect: true,
        enableOfflineQueue: false,
      });
      this.subClient = this.pubClient.duplicate();

      this.pubClient.on("error", (err) =>
        this.logger.error(`Redis pub error: ${err.message}`),
      );
      this.subClient.on("error", (err) =>
        this.logger.error(`Redis sub error: ${err.message}`),
      );

      await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
      await Promise.all([this.pubClient.ping(), this.subClient.ping()]);

      this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
      this.logger.log(
        `Socket.IO Redis adapter connected (${connection.host}:${connection.port})`,
      );
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Socket.IO Redis adapter unavailable (${message}) — single-instance mode`,
      );
      await this.disconnect();
      return false;
    }
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }

  async disconnect() {
    try {
      await this.pubClient?.quit();
    } catch {
      this.pubClient?.disconnect();
    }
    try {
      await this.subClient?.quit();
    } catch {
      this.subClient?.disconnect();
    }
    this.pubClient = null;
    this.subClient = null;
    this.adapterConstructor = null;
  }
}
