import { gamificationApi } from '../gamification';
import { api } from '../api';

jest.mock('../api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('Gamification API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getXpProgress calls GET /gamification/xp-progress', async () => {
    (api.get as jest.Mock).mockResolvedValue({ totalXp: 5000, level: 10, streak: 7 });

    const result = await gamificationApi.getXpProgress();

    expect(api.get).toHaveBeenCalledWith('/gamification/xp-progress');
    expect(result.totalXp).toBe(5000);
    expect(result.level).toBe(10);
  });

  it('checkIn calls POST /gamification/check-in', async () => {
    (api.post as jest.Mock).mockResolvedValue({ profile: {}, xpEarned: 50 });

    const result = await gamificationApi.checkIn();

    expect(api.post).toHaveBeenCalledWith('/gamification/check-in');
    expect(result.xpEarned).toBe(50);
  });

  it('getAchievements calls GET /gamification/achievements', async () => {
    (api.get as jest.Mock).mockResolvedValue([
      { id: '1', title: 'First Steps', description: 'Complete first lesson', icon: '🎯' },
    ]);

    const result = await gamificationApi.getAchievements();

    expect(api.get).toHaveBeenCalledWith('/gamification/achievements');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('First Steps');
  });

  it('getLeaderboard calls GET with query params', async () => {
    (api.get as jest.Mock).mockResolvedValue([
      { rank: 1, userId: 'u1', name: 'Alice', xp: 10000 },
    ]);

    const result = await gamificationApi.getLeaderboard(5, 'streak');

    expect(api.get).toHaveBeenCalledWith('/gamification/leaderboard?limit=5&type=streak');
    expect(result).toHaveLength(1);
  });

  it('startStudySession calls POST /gamification/study-session/start', async () => {
    (api.post as jest.Mock).mockResolvedValue({ sessionId: 'sess_123' });

    const result = await gamificationApi.startStudySession();

    expect(api.post).toHaveBeenCalledWith('/gamification/study-session/start');
    expect(result.sessionId).toBe('sess_123');
  });

  it('endStudySession calls POST with session ID', async () => {
    (api.post as jest.Mock).mockResolvedValue({ success: true });

    await gamificationApi.endStudySession('sess_123', 100);

    expect(api.post).toHaveBeenCalledWith('/gamification/study-session/sess_123/end', { xpEarned: 100 });
  });
});
