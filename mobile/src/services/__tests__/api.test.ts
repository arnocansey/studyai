jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        apiBase: 'http://localhost:4000',
        wsBase: 'http://localhost:4000',
      },
    },
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../offline', () => ({
  isOnline: jest.fn().mockResolvedValue(true),
  addToSyncQueue: jest.fn().mockResolvedValue({ id: '1', method: 'POST', path: '', timestamp: Date.now(), retryCount: 0 }),
  getOfflineData: jest.fn().mockResolvedValue(null),
  saveOfflineData: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../cache', () => ({
  cache: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    getKeys: jest.fn().mockResolvedValue([]),
    getSize: jest.fn().mockResolvedValue(0),
  },
}));

const mockFetch = jest.fn().mockResolvedValue({
  ok: true,
  text: () => Promise.resolve('{}'),
});
(globalThis as any).fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
  mockFetch.mockResolvedValue({
    ok: true,
    text: () => Promise.resolve('{}'),
  });
});

import { api, setAuthToken, loadAuthToken } from '../api';
import * as SecureStore from 'expo-secure-store';

describe('setAuthToken', () => {
  it('stores token', async () => {
    await setAuthToken('tok123');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'tok123');
  });

  it('removes token when null', async () => {
    await setAuthToken(null);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
  });
});

describe('loadAuthToken', () => {
  it('returns stored token', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('saved');
    const token = await loadAuthToken();
    expect(token).toBe('saved');
  });
});

describe('api.get', () => {
  it('makes GET request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('{"data":"ok"}'),
    });

    const result = await api.get('/test');
    expect(result).toEqual({ data: 'ok' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('api.post', () => {
  it('makes POST request with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('{"id":"1"}'),
    });

    await api.post('/items', { name: 'new' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const call = mockFetch.mock.calls[0];
    expect(call[0]).toBe('http://localhost:4000/items');
    expect(call[1].method).toBe('POST');
    expect(call[1].body).toBe('{"name":"new"}');
  });
});

describe('api.delete', () => {
  it('makes DELETE request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(''),
    });

    await api.delete('/items/1');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const call = mockFetch.mock.calls[0];
    expect(call[0]).toBe('http://localhost:4000/items/1');
    expect(call[1].method).toBe('DELETE');
  });
});

describe('error handling', () => {
  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve('{"message":"Unauthorized"}'),
    });

    await expect(api.get('/fail')).rejects.toThrow('Unauthorized');
  });
});
