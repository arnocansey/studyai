import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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

interface Props {
  colors: {
    card: string;
    border: string;
    text: string;
    textMuted: string;
    accent: string;
  };
  currentLeagueName: string;
}

export default function LeaguesView({ colors, currentLeagueName }: Props) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>League Rankings</Text>
      {LEAGUES.map((league) => {
        const isActive = league.name === currentLeagueName;
        return (
          <View key={league.name} style={[styles.leagueRow, isActive && { backgroundColor: colors.accent + '10' }, { borderBottomColor: colors.border }]}>
            <Text style={styles.leagueRowIcon}>{league.icon}</Text>
            <View style={styles.leagueRowInfo}>
              <Text style={[styles.leagueRowName, { color: colors.text }]}>{league.name}</Text>
              <Text style={[styles.leagueRowReq, { color: colors.textMuted }]}>{league.minXP.toLocaleString()}+ XP required</Text>
            </View>
            <View style={styles.leagueRowRight}>
              <Text style={[styles.leagueRowMembers, { color: colors.textMuted }]}>{league.members} members</Text>
              {isActive && <View style={[styles.currentBadge, { backgroundColor: colors.accent }]}><Text style={styles.currentBadgeText}>CURRENT</Text></View>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  leagueRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, minHeight: 60,
  },
  leagueRowIcon: { fontSize: 32, marginRight: 14 },
  leagueRowInfo: { flex: 1 },
  leagueRowName: { fontSize: 16, fontWeight: '700' },
  leagueRowReq: { fontSize: 12, marginTop: 2 },
  leagueRowRight: { alignItems: 'flex-end' },
  leagueRowMembers: { fontSize: 12 },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  currentBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
});
