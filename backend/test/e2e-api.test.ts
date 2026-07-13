const API_BASE = process.env.API_URL || 'http://localhost:3000';

async function api(method: string, path: string, body?: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = text; }

  return { status: res.status, data };
}

describe('Auth API E2E', () => {
  const testEmail = `test_${Date.now()}@e2e.com`;
  const testPassword = 'TestPass123!';
  let authToken: string;

  it('POST /auth/register creates a new user', async () => {
    const res = await api('POST', '/auth/register', {
      email: testEmail,
      name: 'E2E Test User',
      password: testPassword,
    });
    expect(res.status).toBe(201);
    expect(res.data.access_token).toBeDefined();
    authToken = res.data.access_token;
  });

  it('POST /auth/login authenticates user', async () => {
    const res = await api('POST', '/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    expect(res.status).toBe(200);
    expect(res.data.access_token).toBeDefined();
    authToken = res.data.access_token;
  });

  it('GET /auth/me returns user profile', async () => {
    const res = await api('GET', '/auth/me', undefined, authToken);
    expect(res.status).toBe(200);
    expect(res.data.email).toBe(testEmail);
  });

  it('GET /auth/me fails without token', async () => {
    const res = await api('GET', '/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('Courses API E2E', () => {
  it('GET /courses returns course list', async () => {
    const res = await api('GET', '/courses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});

describe('Gamification API E2E', () => {
  let authToken: string;

  beforeAll(async () => {
    const res = await api('POST', '/auth/login', {
      email: 'student@studyai.io',
      password: 'password123',
    });
    if (res.status === 200) authToken = res.data.access_token;
  });

  it('GET /gamification/leaderboard returns entries', async () => {
    const res = await api('GET', '/gamification/leaderboard?limit=5');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('GET /gamification/achievements returns list', async () => {
    const res = await api('GET', '/gamification/achievements', undefined, authToken);
    expect(res.status).toBe(200);
  });
});

describe('Study Groups API E2E', () => {
  it('GET /study-groups returns groups', async () => {
    const res = await api('GET', '/study-groups');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});

describe('Discussions API E2E', () => {
  it('GET /discussions returns list', async () => {
    const res = await api('GET', '/discussions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});

describe('AI API E2E', () => {
  it('POST /ai/explain returns explanation', async () => {
    const res = await api('POST', '/ai/explain', {
      prompt: 'What is a variable in programming?',
    });
    expect(res.status).toBe(200);
  });

  it('POST /ai/hint returns hint', async () => {
    const res = await api('POST', '/ai/hint', {
      question: 'How do I reverse a string in Python?',
      difficulty: 'easy',
    });
    expect(res.status).toBe(200);
  });
});
