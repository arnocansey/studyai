import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { gamificationApi, Achievement } from "../services/gamification";
import { coursesApi, Course } from "../services/courses";
import { cache } from "../services/cache";
import { haptics } from "../services/haptics";
import { FadeInView } from "../components/animations";
import { useOnlineStatus } from "../services/offline";
import { EmptyState } from "../components/ui";
import { Ionicons } from "@expo/vector-icons";

const XP_PER_LEVEL = 5000;

export function DashboardScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { colors } = useTheme();
  const { user, updateUser } = useUser();
  const online = useOnlineStatus();
  const { width } = useWindowDimensions();

  const xpProgress = useMemo(() => {
    const xp = user.xp || 0;
    const levelXp = xp % XP_PER_LEVEL;
    return Math.min(levelXp / XP_PER_LEVEL, 1);
  }, [user.xp]);

  const xpToNext = useMemo(() => {
    const xp = user.xp || 0;
    return XP_PER_LEVEL - (xp % XP_PER_LEVEL);
  }, [user.xp]);

  const statCardWidth = useMemo(() => (width - 56) / 2, [width]);

  const fetchData = useCallback(async () => {
    try {
      const [xp, coursesData, achievementsData] = await Promise.allSettled([
        gamificationApi.getXpProgress(),
        coursesApi.list(),
        gamificationApi.getAchievements(),
      ]);

      if (xp.status === "fulfilled") {
        updateUser({
          xp: xp.value.totalXp,
          level: xp.value.level,
          streak: xp.value.streak,
        });
        await cache.set("dashboard_xp", xp.value);
      } else {
        const cached = await cache.get<any>("dashboard_xp");
        if (cached) {
          updateUser({
            xp: cached.totalXp,
            level: cached.level,
            streak: cached.streak,
          });
        }
      }

      if (coursesData.status === "fulfilled") {
        setCourses(coursesData.value);
        await cache.set("dashboard_courses", coursesData.value);
      } else {
        const cached = await cache.get<Course[]>("dashboard_courses");
        if (cached) setCourses(cached);
      }

      if (achievementsData.status === "fulfilled") {
        setAchievements(achievementsData.value);
        await cache.set("dashboard_achievements", achievementsData.value);
      } else {
        const cached = await cache.get<Achievement[]>("dashboard_achievements");
        if (cached) setAchievements(cached);
      }
    } catch {
      // offline fallback handled by individual branches above
    }
  }, [updateUser]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    haptics.light();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 17) return "Good afternoon,";
    return "Good evening,";
  };

  const STAT_ICONS = [
    { emoji: "🔥", label: "Day Streak", value: user.streak || 0 },
    {
      emoji: "📚",
      label: "Courses completed",
      value: user.coursesCompleted || 0,
    },
    { emoji: "🏆", label: "Badges earned", value: user.badges || 0 },
    { emoji: "⭐", label: "Average score", value: `${user.avgScore || 0}%` },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {user.name || "Student"}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.foreground}
            />
          </TouchableOpacity>
        </View>

        {!online && (
          <View
            style={[
              styles.offlineBanner,
              { backgroundColor: colors.cyberOrange },
            ]}
          >
            <Text style={styles.offlineText}>
              You are offline. Showing cached data.
            </Text>
          </View>
        )}

        {/* XP Card */}
        <FadeInView delay={100}>
          <View style={[styles.xpCard, { backgroundColor: colors.primary }]}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLabel}>Level {user.level || 1}</Text>
              <Text style={styles.xpValue}>
                {(user.xp || 0).toLocaleString()} XP
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(xpProgress * 100, 2)}%` },
                ]}
              />
            </View>
            <Text style={styles.xpToNext}>
              {xpToNext.toLocaleString()} XP to Level {(user.level || 1) + 1}
            </Text>
          </View>
        </FadeInView>

        {/* Quick actions */}
        <FadeInView delay={150}>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate("StudyPlan")}
              accessibilityRole="button"
            >
              <Ionicons name="color-wand" size={18} color={colors.primary} />
              <Text style={[styles.quickText, { color: colors.foreground }]}>
                Study Plan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate("Playground")}
              accessibilityRole="button"
            >
              <Ionicons
                name="code-slash-outline"
                size={18}
                color={colors.cyberBlue}
              />
              <Text style={[styles.quickText, { color: colors.foreground }]}>
                Playground
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate("Mentor")}
              accessibilityRole="button"
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={[styles.quickText, { color: colors.foreground }]}>
                Mentor
              </Text>
            </TouchableOpacity>
          </View>
        </FadeInView>

        {/* Quick Stats */}
        <FadeInView delay={200}>
          <View style={styles.statsGrid}>
            {STAT_ICONS.map((stat, i) => (
              <View
                key={i}
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    width: statCardWidth,
                  },
                ]}
                accessibilityLabel={`${stat.label}: ${stat.value}`}
              >
                <Text style={styles.statIcon}>{stat.emoji}</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </FadeInView>

        {/* Continue Learning */}
        <FadeInView delay={300}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Continue Learning
            </Text>
            {courses.length > 0 ? (
              courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  accessibilityLabel={`${course.title} course. ${course.lessonsCount} lessons.`}
                  accessibilityRole="button"
                  onPress={() => {
                    haptics.light();
                    navigation.navigate("CourseDetail", { slug: course.slug });
                  }}
                >
                  <View
                    style={[
                      styles.courseIcon,
                      { backgroundColor: colors.primary + "20" },
                    ]}
                  >
                    <Ionicons
                      name="book-outline"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.courseInfo}>
                    <Text
                      style={[styles.courseTitle, { color: colors.foreground }]}
                    >
                      {course.title}
                    </Text>
                    <Text
                      style={[
                        styles.courseProgress,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {course._count?.modules ?? course.lessonsCount ?? 0}{" "}
                      modules · {course.difficulty}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <EmptyState
                title="No courses yet"
                description="Published courses will show up here when available."
              />
            )}
          </View>
        </FadeInView>

        {/* Recent Achievements */}
        <FadeInView delay={400}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Achievements
            </Text>
            {achievements.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {achievements.map((achievement) => (
                  <TouchableOpacity
                    key={achievement.id}
                    style={[
                      styles.achievementCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    accessibilityLabel={`${achievement.title} achievement. ${achievement.description}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.achievementIcon}>
                      {achievement.icon}
                    </Text>
                    <Text
                      style={[styles.achievementName, { color: colors.text }]}
                    >
                      {achievement.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View
                style={[
                  styles.emptyState,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.emptyStateText, { color: colors.textMuted }]}
                >
                  Complete challenges to earn achievements!
                </Text>
              </View>
            )}
          </View>
        </FadeInView>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerText: { flex: 1 },
  greeting: { fontSize: 15 },
  name: { fontSize: 26, fontWeight: "bold", marginTop: 2 },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  xpCard: { marginHorizontal: 20, padding: 20, borderRadius: 20 },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  xpLabel: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "500" },
  xpValue: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#FCD34D", borderRadius: 4 },
  xpToNext: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 8 },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  quickAction: {
    flexGrow: 1,
    flexBasis: "30%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  quickText: { fontSize: 13, fontWeight: "600" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: "bold" },
  statLabel: { fontSize: 12, marginTop: 4 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15 },
  studyPlanLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  studyPlanText: { fontSize: 15, fontWeight: "600" },
  courseCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 10,
  },
  courseIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  courseIconText: { fontSize: 28 },
  courseInfo: { flex: 1, marginLeft: 16 },
  courseTitle: { fontSize: 16, fontWeight: "600" },
  courseProgress: { fontSize: 12, marginTop: 4 },
  achievementCard: {
    width: 120,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
  },
  achievementIcon: { fontSize: 36, marginBottom: 8 },
  achievementName: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  emptyState: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyStateText: { fontSize: 14, textAlign: "center" },
  offlineBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  offlineText: { color: "#000000", fontSize: 13, fontWeight: "600" },
});
