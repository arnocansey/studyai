import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import LeaderboardView from '../components/gamification/leaderboard-view';
import AchievementsView from '../components/gamification/achievements-view';
import LeaguesView from '../components/gamification/leagues-view';
import XpChart from '../components/gamification/xp-chart';

interface League {
  name: string;
  color: string;
  minXP: number;
  icon: string;
  members: number;
}

const LEAGUES: League[] = [
  { name: 'Diamond', color: '#B9F2FF', minXP: 50000, icon: '💎', members: 12 },
  { name: 'Platinum', color: '#E5E4E2', minXP: 30000, icon: '🏆', members: 45 },
  { name: 'Gold', color: '#FFD700', minXP: 15000, icon: '🥇', members: 128 },
  { name: 'Silver', color: '#C0C0C0', minXP: 5000, icon: '🥈', members: 340 },
  { name: 'Bronze', color: '#CD7F32', minXP: 0, icon: '🥉', members: 890 },
];

export function GamificationScreen() {
  const { colors } = useTheme();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'achievements' | 'leagues'>('leaderboard');

  const userXP = user.xp || 12500;

  const currentLeague = LEAGUES.find((l) => userXP >= l.minXP) || LEAGUES[LEAGUES.length - 1];
  const nextLeague = LEAGUES[LEAGUES.indexOf(currentLeague) - 1];
  const progressToNext = nextLeague
    ? ((userXP - currentLeague.minXP) / (nextLeague.minXP - currentLeague.minXP)) * 100
    : 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Gamification</Text>
          <View style={[styles.xpBadge, { backgroundColor: colors.accent + '20' }]}>
            <Text style={[styles.xpBadgeText, { color: colors.accentLight }]}>⚡ {userXP.toLocaleString()} XP</Text>
          </View>
        </View>

        <View style={[styles.leagueCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.leagueHeader}>
            <Text style={styles.leagueIcon}>{currentLeague.icon}</Text>
            <View style={styles.leagueInfo}>
              <Text style={[styles.leagueName, { color: currentLeague.color }]}>{currentLeague.name} League</Text>
              {nextLeague && (
                <Text style={[styles.leagueNext, { color: colors.textMuted }]}>
                  {(nextLeague.minXP - userXP).toLocaleString()} XP to {nextLeague.name}
                </Text>
              )}
            </View>
          </View>
          <View style={[styles.leagueBarBg, { backgroundColor: colors.border }]}>
            <View style={[styles.leagueBarFill, { width: `${Math.min(progressToNext, 100)}%`, backgroundColor: colors.accent }]} />
          </View>
        </View>

        <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
          {(['leaderboard', 'achievements', 'leagues'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && { backgroundColor: colors.accent }]}
              accessibilityLabel={`Show ${tab === 'achievements' ? 'badges' : tab}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab }}
            >
              <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === tab && { color: colors.text }]}>
                {tab === 'leaderboard' ? 'Leaderboard' : tab === 'achievements' ? 'Badges' : 'Leagues'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <XpChart colors={colors} />

        {activeTab === 'leaderboard' && <LeaderboardView colors={colors} />}
        {activeTab === 'achievements' && <AchievementsView colors={colors} />}
        {activeTab === 'leagues' && <LeaguesView colors={colors} currentLeagueName={currentLeague.name} />}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15,
  },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  xpBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  xpBadgeText: { fontSize: 14, fontWeight: '700' },
  leagueCard: {
    borderRadius: 16, marginHorizontal: 16, padding: 18, borderWidth: 1,
  },
  leagueHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  leagueIcon: { fontSize: 36, marginRight: 14 },
  leagueInfo: { flex: 1 },
  leagueName: { fontSize: 18, fontWeight: '700' },
  leagueNext: { fontSize: 13, marginTop: 2 },
  leagueBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  leagueBarFill: { height: '100%', borderRadius: 4 },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 16,
    borderRadius: 12, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, minHeight: 44, justifyContent: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
});
