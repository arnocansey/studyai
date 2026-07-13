import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Activity {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
}

interface Props {
  colors: any;
}

const ACTIVITIES: Activity[] = [
  { id: '1', user: 'Sarah Chen', avatar: '👩‍💻', action: 'completed', target: 'Python Advanced Decorators', time: '2h ago' },
  { id: '2', user: 'Marcus Lee', avatar: '👨‍🎓', action: 'earned badge', target: 'Network Ninja', time: '4h ago' },
  { id: '3', user: 'Emily Park', avatar: '👩‍🔬', action: 'joined', target: 'Cloud Architects group', time: '6h ago' },
  { id: '4', user: 'David Kim', avatar: '👨‍💼', action: 'scored 98% on', target: 'Linux Quiz #5', time: '8h ago' },
  { id: '5', user: 'Lisa Wang', avatar: '👩‍🎨', action: 'started streak', target: '15 days', time: '1d ago' },
];

export default function FeedTab({ colors }: Props) {
  return (
    <>
      {ACTIVITIES.map((activity) => (
        <View key={activity.id} style={[styles.feedItem, { borderBottomColor: colors.border }]}>
          <Text style={styles.feedAvatar}>{activity.avatar}</Text>
          <View style={styles.feedContent}>
            <Text style={[styles.feedText, { color: colors.textSecondary }]}>
              <Text style={[styles.feedUser, { color: colors.text }]}>{activity.user} </Text>
              {activity.action}{' '}
              <Text style={[styles.feedTarget, { color: colors.accent }]}>{activity.target}</Text>
            </Text>
            <Text style={[styles.feedTime, { color: colors.textMuted }]}>{activity.time}</Text>
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  feedItem: {
    flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  feedAvatar: { fontSize: 32, marginRight: 12 },
  feedContent: { flex: 1 },
  feedText: { fontSize: 14, lineHeight: 20 },
  feedUser: { fontWeight: '700' },
  feedTarget: { fontWeight: '600' },
  feedTime: { fontSize: 12, marginTop: 4 },
});
