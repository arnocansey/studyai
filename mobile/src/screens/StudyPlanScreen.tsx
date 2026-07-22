import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { aiApi, StudyPlan } from "../services/ai";
import { haptics } from "../services/haptics";
import { FadeInView } from "../components/animations";
import { Badge, Button, Input } from "../components/ui";
import { Ionicons } from "@expo/vector-icons";

type Level = "beginner" | "intermediate" | "advanced";

export function StudyPlanScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [goal, setGoal] = useState(
    "Prepare for a junior cybersecurity analyst role",
  );
  const [level, setLevel] = useState<Level>("beginner");
  const [weeklyHours, setWeeklyHours] = useState("6");
  const [focusAreas, setFocusAreas] = useState(
    "Linux, networking, web security",
  );
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    aiApi
      .getLatestStudyPlan()
      .then((latest) => {
        if (latest?.weeks) {
          setPlan({
            ...latest,
            weeks: Array.isArray(latest.weeks) ? latest.weeks : [],
            milestones: latest.milestones || [],
          });
          if (latest.goal) setGoal(latest.goal);
          if (
            latest.level === "beginner" ||
            latest.level === "intermediate" ||
            latest.level === "advanced"
          ) {
            setLevel(latest.level);
          }
          if (latest.weeklyHours) setWeeklyHours(String(latest.weeklyHours));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingLatest(false));
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const hours = Math.min(80, Math.max(1, Number(weeklyHours) || 6));
      const data = await aiApi.generateStudyPlan({
        goal: goal.trim(),
        currentLevel: level,
        weeklyHours: hours,
        focusAreas: focusAreas
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setPlan({
        ...data,
        weeks: Array.isArray(data.weeks) ? data.weeks : [],
        milestones: data.milestones || [],
      });
      haptics.success();
    } catch (err) {
      Alert.alert(
        "Study plan",
        err instanceof Error ? err.message : "Generation failed",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            style={styles.backRow}
          >
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
            <Text style={[styles.back, { color: colors.primary }]}>Back</Text>
          </TouchableOpacity>
        </View>

        <FadeInView>
          <View style={{ marginHorizontal: 16, marginTop: 12 }}>
            <Badge>AI Coach</Badge>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Study Plan
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Generate a structured weekly plan. New plans are saved
            automatically.
          </Text>
        </FadeInView>

        <View
          style={[
            styles.form,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            GOAL
          </Text>
          <Input
            value={goal}
            onChangeText={setGoal}
            multiline
            style={styles.textarea}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            LEVEL
          </Text>
          <View style={styles.levelRow}>
            {(["beginner", "intermediate", "advanced"] as Level[]).map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setLevel(item)}
                  style={[
                    styles.levelChip,
                    { borderColor: colors.border },
                    level === item && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        level === item
                          ? colors.primaryForeground
                          : colors.foreground,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            HOURS / WEEK
          </Text>
          <Input
            value={weeklyHours}
            onChangeText={setWeeklyHours}
            keyboardType="number-pad"
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            FOCUS AREAS
          </Text>
          <Input
            value={focusAreas}
            onChangeText={setFocusAreas}
            placeholder="Comma-separated topics"
          />

          <Button onPress={generate} loading={generating} size="lg">
            Generate plan
          </Button>
        </View>

        {loadingLatest ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
        ) : plan ? (
          <FadeInView delay={100}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Your plan
            </Text>
            {plan.milestones?.length > 0 && (
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  Milestones
                </Text>
                {plan.milestones.map((item, i) => (
                  <Text
                    key={i}
                    style={[styles.bullet, { color: colors.mutedForeground }]}
                  >
                    • {item}
                  </Text>
                ))}
              </View>
            )}
            {plan.weeks.map((week) => (
              <View
                key={week.week}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  Week {week.week}: {week.theme}
                </Text>
                {week.objectives?.map((obj, i) => (
                  <Text
                    key={`o-${i}`}
                    style={[styles.bullet, { color: colors.mutedForeground }]}
                  >
                    • {obj}
                  </Text>
                ))}
                {week.deliverable ? (
                  <Text style={[styles.deliverable, { color: colors.primary }]}>
                    Deliverable: {week.deliverable}
                  </Text>
                ) : null}
              </View>
            ))}
          </FadeInView>
        ) : (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            No saved plan yet. Generate one above.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 48 },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  back: { fontSize: 17, fontWeight: "600" },
  title: {
    marginHorizontal: 16,
    marginTop: 10,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    marginHorizontal: 16,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 6,
  },
  textarea: { minHeight: 90, textAlignVertical: "top" },
  levelRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  levelChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 28,
    fontSize: 18,
    fontWeight: "700",
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  bullet: { fontSize: 13, lineHeight: 20, marginTop: 2 },
  deliverable: { marginTop: 10, fontSize: 13, fontWeight: "600" },
  empty: {
    marginHorizontal: 16,
    marginTop: 28,
    fontSize: 14,
    textAlign: "center",
  },
});
