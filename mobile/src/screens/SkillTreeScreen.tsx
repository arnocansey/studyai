import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { gamificationApi } from '../services/gamification';
import { cache } from '../services/cache';
import { FadeInView } from '../components/animations';
import { SkeletonList } from '../components/Skeleton';

const DEFAULT_SKILL_TREE = [
  { id: '1', name: 'Web Dev', icon: '🌐', level: 4, maxLevel: 5, xp: 4200, maxXp: 5000, color: '#3B82F6', unlocked: true, sub: ['HTML/CSS', 'JavaScript', 'React', 'Node.js'] },
  { id: '2', name: 'Python', icon: '🐍', level: 3, maxLevel: 5, xp: 2800, maxXp: 5000, color: '#10B981', unlocked: true, sub: ['Basics', 'OOP', 'Data Science'] },
  { id: '3', name: 'Cloud', icon: '☁️', level: 2, maxLevel: 5, xp: 1200, maxXp: 5000, color: '#8B5CF6', unlocked: true, sub: ['AWS Basics', 'Docker'] },
  { id: '4', name: 'DevOps', icon: '⚙️', level: 1, maxLevel: 5, xp: 500, maxXp: 5000, color: '#F59E0B', unlocked: true, sub: ['CI/CD'] },
  { id: '5', name: 'Cybersecurity', icon: '🔒', level: 0, maxLevel: 5, xp: 0, maxXp: 5000, color: '#EF4444', unlocked: false, sub: [] },
  { id: '6', name: 'Machine Learning', icon: '🤖', level: 0, maxLevel: 5, xp: 0, maxXp: 5000, color: '#EC4899', unlocked: false, sub: [] },
  { id: '7', name: 'Mobile Dev', icon: '📱', level: 1, maxLevel: 5, xp: 400, maxXp: 5000, color: '#06B6D4', unlocked: true, sub: ['React Native'] },
  { id: '8', name: 'Database', icon: '🗄️', level: 3, maxLevel: 5, xp: 3100, maxXp: 5000, color: '#84CC16', unlocked: true, sub: ['SQL', 'PostgreSQL', 'MongoDB'] },
  { id: '9', name: 'AI / ML Ops', icon: '🧠', level: 0, maxLevel: 5, xp: 0, maxXp: 5000, color: '#A855F7', unlocked: false, sub: [] },
  { id: '10', name: 'Soft Skills', icon: '🤝', level: 2, maxLevel: 5, xp: 1600, maxXp: 5000, color: '#F97316', unlocked: true, sub: ['Communication'] },
];

function getLevelColor(level: number, maxLevel: number): string {
  const ratio = level / maxLevel;
  if (ratio >= 0.8) return '#10B981';
  if (ratio >= 0.6) return '#3B82F6';
  if (ratio >= 0.4) return '#F59E0B';
  if (ratio >= 0.2) return '#F97316';
  return '#EF4444';
}

export function SkillTreeScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useUser();
  const [skillTree, setSkillTree] = useState(DEFAULT_SKILL_TREE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSkills = async () => {
    try {
      const cached = await cache.get('skill_tree');
      if (cached) {
        setSkillTree(cached as any);
        setLoading(false);
        return;
      }
      const achievements = await gamificationApi.getAchievements();
      const mapped = achievements.map((a: any, i: number) => ({
        id: a.id || String(i + 1),
        name: a.name || DEFAULT_SKILL_TREE[i]?.name || 'Skill',
        icon: a.icon || DEFAULT_SKILL_TREE[i]?.icon || '⭐',
        level: a.level || 0,
        maxLevel: a.maxLevel || 5,
        xp: a.xp || 0,
        maxXp: a.maxXp || 5000,
        color: a.color || DEFAULT_SKILL_TREE[i]?.color || '#3B82F6',
        unlocked: a.unlocked ?? false,
        sub: a.sub || [],
      }));
      setSkillTree(mapped.length > 0 ? mapped : DEFAULT_SKILL_TREE);
      cache.set('skill_tree', mapped.length > 0 ? mapped : DEFAULT_SKILL_TREE);
    } catch {
      setSkillTree(DEFAULT_SKILL_TREE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    cache.remove('skill_tree');
    await fetchSkills();
    setRefreshing(false);
  };

  const totalXp = skillTree.reduce((a: number, s: any) => a + s.xp, 0);
  const unlockedCount = skillTree.filter((s: any) => s.unlocked).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: colors.accent }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Skill Tree</Text>
        </View>

        {loading ? (
          <SkeletonList count={3} />
        ) : (
          <>
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{user.level}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Overall Level</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{unlockedCount}/{skillTree.length}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Unlocked</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{(totalXp / 1000).toFixed(1)}k</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Skill XP</Text>
                </View>
              </View>
            </View>

            {skillTree.map((skill: any, i: number) => (
              <FadeInView key={skill.id} delay={i * 60}>
                <View
                  style={[
                    styles.skillCard,
                    {
                      backgroundColor: skill.unlocked ? colors.card : colors.bg,
                      borderColor: skill.unlocked ? colors.border : colors.border + '80',
                      opacity: skill.unlocked ? 1 : 0.5,
                    },
                  ]}
                >
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillIcon}>{skill.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.skillName, { color: skill.unlocked ? colors.text : colors.textMuted }]}>
                        {skill.name}
                      </Text>
                      <Text style={[styles.skillLevel, { color: skill.color }]}>
                        Level {skill.level} / {skill.maxLevel}
                      </Text>
                    </View>
                    {!skill.unlocked && <Text style={[styles.lockedBadge, { color: colors.textMuted }]}>🔒 Locked</Text>}
                  </View>

                  <View style={[styles.xpBarBg, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.xpBarFill,
                        {
                          width: skill.unlocked ? `${(skill.xp / skill.maxXp) * 100}%` : '0%',
                          backgroundColor: skill.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.xpText, { color: colors.textMuted }]}>
                    {skill.xp.toLocaleString()} / {skill.maxXp.toLocaleString()} XP
                  </Text>

                  {skill.sub.length > 0 && (
                    <View style={styles.subSkills}>
                      {skill.sub.map((sub: string) => (
                        <View key={sub} style={[styles.subTag, { backgroundColor: skill.color + '20' }]}>
                          <Text style={[styles.subTagText, { color: skill.color }]}>✓ {sub}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </FadeInView>
            ))}

            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  backBtn: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '800' },

  summaryCard: {
    marginHorizontal: 16, marginBottom: 16, padding: 20, borderRadius: 16, borderWidth: 1,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '800' },
  summaryLabel: { fontSize: 11, marginTop: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  summaryDivider: { width: 1, height: 40 },

  skillCard: {
    marginHorizontal: 16, marginBottom: 12, padding: 18, borderRadius: 16, borderWidth: 1,
  },
  skillHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  skillIcon: { fontSize: 30, marginRight: 14 },
  skillName: { fontSize: 17, fontWeight: '700' },
  skillLevel: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  lockedBadge: { fontSize: 12, fontWeight: '600' },

  xpBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: '100%', borderRadius: 4 },
  xpText: { fontSize: 11, marginTop: 6, textAlign: 'right' },

  subSkills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  subTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  subTagText: { fontSize: 12, fontWeight: '600' },
});
