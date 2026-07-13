import { Injectable, Logger } from '@nestjs/common';

export interface VideoParticipant {
  userId: string;
  socketId: string;
  userName: string;
  isMuted: boolean;
  isVideoOff: boolean;
}

export interface VideoSession {
  id: string;
  participants: Map<string, VideoParticipant>;
  createdAt: Date;
}

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  private sessions: Map<string, VideoSession> = new Map();
  private socketToSession: Map<string, string> = new Map();

  createSession(sessionId: string): VideoSession {
    const session: VideoSession = {
      id: sessionId,
      participants: new Map(),
      createdAt: new Date(),
    };
    this.sessions.set(sessionId, session);
    this.logger.log(`Session created: ${sessionId}`);
    return session;
  }

  getSession(sessionId: string): VideoSession | undefined {
    return this.sessions.get(sessionId);
  }

  joinSession(
    sessionId: string,
    userId: string,
    socketId: string,
    userName: string,
  ): VideoSession {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = this.createSession(sessionId);
    }

    session.participants.set(userId, {
      userId,
      socketId,
      userName,
      isMuted: false,
      isVideoOff: false,
    });

    this.socketToSession.set(socketId, sessionId);
    this.logger.log(`User ${userId} joined session ${sessionId}`);
    return session;
  }

  leaveSession(socketId: string): { sessionId: string; userId: string } | null {
    const sessionId = this.socketToSession.get(socketId);
    if (!sessionId) return null;

    const session = this.sessions.get(sessionId);
    if (!session) return null;

    let userId: string | null = null;
    for (const [uid, participant] of session.participants) {
      if (participant.socketId === socketId) {
        userId = uid;
        break;
      }
    }

    if (userId) {
      session.participants.delete(userId);
      this.logger.log(`User ${userId} left session ${sessionId}`);
    }

    this.socketToSession.delete(socketId);

    if (session.participants.size === 0) {
      this.sessions.delete(sessionId);
      this.logger.log(`Session ${sessionId} cleaned up (empty)`);
    }

    return sessionId && userId ? { sessionId, userId } : null;
  }

  getParticipantBySocket(socketId: string): VideoParticipant | null {
    const sessionId = this.socketToSession.get(socketId);
    if (!sessionId) return null;

    const session = this.sessions.get(sessionId);
    if (!session) return null;

    for (const participant of session.participants.values()) {
      if (participant.socketId === socketId) return participant;
    }
    return null;
  }

  getOtherParticipants(
    sessionId: string,
    excludeSocketId: string,
  ): VideoParticipant[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    const others: VideoParticipant[] = [];
    for (const participant of session.participants.values()) {
      if (participant.socketId !== excludeSocketId) {
        others.push(participant);
      }
    }
    return others;
  }

  getSocketIdForUser(sessionId: string, userId: string): string | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    return session.participants.get(userId)?.socketId ?? null;
  }
}
