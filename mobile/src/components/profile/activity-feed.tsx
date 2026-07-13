import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ActivityFeedProps {
  colors: any;
}

const ACTIVITIES = [
  { icon: '🏆', text: 'Earned "Python Master" badge', time: '2h ago' },
  { icon: '📚', text: 'Completed "Advanced Decorators" lesson', time: '5h ago' },
  { icon: '🎯', text: 'Scored 95% on Networking Quiz', time: '1d ago' },
  { icon: '🔥', text: '15-day streak achieved!', time: '2d ago' },
];

export default function ActivityFeed({ colors }: ActivityFeedProps) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
      {ACTIVITIES.map((activity, i) => (
        <View key={i} style={[styles.activityItem, { borderBottomColor: colors.border }]}>
          <Text style={styles.activityIcon}>{activity.icon}</Text>
          <View style={styles.activityInfo}>
            <Text style={[styles.activityText, { color: colors.textSecondary }]}>{activity.text}</Text>
            <Text style={[styles.activityTime, { color: colors.textMuted }]}>{activity.time}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  activityIcon: { fontSize: 20, marginRight: 12 },
  activityInfo: { flex: 1 },
  activityText: { fontSize: 14 },
  activityTime: { fontSize: 12, marginTop: 2 },
});
