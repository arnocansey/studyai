import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CollaborativeService } from './collaborative.service';

interface AwarenessState {
  userId: string;
  userName: string;
  color: string;
  cursor?: { line: number; column: number };
  selection?: { start: number; end: number };
}

@WebSocketGateway({
  cors: false,
  namespace: '/collaborative',
})
export class CollaborativeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborativeGateway.name);
  private userSockets: Map<string, string> = new Map();
  private socketRooms: Map<string, string> = new Map();
  private awareness: Map<string, Map<string, AwarenessState>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly collaborativeService: CollaborativeService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Collaborative Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;

      if (!token || typeof token !== 'string') {
        this.logger.warn(`Connection rejected: no token provided (${client.id})`);
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
      const userName = payload.name || payload.email || 'User';

      if (!userId) {
        this.logger.warn(`Connection rejected: no userId in token (${client.id})`);
        client.disconnect();
        return;
      }

      this.userSockets.set(client.id, userId);
      (client as any).userId = userId;
      (client as any).userName = userName;

      this.logger.log(`Client connected: ${client.id} (${userId})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.userSockets.get(client.id);
    const docName = this.socketRooms.get(client.id);

    if (docName && userId) {
      const removed = this.collaborativeService.removeUser(docName, client.id);
      if (removed) {
        const docAwareness = this.awareness.get(docName);
        if (docAwareness) {
          docAwareness.delete(userId);
        }
        this.server.to(docName).emit('collaborative:user-left', {
          userId,
          users: this.collaborativeService.getUsers(docName),
        });
      }
    }

    this.userSockets.delete(client.id);
    this.socketRooms.delete(client.id);

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private getUserId(client: Socket): string {
    const userId = this.userSockets.get(client.id) || (client as any).userId;
    if (!userId) throw new UnauthorizedException('Not authenticated');
    return userId;
  }

  private getUserName(client: Socket): string {
    return (client as any).userName || 'User';
  }

  @SubscribeMessage('doc:join')
  handleJoinDocument(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { docName: string; userName?: string },
  ) {
    const userId = this.getUserId(client);
    const userName = data.userName || this.getUserName(client);

    client.join(data.docName);
    this.socketRooms.set(client.id, data.docName);

    const colorIndex = this.collaborativeService.getUsers(data.docName).length % 12;
    const colors = [
      '#EF4444', '#F97316', '#EAB308', '#22C55E',
      '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
      '#F43F5E', '#14B8A6', '#6366F1', '#A855F7',
    ];

    this.collaborativeService.addUser(data.docName, {
      socketId: client.id,
      userId,
      userName,
      color: colors[colorIndex],
      joinedAt: new Date(),
    });

    const docState = this.collaborativeService.getStateAsUpdate(data.docName);
    const stateVector = this.collaborativeService.getStateVector(data.docName);

    if (!this.awareness.has(data.docName)) {
      this.awareness.set(data.docName, new Map());
    }

    client.emit('doc:initial-state', {
      state: Array.from(docState),
      stateVector: Array.from(stateVector),
      users: this.collaborativeService.getUsers(data.docName),
    });

    this.server.to(data.docName).emit('collaborative:user-joined', {
      userId,
      userName,
      users: this.collaborativeService.getUsers(data.docName),
    });

    return { success: true, docName: data.docName };
  }

  @SubscribeMessage('doc:leave')
  handleLeaveDocument(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { docName: string },
  ) {
    const userId = this.getUserId(client);
    client.leave(data.docName);
    this.socketRooms.delete(client.id);

    this.collaborativeService.removeUser(data.docName, client.id);

    const docAwareness = this.awareness.get(data.docName);
    if (docAwareness) {
      docAwareness.delete(userId);
    }

    this.server.to(data.docName).emit('collaborative:user-left', {
      userId,
      users: this.collaborativeService.getUsers(data.docName),
    });

    return { success: true };
  }

  @SubscribeMessage('doc:update')
  handleDocumentUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { docName: string; update: number[] },
  ) {
    const userId = this.getUserId(client);
    const update = new Uint8Array(data.update);

    this.collaborativeService.applyUpdate(data.docName, update);

    client.to(data.docName).emit('doc:update', {
      docName: data.docName,
      update: data.update,
      userId,
    });

    return { success: true };
  }

  @SubscribeMessage('doc:sync')
  handleSyncRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { docName: string; stateVector?: number[] },
  ) {
    const userId = this.getUserId(client);
    const sv = data.stateVector ? new Uint8Array(data.stateVector) : undefined;
    const state = this.collaborativeService.getStateAsUpdate(data.docName, sv);

    client.emit('doc:sync-response', {
      docName: data.docName,
      state: Array.from(state),
      userId,
    });

    return { success: true };
  }

  @SubscribeMessage('awareness:update')
  handleAwarenessUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { docName: string; state: AwarenessState },
  ) {
    const userId = this.getUserId(client);

    if (!this.awareness.has(data.docName)) {
      this.awareness.set(data.docName, new Map());
    }

    this.awareness.get(data.docName)!.set(userId, {
      ...data.state,
      userId,
    });

    client.to(data.docName).emit('awareness:update', {
      docName: data.docName,
      userId,
      state: data.state,
    });

    return { success: true };
  }

  @SubscribeMessage('doc:request-users')
  handleRequestUsers(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { docName: string },
  ) {
    return { users: this.collaborativeService.getUsers(data.docName) };
  }
}
