import Constants from 'expo-constants';
import { io, Socket } from 'socket.io-client';
import { loadAuthToken } from './api';

const EXTRA = Constants.expoConfig?.extra || {};
const WS_URL = EXTRA.wsBase || process.env.EXPO_PUBLIC_WS_BASE || 'http://10.10.6.33:4000';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  room: string;
  timestamp: string;
  reactions?: { emoji: string; users: string[] }[];
  replyTo?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: string;
  members: string[];
}

class ChatService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  async connect() {
    const token = await loadAuthToken();
    this.socket = io(`${WS_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('[Chat] Connected');
    });

    this.socket.on('message:new', (msg: ChatMessage) => {
      this.emit('message:new', msg);
    });

    this.socket.on('message:updated', (msg: ChatMessage) => {
      this.emit('message:updated', msg);
    });

    this.socket.on('typing:update', (data: { room: string; users: string[] }) => {
      this.emit('typing:update', data);
    });

    this.socket.on('room:created', (room: ChatRoom) => {
      this.emit('room:created', room);
    });

    this.socket.on('user:online', (data: any) => {
      this.emit('user:online', data);
    });

    this.socket.on('user:offline', (data: any) => {
      this.emit('user:offline', data);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  sendMessage(content: string, room: string, replyTo?: string) {
    this.socket?.emit('message:send', { content, room, replyTo });
  }

  sendReaction(messageId: string, room: string, emoji: string) {
    this.socket?.emit('message:react', { messageId, room, emoji });
  }

  requestHistory(room: string, limit = 50) {
    this.socket?.emit('message:history', { room, limit });
    return new Promise<ChatMessage[]>((resolve) => {
      const handler = (data: { messages: ChatMessage[] }) => {
        resolve(data.messages);
        this.socket?.off('message:history', handler);
      };
      this.socket?.on('message:history', handler);
    });
  }

  startTyping(room: string) {
    this.socket?.emit('typing:start', { room });
  }

  stopTyping(room: string) {
    this.socket?.emit('typing:stop', { room });
  }

  joinRoom(roomId: string) {
    this.socket?.emit('room:join', { roomId });
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('room:leave', { roomId });
  }

  createRoom(name: string, type: string, members?: string[]) {
    this.socket?.emit('room:create', { name, type, members });
  }

  listRooms() {
    this.socket?.emit('room:list');
    return new Promise<ChatRoom[]>((resolve) => {
      const handler = (data: { rooms: ChatRoom[] }) => {
        resolve(data.rooms);
        this.socket?.off('room:list', handler);
      };
      this.socket?.on('room:list', handler);
    });
  }
}

export const chatService = new ChatService();
