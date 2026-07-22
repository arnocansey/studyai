import React, { useCallback, useEffect, useState } from "react";
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
import { useUser } from "../context/UserContext";
import { coursesApi, Lesson, QuizQuestion } from "../services/courses";
import { haptics } from "../services/haptics";
import { FadeInView } from "../components/animations";
import { Badge, Button } from "../components/ui";
import { aiApi } from "../services/ai";
import { Ionicons } from "@expo/vector-icons";

type AnswerState = Record<
  string,
  { selected?: string; correct?: boolean; message?: string }
>;

export function LessonScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const { updateUser, user } = useUser();
  const lessonId: string = route?.params?.lessonId;
  const courseTitle: string = route?.params?.courseTitle || "Course";
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practice, setPractice] = useState<
    Array<{ question: string; options: string[] }>
  >([]);

  const load = useCallback(async () => {
    if (!lessonId) return;
    try {
      const [detail, quiz] = await Promise.all([
        coursesApi.getLesson(lessonId),
        coursesApi.getQuizForLesson(lessonId).catch(() => null),
      ]);
      setLesson(detail);
      const quizQuestions = quiz?.questions?.length
        ? quiz.questions
        : detail.quizzes || [];
      setQuestions(quizQuestions);
      if (quiz && quiz.masteryLevel >= 100) setCompleted(true);
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to load lesson",
      );
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const selectAnswer = async (questionId: string, option: string) => {
    if (answers[questionId]?.correct) return;
    setAnswers((prev) => ({ ...prev, [questionId]: { selected: option } }));
    try {
      const result = await coursesApi.verifyQuiz(questionId, option);
      setAnswers((prev) => {
        const next = {
          ...prev,
          [questionId]: {
            selected: option,
            correct: result.isCorrect,
            message: result.message,
          },
        };
        if (
          result.isCorrect &&
          questions.length > 0 &&
          questions.every((q) => next[q.id]?.correct)
        ) {
          setCompleted(true);
        }
        return next;
      });
      if (result.isCorrect) {
        haptics.success();
        if (result.xpAwarded) {
          updateUser({ xp: (user.xp || 0) + result.xpAwarded });
        }
      } else {
        haptics.error();
      }
    } catch (err) {
      Alert.alert(
        "Quiz",
        err instanceof Error ? err.message : "Could not verify answer",
      );
    }
  };

  const markComplete = async () => {
    if (!lessonId) return;
    setCompleting(true);
    try {
      const result = await coursesApi.completeLesson(lessonId);
      setCompleted(true);
      if (result.xpAwarded > 0) {
        updateUser({ xp: (user.xp || 0) + result.xpAwarded });
        haptics.success();
        Alert.alert("Lesson complete", `+${result.xpAwarded} XP`);
      } else {
        Alert.alert("Already complete", "You already finished this lesson.");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Could not complete lesson",
      );
    } finally {
      setCompleting(false);
    }
  };

  const generatePractice = async () => {
    if (!lessonId) return;
    setPracticeLoading(true);
    try {
      const data = await aiApi.generateQuiz(lessonId, 3, false);
      setPractice(data.questions || []);
      haptics.light();
    } catch (err) {
      Alert.alert(
        "Practice quiz",
        err instanceof Error ? err.message : "Could not generate questions",
      );
    } finally {
      setPracticeLoading(false);
    }
  };

  const allQuizCorrect =
    questions.length === 0 || questions.every((q) => answers[q.id]?.correct);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.bg }]}
        edges={["top"]}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.bg }]}
        edges={["top"]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: colors.primary }]}>‹ Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text style={{ color: colors.mutedForeground }}>
            Lesson not found
          </Text>
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            style={styles.backRow}
          >
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
            <Text style={[styles.back, { color: colors.primary }]}>
              {courseTitle}
            </Text>
          </TouchableOpacity>
        </View>

        <FadeInView>
          <View style={{ marginHorizontal: 16, marginTop: 8 }}>
            <Badge>{lesson.type}</Badge>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {lesson.title}
          </Text>
          <Text style={[styles.content, { color: colors.mutedForeground }]}>
            {lesson.content?.trim() || "No content yet for this lesson."}
          </Text>
        </FadeInView>

        <FadeInView delay={80}>
          <View style={styles.mentorActions}>
            <Button
              variant="outline"
              size="sm"
              onPress={generatePractice}
              loading={practiceLoading}
            >
              AI practice quiz
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => navigation.navigate("Playground")}
            >
              Open playground
            </Button>
          </View>
          {practice.map((q, idx) => (
            <View
              key={idx}
              style={[
                styles.quizCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.question, { color: colors.foreground }]}>
                {idx + 1}. {q.question}
              </Text>
              {(q.options || []).map((option) => (
                <Text
                  key={option}
                  style={{
                    color: colors.mutedForeground,
                    marginTop: 4,
                    fontSize: 13,
                  }}
                >
                  • {option}
                </Text>
              ))}
            </View>
          ))}
        </FadeInView>

        {questions.length > 0 && (
          <FadeInView delay={120}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Quiz
            </Text>
            {questions.map((q, index) => {
              const state = answers[q.id];
              return (
                <View
                  key={q.id}
                  style={[
                    styles.quizCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.question, { color: colors.foreground }]}>
                    {index + 1}. {q.question}
                  </Text>
                  {(q.options || []).map((option) => {
                    const selected = state?.selected === option;
                    const isCorrect = selected && state?.correct;
                    const isWrong = selected && state?.correct === false;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.option,
                          { borderColor: colors.border },
                          selected && {
                            borderColor: colors.primary,
                            backgroundColor: colors.primary + "18",
                          },
                          isCorrect && {
                            borderColor: colors.success,
                            backgroundColor: colors.success + "22",
                          },
                          isWrong && {
                            borderColor: colors.destructive,
                            backgroundColor: colors.destructive + "22",
                          },
                        ]}
                        onPress={() => selectAnswer(q.id, option)}
                        disabled={!!state?.correct}
                        accessibilityRole="button"
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: colors.foreground },
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {state?.message ? (
                    <Text
                      style={[
                        styles.feedback,
                        {
                          color: state.correct
                            ? colors.success
                            : colors.destructive,
                        },
                      ]}
                    >
                      {state.message}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </FadeInView>
        )}

        <Button
          style={{ marginHorizontal: 16, marginTop: 28 }}
          disabled={completing || completed || !allQuizCorrect}
          loading={completing}
          onPress={markComplete}
        >
          {completed
            ? "Completed"
            : !allQuizCorrect
              ? "Answer all quiz questions"
              : "Mark complete (+50 XP)"}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: 48 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  back: { fontSize: 17, fontWeight: "600" },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginHorizontal: 16,
    marginTop: 10,
  },
  content: {
    fontSize: 15,
    lineHeight: 24,
    marginHorizontal: 16,
    marginTop: 14,
  },
  mentorActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 16,
    marginTop: 28,
    marginBottom: 8,
  },
  quizCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  question: { fontSize: 15, fontWeight: "600", marginBottom: 10 },
  option: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  optionText: { fontSize: 14 },
  feedback: { marginTop: 10, fontSize: 13, fontWeight: "600" },
});
