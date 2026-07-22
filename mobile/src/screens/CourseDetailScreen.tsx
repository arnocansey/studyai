import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { coursesApi, CourseDetail, CourseProgress } from "../services/courses";
import { haptics } from "../services/haptics";
import { FadeInView } from "../components/animations";

export function CourseDetailScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const slug: string = route?.params?.slug;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    try {
      const [detail, myProgress] = await Promise.all([
        coursesApi.getBySlug(slug),
        coursesApi.getMyProgress().catch(() => [] as CourseProgress[]),
      ]);
      setCourse(detail);
      setProgress(
        myProgress.find((p) => p.courseId === detail.id || p.slug === slug) ||
          null,
      );
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to load course",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const lessonCount = useMemo(
    () =>
      course?.modules.reduce((sum, mod) => sum + mod.lessons.length, 0) ?? 0,
    [course],
  );

  const enroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      await coursesApi.enroll(course.id);
      haptics.success();
      await load();
    } catch (err) {
      Alert.alert(
        "Enrollment",
        err instanceof Error ? err.message : "Could not enroll",
      );
    } finally {
      setEnrolling(false);
    }
  };

  const openLesson = (lessonId: string, title: string) => {
    if (!progress) {
      Alert.alert("Enroll first", "Enroll in this course to open lessons.", [
        { text: "Cancel", style: "cancel" },
        { text: "Enroll", onPress: enroll },
      ]);
      return;
    }
    navigation.navigate("Lesson", {
      lessonId,
      courseTitle: course?.title,
      lessonTitle: title,
    });
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.bg }]}
        edges={["top"]}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.bg }]}
        edges={["top"]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
          >
            <Text style={[styles.back, { color: colors.accent }]}>‹ Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text style={{ color: colors.textMuted }}>Course not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bg }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
          >
            <Text style={[styles.back, { color: colors.accent }]}>‹ Back</Text>
          </TouchableOpacity>
        </View>

        <FadeInView>
          <Text style={[styles.title, { color: colors.text }]}>
            {course.title}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {course.difficulty} · {lessonCount} lessons ·{" "}
            {course.modules.length} modules
          </Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            {course.description}
          </Text>

          {progress ? (
            <View
              style={[
                styles.progressCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.progressLabel, { color: colors.text }]}>
                Progress · {progress.progress}%
              </Text>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(progress.progress, 2)}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressHint, { color: colors.textMuted }]}>
                {progress.completedLessons}/{progress.totalLessons} lessons
                complete
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.enrollBtn, { backgroundColor: colors.accent }]}
              onPress={enroll}
              disabled={enrolling}
              accessibilityRole="button"
            >
              <Text style={styles.enrollText}>
                {enrolling ? "Enrolling…" : "Enroll in course"}
              </Text>
            </TouchableOpacity>
          )}
        </FadeInView>

        {course.modules.map((mod, index) => (
          <FadeInView key={mod.id} delay={80 * (index + 1)}>
            <View
              style={[
                styles.moduleCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.moduleTitle, { color: colors.text }]}>
                Module {mod.order}: {mod.title}
              </Text>
              {mod.lessons.length === 0 ? (
                <Text style={[styles.emptyLesson, { color: colors.textMuted }]}>
                  No lessons yet
                </Text>
              ) : (
                mod.lessons.map((lesson) => (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[
                      styles.lessonRow,
                      { borderBottomColor: colors.border },
                    ]}
                    onPress={() => openLesson(lesson.id, lesson.title)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open lesson ${lesson.title}`}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.lessonTitle, { color: colors.text }]}
                      >
                        {lesson.title}
                      </Text>
                      <Text
                        style={[styles.lessonType, { color: colors.textMuted }]}
                      >
                        {lesson.type}
                      </Text>
                    </View>
                    <Text style={{ color: colors.textMuted }}>›</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </FadeInView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  back: { fontSize: 17, fontWeight: "600" },
  title: {
    fontSize: 28,
    fontWeight: "800",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  meta: { fontSize: 13, paddingHorizontal: 16, marginTop: 6 },
  description: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  progressCard: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  progressLabel: { fontSize: 15, fontWeight: "700" },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999 },
  progressHint: { fontSize: 12, marginTop: 8 },
  enrollBtn: {
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  enrollText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  moduleCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  moduleTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  emptyLesson: { fontSize: 13, paddingVertical: 8 },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lessonTitle: { fontSize: 15, fontWeight: "600" },
  lessonType: {
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
