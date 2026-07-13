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
import { VideoService, VideoParticipant } from './video.service';

@WebSocketGateway({
  cors: false,
  namespace: '/video',
})
export class VideoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VideoGateway.name);
  private userSockets: Map<string, string> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly videoService: VideoService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Video Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token || typeof token !== 'string') {
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
        this.logger.warn(
          `Connection rejected: invalid token (${client.id})`,
        );
        client.disconnect();
        return;
      }

      const userId = payload.sub || payload.id;
      const userName = payload.name || payload.email || 'User';

      if (!userId) {
        this.logger.warn(
          `Connection rejected: no userId in token (${client.id})`,
        );
        client.disconnect();
        return;
      }

      this.userSockets.set(userId, client.id);
      client.data = { userId, userName };

      this.logger.log(`Video client connected: ${client.id} (${userId})`);
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
    }

    const result = this.videoService.leaveSession(client.id);
    if (result) {
      const others = this.videoService.getOtherParticipants(
        result.sessionId,
        client.id,
      );
      for (const other of others) {
        this.server.to(other.socketId).emit('peer-disconnected', {
          userId: result.userId,
          sessionId: result.sessionId,
        });
      }
    }

    this.logger.log(`Video client disconnected: ${client.id}`);
  }

  private getUserId(client: Socket): string {
    const userId = client.data?.userId as string | undefined;
    if (!userId) throw new UnauthorizedException('Not authenticated');
    return userId;
  }

  private getUserName(client: Socket): string {
    return (client.data?.userName as string) || 'User';
  }

  @SubscribeMessage('join-session')
  handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { sessionId: string; targetUserId?: string },
  ) {
    const userId = this.getUserId(client);
    const userName = this.getUserName(client);

    const session = this.videoService.joinSession(
      data.sessionId,
      userId,
      client.id,
      userName,
    );

    client.join(data.sessionId);

    const others = this.videoService.getOtherParticipants(
      data.sessionId,
      client.id,
    );

    for (const other of others) {
      this.server.to(other.socketId).emit('peer-joined', {
        userId,
        userName,
        sessionId: data.sessionId,
      });
    }

    return {
      success: true,
      sessionId: data.sessionId,
      participants: others.map((o) => ({
        userId: o.userId,
        userName: o.userName,
      })),
    };
  }

  @SubscribeMessage('leave-session')
  handleLeaveSession(@ConnectedSocket() client: Socket) {
    const userId = this.getUserId(client);
    const result = this.videoService.leaveSession(client.id);

    if (result) {
      client.leave(result.sessionId);

      const others = this.videoService.getOtherParticipants(
        result.sessionId,
        client.id,
      );
      for (const other of others) {
        this.server.to(other.socketId).emit('peer-left', {
          userId,
          sessionId: result.sessionId,
        });
      }
    }

    return { success: true };
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      targetUserId: string;
      sessionId: string;
      offer: RTCSessionDescriptionInit;
    },
  ) {
    const userId = this.getUserId(client);
    const targetSocketId = this.videoService.getSocketIdForUser(
      data.sessionId,
      data.targetUserId,
    );

    if (targetSocketId) {
      this.server.to(targetSocketId).emit('offer', {
        userId,
        sessionId: data.sessionId,
        offer: data.offer,
      });
    }

    return { success: true };
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      targetUserId: string;
      sessionId: string;
      answer: RTCSessionDescriptionInit;
    },
  ) {
    const userId = this.getUserId(client);
    const targetSocketId = this.videoService.getSocketIdForUser(
      data.sessionId,
      data.targetUserId,
    );

    if (targetSocketId) {
      this.server.to(targetSocketId).emit('answer', {
        userId,
        sessionId: data.sessionId,
        answer: data.answer,
      });
    }

    return { success: true };
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      targetUserId: string;
      sessionId: string;
      candidate: RTCIceCandidateInit;
    },
  ) {
    const userId = this.getUserId(client);
    const targetSocketId = this.videoService.getSocketIdForUser(
      data.sessionId,
      data.targetUserId,
    );

    if (targetSocketId) {
      this.server.to(targetSocketId).emit('ice-candidate', {
        userId,
        sessionId: data.sessionId,
        candidate: data.candidate,
      });
    }

    return { success: true };
  }

  @SubscribeMessage('session-ended')
  handleSessionEnded(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    const userId = this.getUserId(client);
    const others = this.videoService.getOtherParticipants(
      data.sessionId,
      client.id,
    );

    for (const other of others) {
      this.server.to(other.socketId).emit('session-ended', {
        userId,
        sessionId: data.sessionId,
      });
    }

    this.videoService.leaveSession(client.id);
    client.leave(data.sessionId);

    return { success: true };
  }

  @SubscribeMessage('toggle-audio')
  handleToggleAudio(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; isMuted: boolean },
  ) {
    const userId = this.getUserId(client);
    const others = this.videoService.getOtherParticipants(
      data.sessionId,
      client.id,
    );

    for (const other of others) {
      this.server.to(other.socketId).emit('audio-toggled', {
        userId,
        sessionId: data.sessionId,
        isMuted: data.isMuted,
      });
    }

    return { success: true };
  }

  @SubscribeMessage('toggle-video')
  handleToggleVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; isVideoOff: boolean },
  ) {
    const userId = this.getUserId(client);
    const others = this.videoService.getOtherParticipants(
      data.sessionId,
      client.id,
    );

    for (const other of others) {
      this.server.to(other.socketId).emit('video-toggled', {
        userId,
        sessionId: data.sessionId,
        isVideoOff: data.isVideoOff,
      });
    }

    return { success: true };
  }
}
