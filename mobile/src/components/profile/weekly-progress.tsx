import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WeeklyProgressProps {
  colors: any;
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const HOURS = [2.5, 1.8, 3.2, 0.5, 2.1, 3.8, 1.2];

export default function WeeklyProgress({ colors }: WeeklyProgressProps) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week</Text>
      <View style={styles.progressGrid}>
        {DAYS.map((day, i) => (
          <View key={`${day}-${i}`} style={styles.progressDay}>
            <View style={[styles.progressBar, { height: `${(HOURS[i] / 4) * 80}%`, backgroundColor: colors.accent }]} />
            <Text style={[styles.progressDayLabel, { color: colors.textMuted }]}>{day}</Text>
            <Text style={[styles.progressDayHours, { color: colors.textSecondary }]}>{HOURS[i]}h</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  progressGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 80 },
  progressDay: { alignItems: 'center', flex: 1 },
  progressBar: { width: 20, borderRadius: 5, minHeight: 4, marginBottom: 6 },
  progressDayLabel: { fontSize: 10 },
  progressDayHours: { fontSize: 10, marginTop: 2 },
});
