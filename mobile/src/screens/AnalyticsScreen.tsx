import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { gamificationApi } from '../services/gamification';
import { analyticsApi, WeeklyDay, SubjectBreakdown, HeatmapData, Predictions, Insights, LeaderboardStats } from '../services/analytics';
import { cache } from '../services/cache';
import { FadeInView } from '../components/animations';

const SUBJECT_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#06B6D4', '#84CC16'];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const height = max > 0 ? (value / max) * 60 : 0;
  return (
    <View style={styles.miniBarContainer}>
      <View style={[styles.miniBar, { height: Math.max(height, 2), backgroundColor: color }]} />
    </View>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

export function AnalyticsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [xpData, setXpData] = useState({ totalXp: 0, level: 1, streak: 0 });
  const [weeklyData, setWeeklyData] = useState<WeeklyDay[]>([]);
  const [subjects, setSubjects] = useState<SubjectBreakdown | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardStats | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [xp, weekly, subs, heat, pred, ins, lb] = await Promise.all([
        gamificationApi.getXpProgress(),
        analyticsApi.getWeekly(),
        analyticsApi.getSubjects(),
        analyticsApi.getHeatmap(),
        analyticsApi.getPredictions(),
        analyticsApi.getInsights(),
        analyticsApi.getLeaderboardStats(),
      ]);
      setXpData(xp);
      setWeeklyData(weekly);
      setSubjects(subs);
      setHeatmap(heat);
      setPredictions(pred);
      setInsights(ins);
      setLeaderboard(lb);
      await cache.set('analytics_xp', xp);
      await cache.set('analytics_weekly', weekly);
      await cache.set('analytics_subjects', subs);
      await cache.set('analytics_heatmap', heat);
      await cache.set('analytics_predictions', pred);
      await cache.set('analytics_insights', ins);
      await cache.set('analytics_leaderboard', lb);
    } catch {
      const cXp = await cache.get<any>('analytics_xp');
      const cWeek = await cache.get<WeeklyDay[]>('analytics_weekly');
      const cSub = await cache.get<SubjectBreakdown>('analytics_subjects');
      const cHeat = await cache.get<HeatmapData>('analytics_heatmap');
      const cPred = await cache.get<Predictions>('analytics_predictions');
      const cIns = await cache.get<Insights>('analytics_insights');
      const cLb = await cache.get<LeaderboardStats>('analytics_leaderboard');
      if (cXp) setXpData(cXp);
      if (cWeek) setWeeklyData(cWeek);
      if (cSub) setSubjects(cSub);
      if (cHeat) setHeatmap(cHeat);
      if (cPred) setPredictions(cPred);
      if (cIns) setInsights(cIns);
      if (cLb) setLeaderboard(cLb);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const totalHours = weeklyData.reduce((a, d) => a + d.hours, 0);
  const overallProgress = subjects?.overallProgress ?? 0;
  const hasStudyData = weeklyData.some((d) => d.hours > 0) || (subjects?.courses.length ?? 0) > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}>
        <FadeInView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: colors.accent }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Analytics</Text>
        </View>
        </FadeInView>

        {!loading && !hasStudyData && (
          <EmptyState icon="📚" title="No study data yet" subtitle="Start studying to see your analytics here" />
        )}

        {/* Stats */}
        <FadeInView delay={100}>
        <View style={styles.statsGrid}>
          {[
            { label: 'This Week', value: `${totalHours.toFixed(1)}h`, sub: `${weeklyData.filter((d) => d.hours > 0).length} active days`, icon: '⏱️', color: '#3B82F6' },
            { label: 'Progress', value: `${overallProgress}%`, sub: 'Overall completion', icon: '📊', color: '#10B981' },
            { label: 'Streak', value: `${user.streak}`, sub: 'Days running', icon: '🔥', color: '#F59E0B' },
            ...(leaderboard ? [{ label: 'Rank', value: `#${leaderboard.rank}`, sub: `Top ${leaderboard.topPercentile}%`, icon: '🏆', color: '#8B5CF6' }] : []),
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.sub}</Text>
            </View>
          ))}
        </View>
        </FadeInView>

        {/* Weekly Activity Chart */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>📊 This Week</Text>
          {weeklyData.length === 0 ? (
            <Text style={[styles.emptyCardText, { color: colors.textMuted }]}>No weekly data available yet</Text>
          ) : (
            <>
              <View style={styles.chartRow}>
                {weeklyData.map((d, i) => {
                  const dayOfWeek = new Date(d.date).getDay();
                  return (
                    <View key={d.date} style={styles.chartCol}>
                      <Text style={[styles.chartHours, { color: colors.text }]}>{d.hours > 0 ? d.hours.toFixed(1) : '-'}</Text>
                      <MiniBar value={d.hours} max={Math.max(...weeklyData.map((w) => w.hours), 1)} color={colors.accent} />
                      <Text style={[styles.chartDay, { color: colors.textMuted }]}>{DAY_LABELS[dayOfWeek]}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={[styles.chartFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.chartFooterText, { color: colors.textMuted }]}>
                  Total: {totalHours.toFixed(1)}h • {weeklyData.filter((d) => d.hours > 0).length} active days
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Subjects */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>📚 Subjects</Text>
          {!subjects || subjects.courses.length === 0 ? (
            <Text style={[styles.emptyCardText, { color: colors.textMuted }]}>No courses enrolled yet</Text>
          ) : (
            subjects.courses.map((s, i) => (
              <View key={s.courseId} style={[styles.subjectRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.subjectDot, { backgroundColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subjectName, { color: colors.text }]}>{s.courseName}</Text>
                  <Text style={[styles.subjectStats, { color: colors.textMuted }]}>
                    {s.completedLessons}/{s.totalLessons} lessons
                  </Text>
                </View>
                <Text style={[styles.subjectScore, { color: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }]}>{s.progress}%</Text>
              </View>
            ))
          )}
        </View>

        {/* Activity Heatmap */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>🗓️ Activity</Text>
          {!heatmap || heatmap.totalSessions === 0 ? (
            <Text style={[styles.emptyCardText, { color: colors.textMuted }]}>No activity recorded yet</Text>
          ) : (
            <>
              <View style={styles.heatmapSummary}>
                <Text style={[styles.heatmapStat, { color: colors.text }]}>
                  {heatmap.totalSessions} sessions
                </Text>
                <Text style={[styles.heatmapStatMuted, { color: colors.textMuted }]}>
                  {heatmap.totalDays} active days
                </Text>
              </View>
              <View style={styles.heatmapGrid}>
                {heatmap.heatmap.filter((_, i) => i >= 338).map((day) => (
                  <View
                    key={day.date}
                    style={[
                      styles.heatmapCell,
                      {
                        backgroundColor:
                          day.level === 0
                            ? colors.border
                            : day.level === 1
                            ? colors.accent + '40'
                            : day.level === 2
                            ? colors.accent + '70'
                            : day.level === 3
                            ? colors.accent + 'B0'
                            : colors.accent,
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.heatmapLegend}>
                <Text style={[styles.heatmapLegendLabel, { color: colors.textMuted }]}>Less</Text>
                {[0, 1, 2, 3, 4].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.heatmapCell,
                      {
                        backgroundColor:
                          level === 0
                            ? colors.border
                            : level === 1
                            ? colors.accent + '40'
                            : level === 2
                            ? colors.accent + '70'
                            : level === 3
                            ? colors.accent + 'B0'
                            : colors.accent,
                      },
                    ]}
                  />
                ))}
                <Text style={[styles.heatmapLegendLabel, { color: colors.textMuted }]}>More</Text>
              </View>
            </>
          )}
        </View>

        {/* Predictions */}
        {predictions && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>🔮 Predictions</Text>
            <View style={styles.predictionRow}>
              <View style={[styles.predictionCard, { backgroundColor: colors.accent + '10' }]}>
                <Text style={[styles.predictionValue, { color: colors.accent }]}>{predictions.predictedWeeklyXP} XP</Text>
                <Text style={[styles.predictionLabel, { color: colors.textMuted }]}>Predicted weekly XP</Text>
              </View>
              <View style={[styles.predictionCard, { backgroundColor: predictions.streakRisk === 'low' ? '#10B98110' : predictions.streakRisk === 'medium' ? '#F59E0B10' : '#EF444410' }]}>
                <Text style={[styles.predictionValue, { color: predictions.streakRisk === 'low' ? '#10B981' : predictions.streakRisk === 'medium' ? '#F59E0B' : '#EF4444' }]}>
                  {predictions.streakRisk.charAt(0).toUpperCase() + predictions.streakRisk.slice(1)}
                </Text>
                <Text style={[styles.predictionLabel, { color: colors.textMuted }]}>Streak risk</Text>
              </View>
            </View>
            {predictions.optimalStudyHours.length > 0 && (
              <View style={[styles.optimalHoursBox, { backgroundColor: colors.accent + '10' }]}>
                <Text style={[styles.optimalHoursLabel, { color: colors.text }]}>
                  🧠 Optimal study hours: {predictions.optimalStudyHours.map((h) => {
                    const hour = h % 12 || 12;
                    const ampm = h < 12 ? 'am' : 'pm';
                    return `${hour}${ampm}`;
                  }).join(', ')}
                </Text>
              </View>
            )}
            {predictions.coursePredictions.filter((c) => c.daysToComplete !== null).length > 0 && (
              <View style={styles.coursePredictions}>
                {predictions.coursePredictions.filter((c) => c.daysToComplete !== null).map((c) => (
                  <View key={c.courseId} style={[styles.coursePredictionRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.coursePredictionName, { color: colors.text }]}>{c.courseName}</Text>
                    <Text style={[styles.coursePredictionDays, { color: colors.accent }]}>
                      ~{c.daysToComplete} days to complete
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Insights */}
        {insights && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>🧠 Insights</Text>

            {insights.strongestSubject && (
              <View style={[styles.insightCard, { backgroundColor: '#10B981' + '10' }]}>
                <Text style={styles.insightEmoji}>💪</Text>
                <Text style={[styles.insightText, { color: colors.text }]}>
                  Your strongest subject is <Text style={{ color: '#10B981', fontWeight: '700' }}>{insights.strongestSubject.courseName}</Text> at {insights.strongestSubject.progress}%.
                </Text>
              </View>
            )}

            {insights.weakestSubject && (
              <View style={[styles.insightCard, { backgroundColor: '#F59E0B' + '10' }]}>
                <Text style={styles.insightEmoji}>🎯</Text>
                <Text style={[styles.insightText, { color: colors.text }]}>
                  Consider spending more time on <Text style={{ color: '#F59E0B', fontWeight: '700' }}>{insights.weakestSubject.courseName}</Text> ({insights.weakestSubject.progress}%).
                </Text>
              </View>
            )}

            <View style={[styles.insightCard, { backgroundColor: colors.accent + '10' }]}>
              <Text style={styles.insightEmoji}>📅</Text>
              <Text style={[styles.insightText, { color: colors.text }]}>
                You studied <Text style={{ color: colors.accent, fontWeight: '700' }}>{insights.studyConsistency.daysStudiedThisWeek}/7</Text> days this week with a consistency score of {insights.studyConsistency.score}%.
              </Text>
            </View>

            {leaderboard && (
              <View style={[styles.insightCard, { backgroundColor: '#8B5CF6' + '10' }]}>
                <Text style={styles.insightEmoji}>🏆</Text>
                <Text style={[styles.insightText, { color: colors.text }]}>
                  You're <Text style={{ color: '#8B5CF6', fontWeight: '700' }}>{leaderboard.xpVsAverage >= 0 ? `${leaderboard.xpVsAverage}% above` : `${Math.abs(leaderboard.xpVsAverage)}% below`}</Text> the average XP across all users.
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  backBtn: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '800' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 16, gap: 10 },
  statCard: { width: '47%', padding: 16, borderRadius: 16, borderWidth: 1 },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },

  card: { marginHorizontal: 16, marginBottom: 16, padding: 18, borderRadius: 16, borderWidth: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 14 },

  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 80 },
  chartCol: { alignItems: 'center', flex: 1 },
  chartHours: { fontSize: 10, marginBottom: 4 },
  chartDay: { fontSize: 11, marginTop: 6, fontWeight: '600' },

  chartFooter: { borderTopWidth: 1, marginTop: 14, paddingTop: 10 },
  chartFooterText: { fontSize: 12, fontWeight: '600' },

  subjectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  subjectDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  subjectName: { fontSize: 15, fontWeight: '600' },
  subjectStats: { fontSize: 12, marginTop: 2 },
  subjectScore: { fontSize: 17, fontWeight: '800' },

  heatmapSummary: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  heatmapStat: { fontSize: 15, fontWeight: '700' },
  heatmapStatMuted: { fontSize: 13 },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginBottom: 8 },
  heatmapCell: { width: 14, height: 14, borderRadius: 3 },
  heatmapLegend: { flexDirection: 'row', alignItems: 'center', gap: 3, justifyContent: 'flex-end' },
  heatmapLegendLabel: { fontSize: 10 },

  predictionRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  predictionCard: { flex: 1, padding: 12, borderRadius: 12 },
  predictionValue: { fontSize: 18, fontWeight: '800' },
  predictionLabel: { fontSize: 11, marginTop: 2 },
  optimalHoursBox: { padding: 12, borderRadius: 10, marginBottom: 12 },
  optimalHoursLabel: { fontSize: 13 },
  coursePredictions: { marginTop: 4 },
  coursePredictionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  coursePredictionName: { fontSize: 14, fontWeight: '600' },
  coursePredictionDays: { fontSize: 13, fontWeight: '600' },

  insightCard: { flexDirection: 'row', padding: 14, borderRadius: 12, marginBottom: 8 },
  insightEmoji: { fontSize: 20, marginRight: 12 },
  insightText: { fontSize: 13, flex: 1, lineHeight: 20 },

  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 30 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyCardText: { fontSize: 14, textAlign: 'center', paddingVertical: 10 },

  miniBarContainer: { width: 28, height: 60, justifyContent: 'flex-end', alignItems: 'center' },
  miniBar: { width: 20, borderRadius: 4 },
});
