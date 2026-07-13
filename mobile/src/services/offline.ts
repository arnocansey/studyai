import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_PREFIX = 'studyai_offline_';
const SYNC_QUEUE_KEY = 'studyai_sync_queue';
const CONNECTIVITY_URL = 'https://clients3.google.com/generate_204';

export interface SyncOperation {
  id: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: any;
  timestamp: number;
  retryCount: number;
}

const MAX_RETRIES = 3;

export async function isOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(CONNECTIVITY_URL, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.status === 204;
  } catch {
    return false;
  }
}

export async function getOfflineData<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function saveOfflineData<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(OFFLINE_PREFIX + key, JSON.stringify(data));
  } catch {}
}

async function getSyncQueue(): Promise<SyncOperation[]> {
  try {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SyncOperation[];
  } catch {
    return [];
  }
}

async function saveSyncQueue(queue: SyncOperation[]): Promise<void> {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export async function addToSyncQueue(
  op: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>,
): Promise<SyncOperation> {
  const queue = await getSyncQueue();
  const operation: SyncOperation = {
    ...op,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
    retryCount: 0,
  };
  queue.push(operation);
  await saveSyncQueue(queue);
  return operation;
}

export async function processSyncQueue(
  fetchFn: (
    method: string,
    path: string,
    body?: any,
  ) => Promise<any>,
): Promise<{ processed: number; failed: number }> {
  const queue = await getSyncQueue();
  if (queue.length === 0) return { processed: 0, failed: 0 };

  const remaining: SyncOperation[] = [];
  let processed = 0;
  let failed = 0;

  for (const op of queue) {
    try {
      await fetchFn(op.method, op.path, op.body);
      processed++;
    } catch {
      op.retryCount++;
      if (op.retryCount < MAX_RETRIES) {
        remaining.push(op);
      } else {
        failed++;
      }
    }
  }

  await saveSyncQueue(remaining);
  return { processed, failed };
}

export async function getPendingCount(): Promise<number> {
  const queue = await getSyncQueue();
  return queue.length;
}

export async function clearSyncQueue(): Promise<void> {
  await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
}

let onStatusChangeCallback: ((online: boolean) => void) | null = null;
let previousOnline: boolean | null = null;

function setOnStatusChange(cb: (online: boolean) => void) {
  onStatusChangeCallback = cb;
}

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef<((online: boolean) => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const status = await isOnline();
      if (!mounted) return;
      setOnline((prev) => {
        if (prev !== status && onStatusChangeCallback) {
          onStatusChangeCallback(status);
        }
        return status;
      });
    };

    check();
    intervalRef.current = setInterval(check, 10000);

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return online;
}

export { setOnStatusChange };
