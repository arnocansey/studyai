import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  isCurrentUser?: boolean;
}

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Sarah Chen', xp: 28400, avatar: '👩‍💻' },
  { rank: 2, name: 'Marcus Lee', xp: 25100, avatar: '👨‍🎓' },
  { rank: 3, name: 'Emily Park', xp: 22800, avatar: '👩‍🔬' },
  { rank: 4, name: 'You', xp: 12500, avatar: '🧑‍💻', isCurrentUser: true },
  { rank: 5, name: 'David Kim', xp: 11200, avatar: '👨‍💼' },
  { rank: 6, name: 'Lisa Wang', xp: 9800, avatar: '👩‍🎨' },
];

interface Props {
  colors: {
    card: string;
    border: string;
    text: string;
    textMuted: string;
    textSecondary: string;
    accent: string;
    accentLight: string;
  };
}

export default function LeaderboardView({ colors }: Props) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Leaderboard</Text>
      {LEADERBOARD.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 30 }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🏆</Text>
          <Text style={{ fontSize: 15, color: colors.textMuted }}>No leaderboard data yet</Text>
        </View>
      ) : (
        LEADERBOARD.map((entry) => (
          <View
            key={entry.rank}
            style={[styles.lbRow, entry.isCurrentUser && { backgroundColor: colors.accent + '10' }, { borderBottomColor: colors.border }]}
          >
            <Text style={[styles.lbRank, entry.rank <= 3 && styles.lbRankTop, { color: colors.textMuted }]}>
              {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
            </Text>
            <Text style={styles.lbAvatar}>{entry.avatar}</Text>
            <View style={styles.lbInfo}>
              <Text style={[styles.lbName, { color: colors.text }, entry.isCurrentUser && { color: colors.accentLight }]}>
                {entry.name}
              </Text>
              <Text style={[styles.lbXP, { color: colors.textMuted }]}>{entry.xp.toLocaleString()} XP</Text>
            </View>
            {entry.isCurrentUser && <View style={[styles.lbYouBadge, { backgroundColor: colors.accent }]}><Text style={styles.lbYouText}>YOU</Text></View>}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  lbRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, minHeight: 52,
  },
  lbRank: { width: 36, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  lbRankTop: { fontSize: 20 },
  lbAvatar: { fontSize: 28, marginRight: 12 },
  lbInfo: { flex: 1 },
  lbName: { fontSize: 15, fontWeight: '600' },
  lbXP: { fontSize: 12, marginTop: 2 },
  lbYouBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  lbYouText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});
