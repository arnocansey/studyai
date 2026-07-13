import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  date?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'First Steps', description: 'Complete your first lesson', icon: '🎯', earned: true, date: '2026-01-20', rarity: 'common' },
  { id: '2', title: 'Python Master', description: 'Complete all Python courses', icon: '🐍', earned: true, date: '2026-03-15', rarity: 'epic' },
  { id: '3', title: 'Network Ninja', description: 'Score 100% on 5 networking quizzes', icon: '🌐', earned: true, date: '2026-04-10', rarity: 'rare' },
  { id: '4', title: 'Streak Warrior', description: 'Maintain a 30-day streak', icon: '🔥', earned: false, rarity: 'legendary' },
  { id: '5', title: 'Code Reviewer', description: 'Review 10 peer submissions', icon: '📝', earned: false, rarity: 'rare' },
  { id: '6', title: 'Cloud Pioneer', description: 'Complete AWS certification track', icon: '☁️', earned: false, rarity: 'epic' },
  { id: '7', title: 'Bug Hunter', description: 'Find and fix 20 bugs in challenges', icon: '🐛', earned: true, date: '2026-05-01', rarity: 'rare' },
  { id: '8', title: 'Team Player', description: 'Join 3 study groups', icon: '🤝', earned: true, date: '2026-02-28', rarity: 'common' },
  { id: '9', title: 'Speed Demon', description: 'Complete a challenge in under 5 minutes', icon: '⚡', earned: false, rarity: 'legendary' },
  { id: '10', title: 'Knowledge Seeker', description: 'Ask 50 questions in discussions', icon: '❓', earned: false, rarity: 'rare' },
  { id: '11', title: 'Mentor', description: 'Help 10 students with their code', icon: '🎓', earned: false, rarity: 'epic' },
  { id: '12', title: 'Full Stack', description: 'Complete both frontend and backend tracks', icon: '🖥️', earned: false, rarity: 'legendary' },
];

const RARITY_COLORS = {
  common: '#6B7280',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

interface Props {
  colors: {
    card: string;
    border: string;
    text: string;
    textMuted: string;
    textSecondary: string;
  };
}

export default function AchievementsView({ colors }: Props) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Achievements ({ACHIEVEMENTS.filter((a) => a.earned).length}/{ACHIEVEMENTS.length})
      </Text>
      {ACHIEVEMENTS.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 30 }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🎯</Text>
          <Text style={{ fontSize: 15, color: colors.textMuted }}>No achievements yet</Text>
        </View>
      ) : (
        <View style={styles.achievementGrid}>
          {ACHIEVEMENTS.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              style={[
                styles.achievementCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                !achievement.earned && styles.achievementLocked,
              ]}
              onPress={() => setSelectedAchievement(selectedAchievement?.id === achievement.id ? null : achievement)}
              accessibilityLabel={`${achievement.title} achievement. ${achievement.earned ? 'Earned' : 'Not yet earned'}. ${achievement.description}`}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedAchievement?.id === achievement.id }}
            >
              <Text style={[styles.achievementIcon, !achievement.earned && styles.achievementIconLocked]}>
                {achievement.icon}
              </Text>
              <Text style={[styles.achievementTitle, { color: colors.text }, !achievement.earned && { color: colors.textMuted }]} numberOfLines={1}>
                {achievement.title}
              </Text>
              <View style={[styles.rarityBadge, { backgroundColor: RARITY_COLORS[achievement.rarity] + '20' }]}>
                <Text style={[styles.rarityText, { color: RARITY_COLORS[achievement.rarity] }]}>
                  {achievement.rarity}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedAchievement && (
        <View style={[styles.achievementDetail, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.achievementDetailIcon}>{selectedAchievement.icon}</Text>
          <Text style={[styles.achievementDetailTitle, { color: colors.text }]}>{selectedAchievement.title}</Text>
          <Text style={[styles.achievementDetailDesc, { color: colors.textSecondary }]}>{selectedAchievement.description}</Text>
          {selectedAchievement.earned ? (
            <Text style={styles.achievementDetailDate}>Earned on {selectedAchievement.date}</Text>
          ) : (
            <Text style={styles.achievementDetailLocked}>🔒 Not yet earned</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  achievementCard: {
    width: '30%', borderRadius: 12, padding: 12, alignItems: 'center',
    borderWidth: 1, minHeight: 90, justifyContent: 'center',
  },
  achievementLocked: { opacity: 0.5 },
  achievementIcon: { fontSize: 28, marginBottom: 6 },
  achievementIconLocked: { opacity: 0.4 },
  achievementTitle: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  rarityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  rarityText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  achievementDetail: {
    marginTop: 16, padding: 18, borderRadius: 14,
    borderWidth: 1, alignItems: 'center',
  },
  achievementDetailIcon: { fontSize: 48, marginBottom: 10 },
  achievementDetailTitle: { fontSize: 18, fontWeight: '700' },
  achievementDetailDesc: { fontSize: 14, textAlign: 'center', marginTop: 6 },
  achievementDetailDate: { fontSize: 12, color: '#10B981', marginTop: 10 },
  achievementDetailLocked: { fontSize: 12, color: '#6B7280', marginTop: 10 },
});
