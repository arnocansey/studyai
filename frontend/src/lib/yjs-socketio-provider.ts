import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';

export interface SocketIOProviderEvents {
  connect: () => void;
  disconnect: () => void;
  'collaborative:user-joined': (data: { userId: string; userName: string; users: any[] }) => void;
  'collaborative:user-left': (data: { userId: string; users: any[] }) => void;
  'awareness:update': (data: { userId: string; state: any }) => void;
}

export class SocketIOProvider {
  public doc: Y.Doc;
  public socket: Socket;
  public awareness: Map<string, any> = new Map();
  public connectedUsers: any[] = [];

  private docName: string;
  private updateHandler: (update: Uint8Array, origin: any) => void;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(docName: string, url: string, token?: string) {
    this.doc = new Y.Doc();
    this.docName = docName;

    this.socket = io(`${url}/collaborative`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.updateHandler = (update: Uint8Array, origin: any) => {
      if (origin !== 'remote') {
        this.socket.emit('doc:update', {
          docName: this.docName,
          update: Array.from(update),
        });
      }
    };

    this.doc.on('update', this.updateHandler);

    this.socket.on('connect', () => {
      this.socket.emit('doc:join', { docName: this.docName });
      this.emit('connect');
    });

    this.socket.on('disconnect', () => {
      this.emit('disconnect');
    });

    this.socket.on('doc:initial-state', (data: { state: number[]; stateVector: number[]; users: any[] }) => {
      const update = new Uint8Array(data.state);
      Y.applyUpdate(this.doc, update, 'remote');
      this.connectedUsers = data.users;
      this.emit('users-updated', this.connectedUsers);
    });

    this.socket.on('doc:update', (data: { update: number[]; userId: string }) => {
      const update = new Uint8Array(data.update);
      Y.applyUpdate(this.doc, update, 'remote');
    });

    this.socket.on('doc:sync-response', (data: { state: number[] }) => {
      const update = new Uint8Array(data.state);
      Y.applyUpdate(this.doc, update, 'remote');
    });

    this.socket.on('collaborative:user-joined', (data: { userId: string; userName: string; users: any[] }) => {
      this.connectedUsers = data.users;
      this.emit('users-updated', this.connectedUsers);
    });

    this.socket.on('collaborative:user-left', (data: { userId: string; users: any[] }) => {
      this.connectedUsers = data.users;
      this.emit('users-updated', this.connectedUsers);
    });

    this.socket.on('awareness:update', (data: { userId: string; state: any }) => {
      this.awareness.set(data.userId, data.state);
      this.emit('awareness-updated', this.awareness);
    });
  }

  sendUpdate(update: Uint8Array) {
    this.socket.emit('doc:update', {
      docName: this.docName,
      update: Array.from(update),
    });
  }

  sendAwareness(state: any) {
    this.socket.emit('awareness:update', {
      docName: this.docName,
      state,
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(...args));
    }
  }

  getConnectedUsers() {
    return this.connectedUsers;
  }

  getAwareness() {
    return this.awareness;
  }

  disconnect() {
    this.socket.emit('doc:leave', { docName: this.docName });
    this.doc.off('update', this.updateHandler);
    this.socket.disconnect();
  }

  destroy() {
    this.disconnect();
    this.doc.destroy();
  }
}
