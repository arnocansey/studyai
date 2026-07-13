import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const XP_HISTORY = [
  { day: 'Mon', xp: 450 },
  { day: 'Tue', xp: 320 },
  { day: 'Wed', xp: 580 },
  { day: 'Thu', xp: 120 },
  { day: 'Fri', xp: 390 },
  { day: 'Sat', xp: 720 },
  { day: 'Sun', xp: 280 },
];

interface Props {
  colors: {
    card: string;
    border: string;
    text: string;
    textMuted: string;
    textSecondary: string;
    accent: string;
  };
}

export default function XpChart({ colors }: Props) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>XP This Week</Text>
      <View style={styles.xpChart}>
        {XP_HISTORY.map((day) => {
          const maxXP = Math.max(...XP_HISTORY.map((d) => d.xp));
          return (
            <View key={day.day} style={styles.xpBar}>
              <View style={[styles.xpBarFill, { height: `${(day.xp / maxXP) * 100}%`, backgroundColor: colors.accent }]} />
              <Text style={[styles.xpBarLabel, { color: colors.textMuted }]}>{day.day}</Text>
              <Text style={[styles.xpBarValue, { color: colors.textSecondary }]}>{day.xp}</Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.xpTotal, { color: colors.textSecondary }]}>Total: {XP_HISTORY.reduce((sum, d) => sum + d.xp, 0).toLocaleString()} XP this week</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  xpChart: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, marginTop: 16,
  },
  xpBar: { alignItems: 'center', flex: 1 },
  xpBarFill: {
    width: 28, borderRadius: 6, minHeight: 4, marginBottom: 6,
  },
  xpBarLabel: { fontSize: 11 },
  xpBarValue: { fontSize: 10, marginTop: 2 },
  xpTotal: { fontSize: 13, textAlign: 'center', marginTop: 12 },
});
