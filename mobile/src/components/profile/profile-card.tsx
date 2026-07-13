import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../../context/UserContext';

interface ProfileCardProps {
  colors: any;
  onEditPress: () => void;
}

export default function ProfileCard({ colors, onEditPress }: ProfileCardProps) {
  const { user } = useUser();

  return (
    <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.avatarContainer} onPress={onEditPress} accessibilityLabel="Change profile picture" accessibilityRole="button">
        <Text style={styles.avatar}>{user.avatar}</Text>
        <View style={styles.avatarEditBadge}>
          <Text style={styles.avatarEditText}>✏️</Text>
        </View>
      </TouchableOpacity>
      <Text style={[styles.profileName, { color: colors.text }]}>{user.name}</Text>
      <Text style={[styles.profileEmail, { color: colors.textMuted }]}>{user.email}</Text>
      <Text style={[styles.profileBio, { color: colors.textSecondary }]}>{user.bio}</Text>

      <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
        {[
          { value: user.xp.toLocaleString(), label: 'XP' },
          { value: String(user.level), label: 'Level' },
          { value: String(user.streak), label: 'Streak' },
          { value: String(user.coursesCompleted), label: 'Courses' },
        ].map((stat, i) => (
          <React.Fragment key={stat.label}>
            {i > 0 && <View style={[styles.statDivider, { backgroundColor: colors.border }]} />}
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 20, marginHorizontal: 16, padding: 24, borderWidth: 1,
  },
  avatarContainer: { alignSelf: 'center', marginBottom: 12 },
  avatar: { fontSize: 64 },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: -4, backgroundColor: '#7C3AED',
    borderRadius: 14, width: 32, height: 32, justifyContent: 'center', alignItems: 'center',
  },
  avatarEditText: { fontSize: 14 },
  profileName: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  profileEmail: { fontSize: 14, textAlign: 'center', marginTop: 4 },
  profileBio: { fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    marginTop: 20, paddingTop: 20, borderTopWidth: 1,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 30 },
});
