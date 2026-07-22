import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import {
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  room: string;
  timestamp: Date;
  reactions?: { emoji: string; users: string[] }[];
  replyTo?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: "group" | "study-group" | "direct";
  members: string[];
}

interface TypingUser {
  userId: string;
  userName: string;
  room: string;
}

const PUBLIC_ROOMS = new Set(["general", "help", "study"]);
const MAX_MESSAGE_LENGTH = 2000;

@WebSocketGateway({
  cors: false,
  namespace: "/chat",
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private messages: Map<string, ChatMessage[]> = new Map();
  private rooms: Map<string, ChatRoom> = new Map();
  private typingUsers: Map<string, TypingUser[]> = new Map();
  private userSockets: Map<string, string> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log("Chat Gateway initialized");

    this.rooms.set("general", {
      id: "general",
      name: "General Chat",
      type: "group",
      members: [],
    });
    this.rooms.set("help", {
      id: "help",
      name: "Help & Questions",
      type: "group",
      members: [],
    });
    this.rooms.set("study", {
      id: "study",
      name: "Study Group",
      type: "study-group",
      members: [],
    });
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token || typeof token !== "string") {
        this.logger.warn(
          `Connection rejected: no token provided (${client.id})`,
        );
        client.disconnect();
        return;
      }

      let payload: any;
      try {
        payload = this.jwtService.verify(token);
      } catch {
        this.logger.warn(`Connection rejected: invalid token (${client.id})`);
        client.disconnect();
        return;
      }

      const userId = payload.sub || payload.id;
      const userName = payload.name || payload.email || "User";

      if (!userId) {
        this.logger.warn(
          `Connection rejected: no userId in token (${client.id})`,
        );
        client.disconnect();
        return;
      }

      this.userSockets.set(userId, client.id);
      (client as any).userId = userId;
      (client as any).userName = userName;

      client.join("general");
      client.join("help");
      client.join("study");

      this.server.emit("user:online", {
        userId,
        userName,
        timestamp: new Date(),
      });
      this.logger.log(`Client connected: ${client.id} (${userId})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Array.from(this.userSockets.entries()).find(
      ([_, socketId]) => socketId === client.id,
    )?.[0];

    if (userId) {
      this.userSockets.delete(userId);
      this.server.emit("user:offline", { userId, timestamp: new Date() });
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private getUserId(client: Socket): string {
    const userId =
      (client as any).userId ||
      Array.from(this.userSockets.entries()).find(
        ([_, socketId]) => socketId === client.id,
      )?.[0];
    if (!userId) throw new UnauthorizedException("Not authenticated");
    return userId;
  }

  private getUserName(client: Socket): string {
    return (client as any).userName || "User";
  }

  private assertRoomAccess(userId: string, roomId: string) {
    if (PUBLIC_ROOMS.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      throw new ForbiddenException("Room not found");
    }

    if (room.members.length > 0 && !room.members.includes(userId)) {
      throw new ForbiddenException("Not a member of this room");
    }
  }

  @SubscribeMessage("message:send")
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string; room: string; replyTo?: string },
  ) {
    const userId = this.getUserId(client);
    this.assertRoomAccess(userId, data.room);

    const content = typeof data.content === "string" ? data.content.trim() : "";
    if (!content) {
      return { success: false, error: "Message content required" };
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      return {
        success: false,
        error: `Message exceeds ${MAX_MESSAGE_LENGTH} characters`,
      };
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName: this.getUserName(client),
      content,
      room: data.room,
      timestamp: new Date(),
      replyTo: data.replyTo,
      reactions: [],
    };

    const roomMessages = this.messages.get(data.room) || [];
    roomMessages.push(message);
    this.messages.set(data.room, roomMessages);

    this.server.to(data.room).emit("message:new", message);
    this.clearTyping(data.room, userId);

    return { success: true, messageId: message.id };
  }

  @SubscribeMessage("message:react")
  handleReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; room: string; emoji: string },
  ) {
    const userId = this.getUserId(client);
    this.assertRoomAccess(userId, data.room);
    const roomMessages = this.messages.get(data.room) || [];
    const message = roomMessages.find((m) => m.id === data.messageId);

    if (message) {
      if (!message.reactions) message.reactions = [];

      const existingReaction = message.reactions.find(
        (r) => r.emoji === data.emoji,
      );
      if (existingReaction) {
        if (existingReaction.users.includes(userId)) {
          existingReaction.users = existingReaction.users.filter(
            (u) => u !== userId,
          );
          if (existingReaction.users.length === 0) {
            message.reactions = message.reactions.filter(
              (r) => r.emoji !== data.emoji,
            );
          }
        } else {
          existingReaction.users.push(userId);
        }
      } else {
        message.reactions.push({ emoji: data.emoji, users: [userId] });
      }

      this.server.to(data.room).emit("message:updated", message);
    }

    return { success: true };
  }

  @SubscribeMessage("typing:start")
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    const userId = this.getUserId(client);
    this.assertRoomAccess(userId, data.room);

    const roomTyping = this.typingUsers.get(data.room) || [];
    const existing = roomTyping.find((t) => t.userId === userId);

    if (!existing) {
      roomTyping.push({
        userId,
        userName: this.getUserName(client),
        room: data.room,
      });
      this.typingUsers.set(data.room, roomTyping);

      client.to(data.room).emit("typing:update", {
        room: data.room,
        users: roomTyping
          .filter((t) => t.userId !== userId)
          .map((t) => t.userName),
      });
    }

    return { success: true };
  }

  @SubscribeMessage("typing:stop")
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    const userId = this.getUserId(client);
    this.clearTyping(data.room, userId);
    return { success: true };
  }

  @SubscribeMessage("room:join")
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = this.getUserId(client);
    this.assertRoomAccess(userId, data.roomId);
    client.join(data.roomId);
    return { success: true };
  }

  @SubscribeMessage("room:leave")
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    this.getUserId(client);
    client.leave(data.roomId);
    return { success: true };
  }

  @SubscribeMessage("room:create")
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      name: string;
      type: "group" | "study-group" | "direct";
      members?: string[];
    },
  ) {
    const userId = this.getUserId(client);
    const roomId = `room_${Date.now()}`;
    const members = Array.from(new Set([userId, ...(data.members || [])]));
    const room: ChatRoom = {
      id: roomId,
      name: data.name,
      type: data.type,
      members,
    };

    this.rooms.set(roomId, room);
    client.join(roomId);
    this.server.emit("room:created", room);

    return { success: true, roomId };
  }

  @SubscribeMessage("room:list")
  handleListRooms(@ConnectedSocket() client: Socket) {
    const userId = this.getUserId(client);
    const rooms = Array.from(this.rooms.values()).filter(
      (room) =>
        PUBLIC_ROOMS.has(room.id) ||
        room.members.length === 0 ||
        room.members.includes(userId),
    );
    return { rooms };
  }

  @SubscribeMessage("message:history")
  handleGetHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; limit?: number },
  ) {
    const userId = this.getUserId(client);
    this.assertRoomAccess(userId, data.room);
    const messages = this.messages.get(data.room) || [];
    const limit = Math.min(data.limit || 50, 100);
    return { messages: messages.slice(-limit) };
  }

  private clearTyping(room: string, userId: string) {
    const roomTyping = this.typingUsers.get(room) || [];
    const updated = roomTyping.filter((t) => t.userId !== userId);
    this.typingUsers.set(room, updated);

    this.server.to(room).emit("typing:update", {
      room,
      users: updated.map((t) => t.userName),
    });
  }

  sendSystemMessage(room: string, content: string) {
    const message: ChatMessage = {
      id: `sys_${Date.now()}`,
      userId: "system",
      userName: "StudyAI",
      content,
      room,
      timestamp: new Date(),
    };

    this.server.to(room).emit("message:new", message);
  }
}
