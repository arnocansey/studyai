import { Injectable, Logger } from '@nestjs/common';
import * as Y from 'yjs';

interface DocumentState {
  docName: string;
  ydoc: Y.Doc;
  stateVector: Uint8Array | null;
  lastUpdate: Uint8Array | null;
}

export interface ConnectedUser {
  socketId: string;
  userId: string;
  userName: string;
  color: string;
  joinedAt: Date;
}

@Injectable()
export class CollaborativeService {
  private readonly logger = new Logger(CollaborativeService.name);
  private documents: Map<string, DocumentState> = new Map();
  private documentUsers: Map<string, ConnectedUser[]> = new Map();

  private readonly userColors = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
    '#F43F5E', '#14B8A6', '#6366F1', '#A855F7',
  ];

  getOrCreateDocument(docName: string): DocumentState {
    if (!this.documents.has(docName)) {
      const ydoc = new Y.Doc();
      this.documents.set(docName, {
        docName,
        ydoc,
        stateVector: null,
        lastUpdate: null,
      });
      this.documentUsers.set(docName, []);
      this.logger.log(`Created document: ${docName}`);
    }
    return this.documents.get(docName)!;
  }

  applyUpdate(docName: string, update: Uint8Array): void {
    const doc = this.getOrCreateDocument(docName);
    try {
      Y.applyUpdate(doc.ydoc, update);
      doc.lastUpdate = update;
      doc.stateVector = Y.encodeStateVector(doc.ydoc);
    } catch (err) {
      this.logger.error(`Failed to apply update to ${docName}: ${err}`);
    }
  }

  getStateAsUpdate(docName: string, stateVector?: Uint8Array): Uint8Array {
    const doc = this.getOrCreateDocument(docName);
    if (stateVector) {
      return Y.encodeStateAsUpdate(doc.ydoc, stateVector);
    }
    return Y.encodeStateAsUpdate(doc.ydoc);
  }

  getStateVector(docName: string): Uint8Array {
    const doc = this.getOrCreateDocument(docName);
    return Y.encodeStateVector(doc.ydoc);
  }

  addUser(docName: string, user: ConnectedUser): void {
    this.getOrCreateDocument(docName);
    const users = this.documentUsers.get(docName) || [];
    const existing = users.findIndex((u) => u.userId === user.userId);
    if (existing >= 0) {
      users[existing] = user;
    } else {
      users.push(user);
    }
    this.documentUsers.set(docName, users);
    this.logger.log(`User ${user.userId} joined document ${docName}`);
  }

  removeUser(docName: string, socketId: string): ConnectedUser | null {
    const users = this.documentUsers.get(docName) || [];
    const idx = users.findIndex((u) => u.socketId === socketId);
    if (idx >= 0) {
      const removed = users.splice(idx, 1)[0];
      this.documentUsers.set(docName, users);
      this.logger.log(`User ${removed.userId} left document ${docName}`);
      return removed;
    }
    return null;
  }

  getUsers(docName: string): ConnectedUser[] {
    return this.documentUsers.get(docName) || [];
  }

  removeUserFromAllDocuments(socketId: string): { docName: string; user: ConnectedUser }[] {
    const removed: { docName: string; user: ConnectedUser }[] = [];
    for (const [docName] of this.documentUsers) {
      const user = this.removeUser(docName, socketId);
      if (user) {
        removed.push({ docName, user });
      }
    }
    return removed;
  }

  destroyDocument(docName: string): void {
    const doc = this.documents.get(docName);
    if (doc) {
      doc.ydoc.destroy();
      this.documents.delete(docName);
      this.documentUsers.delete(docName);
      this.logger.log(`Destroyed document: ${docName}`);
    }
  }
}
