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

  const allQuizCorrect =
    questions.length === 0 || questions.every((q) => answers[q.id]?.correct);

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

  if (!lesson) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.bg }]}
        edges={["top"]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: colors.accent }]}>‹ Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text style={{ color: colors.textMuted }}>Lesson not found</Text>
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
          >
            <Text style={[styles.back, { color: colors.accent }]}>
              ‹ {courseTitle}
            </Text>
          </TouchableOpacity>
        </View>

        <FadeInView>
          <Text style={[styles.type, { color: colors.accent }]}>
            {lesson.type}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {lesson.title}
          </Text>
          <Text style={[styles.content, { color: colors.textMuted }]}>
            {lesson.content?.trim() || "No content yet for this lesson."}
          </Text>
        </FadeInView>

        {questions.length > 0 && (
          <FadeInView delay={120}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
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
                  <Text style={[styles.question, { color: colors.text }]}>
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
                            borderColor: colors.accent,
                            backgroundColor: colors.accent + "18",
                          },
                          isCorrect && {
                            borderColor: "#10B981",
                            backgroundColor: "#10B98122",
                          },
                          isWrong && {
                            borderColor: "#EF4444",
                            backgroundColor: "#EF444422",
                          },
                        ]}
                        onPress={() => selectAnswer(q.id, option)}
                        disabled={!!state?.correct}
                        accessibilityRole="button"
                      >
                        <Text
                          style={[styles.optionText, { color: colors.text }]}
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
                        { color: state.correct ? "#10B981" : "#EF4444" },
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

        <TouchableOpacity
          style={[
            styles.completeBtn,
            {
              backgroundColor:
                completed || !allQuizCorrect ? colors.border : colors.accent,
              opacity: completing ? 0.7 : 1,
            },
          ]}
          disabled={completing || completed || !allQuizCorrect}
          onPress={markComplete}
          accessibilityRole="button"
        >
          <Text style={styles.completeText}>
            {completed
              ? "Completed"
              : !allQuizCorrect
                ? "Answer all quiz questions"
                : completing
                  ? "Saving…"
                  : "Mark complete (+50 XP)"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: 48 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  back: { fontSize: 17, fontWeight: "600" },
  type: {
    marginHorizontal: 16,
    marginTop: 8,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginHorizontal: 16,
    marginTop: 6,
  },
  content: {
    fontSize: 15,
    lineHeight: 24,
    marginHorizontal: 16,
    marginTop: 14,
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
  completeBtn: {
    marginHorizontal: 16,
    marginTop: 28,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  completeText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
