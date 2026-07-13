import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { gamificationApi } from '../services/gamification';
import { cache } from '../services/cache';
import { FadeInView } from '../components/animations';
import { SkeletonList } from '../components/Skeleton';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'networking' | 'cybersecurity' | 'quiz' | 'cloud';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  timeEstimate: string;
  participants: number;
  completed: boolean;
}

const TYPE_FILTERS = ['all', 'coding', 'networking', 'cybersecurity', 'quiz', 'cloud'] as const;
const TYPE_COLORS: Record<string, string> = {
  coding: '#3B82F6', networking: '#10B981', cybersecurity: '#EF4444', quiz: '#F59E0B', cloud: '#8B5CF6',
};
const DIFFICULTY_COLORS = { easy: '#10B981', medium: '#F59E0B', hard: '#EF4444' };

const CATEGORY_MAP: Record<string, Challenge['type']> = {
  coding: 'coding', algorithms: 'coding', datastructures: 'coding',
  networking: 'networking', security: 'cybersecurity', cybersecurity: 'cybersecurity',
  quiz: 'quiz', trivia: 'quiz', cloud: 'cloud', devops: 'cloud',
};

const mapAchievementToChallenge = (a: any): Challenge => {
  const category = CATEGORY_MAP[a.category] || 'quiz';
  const difficulty = a.rarity === 'legendary' || a.rarity === 'epic' ? 'hard' : a.rarity === 'rare' ? 'medium' : 'easy';
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    type: category,
    difficulty,
    xpReward: a.xpReward || 100,
    timeEstimate: difficulty === 'hard' ? '45 min' : difficulty === 'medium' ? '20 min' : '10 min',
    participants: 0,
    completed: a.unlocked || false,
  };
};

const CACHE_KEY = 'challenges_data';

export function ChallengesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<string>('all');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const cached = await cache.get<Challenge[]>(CACHE_KEY);
      if (cached && !isRefresh) {
        setChallenges(cached);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const achievements = await gamificationApi.getAchievements();
      if (achievements && achievements.length > 0) {
        const mapped = achievements.map(mapAchievementToChallenge);
        setChallenges(mapped);
        await cache.set(CACHE_KEY, mapped);
      } else {
        setChallenges([]);
      }
    } catch {
      const cached = await cache.get<Challenge[]>(CACHE_KEY);
      if (cached) {
        setChallenges(cached);
      } else {
        setError('Unable to load challenges. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const filtered = filter === 'all' ? challenges : challenges.filter((c) => c.type === filter);
  const completedCount = challenges.filter((c) => c.completed).length;
  const totalXP = challenges.filter((c) => c.completed).reduce((sum, c) => sum + c.xpReward, 0);

  const handleStart = async (challenge: Challenge) => {
    if (challenge.completed) {
      Alert.alert('Already Completed', `You already completed "${challenge.title}". +${challenge.xpReward} XP earned!`);
      return;
    }

    setActiveChallengeId(challenge.id);

    try {
      const result = await gamificationApi.startStudySession();
      if (result?.sessionId) {
        Alert.alert(
          'Challenge Started',
          `${challenge.title}\n\nSession active! Earn +${challenge.xpReward} XP when you complete this challenge.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Challenge Started',
          `${challenge.title}\n\nGood luck! Estimated time: ${challenge.timeEstimate}`,
          [{ text: 'OK' }]
        );
      }
    } catch {
      Alert.alert(
        'Could Not Start',
        'Unable to start the challenge. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setActiveChallengeId(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchChallenges(true)} tintColor={colors.accent} colors={[colors.accent]} />}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>Challenges</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{completedCount}/{challenges.length}</Text>
              <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>Done</Text>
            </View>
            <View style={{ width: 1, height: 24, backgroundColor: colors.border, marginHorizontal: 12 }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{totalXP}</Text>
              <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>XP Earned</Text>
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 14, marginHorizontal: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>Overall Progress</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.accent }}>{Math.round((completedCount / challenges.length) * 100)}%</Text>
          </View>
          <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: colors.accent, borderRadius: 3, width: `${(completedCount / challenges.length) * 100}%` }} />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginTop: 14, marginBottom: 8 }}>
          {TYPE_FILTERS.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type)}
              style={[{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.card, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: colors.border, minHeight: 40, justifyContent: 'center' }, filter === type && { backgroundColor: colors.accent, borderColor: colors.accent }]}
              accessibilityLabel={`Filter by ${type === 'all' ? 'all categories' : type}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: filter === type }}
            >
              <Text style={[{ fontSize: 13, fontWeight: '600', color: colors.textMuted }, filter === type && { color: colors.text }]}>
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <SkeletonList count={3} />
        ) : error ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
            <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 6 }}>Something went wrong</Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 40 }}>{error}</Text>
            <TouchableOpacity onPress={() => fetchChallenges(true)} style={{ marginTop: 16, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.accent, borderRadius: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : challenges.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🎯</Text>
            <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 6 }}>No challenges available yet</Text>
            <Text style={{ fontSize: 14, color: colors.textMuted }}>Check back later for new challenges</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🎯</Text>
            <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 6 }}>No challenges found</Text>
            <Text style={{ fontSize: 14, color: colors.textMuted }}>Try a different filter</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            {filtered.map((challenge, i) => (
              <FadeInView key={challenge.id} delay={i * 60}>
                <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 18, marginTop: 12, borderWidth: 1, borderColor: colors.border }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: TYPE_COLORS[challenge.type] + '20' }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: TYPE_COLORS[challenge.type] }}>
                        {challenge.type}
                      </Text>
                    </View>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: DIFFICULTY_COLORS[challenge.difficulty] + '20' }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: DIFFICULTY_COLORS[challenge.difficulty] }}>
                        {challenge.difficulty}
                      </Text>
                    </View>
                    {challenge.completed && <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '600', marginLeft: 'auto' }}>✓ Done</Text>}
                  </View>

                  <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 6 }}>{challenge.title}</Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }} numberOfLines={2}>{challenge.description}</Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <View style={{ flexDirection: 'row', gap: 14 }}>
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>⏱ {challenge.timeEstimate}</Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>👥 {challenge.participants}</Text>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#A78BFA' }}>+{challenge.xpReward} XP</Text>
                  </View>

                  <TouchableOpacity
                    style={[{ marginTop: 14, paddingVertical: 14, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', minHeight: 48, justifyContent: 'center' }, challenge.completed && { backgroundColor: colors.border }]}
                    onPress={() => handleStart(challenge)}
                    disabled={activeChallengeId === challenge.id}
                    accessibilityLabel={challenge.completed ? `View solution for ${challenge.title}` : `Start ${challenge.title} challenge`}
                    accessibilityRole="button"
                  >
                    {activeChallengeId === challenge.id ? (
                      <ActivityIndicator size="small" color={colors.text} />
                    ) : (
                      <Text style={[{ fontSize: 14, fontWeight: '700', color: colors.text }, challenge.completed && { color: colors.textMuted }]}>
                        {challenge.completed ? 'View Solution' : 'Start Challenge'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </FadeInView>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
