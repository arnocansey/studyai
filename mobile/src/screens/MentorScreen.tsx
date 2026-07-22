import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { aiApi } from "../services/ai";
import { Badge, Button, Card, Input } from "../components/ui";
import { haptics } from "../services/haptics";

const CONVERSATION_STORAGE_KEY = "studyai_mentor_conversation_id";

interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

interface ConversationSummary {
  id: string;
  title: string | null;
  topic: string | null;
  updatedAt: string;
}

export function MentorScreen({ navigation }: any) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [hint, setHint] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const persistConversationId = useCallback(async (id: string | null) => {
    if (id) {
      await AsyncStorage.setItem(CONVERSATION_STORAGE_KEY, id);
    } else {
      await AsyncStorage.removeItem(CONVERSATION_STORAGE_KEY);
    }
  }, []);

  const loadConversation = useCallback(
    async (id: string) => {
      const full = await aiApi.getConversation(id);
      setConversationId(full.id);
      setMessages(
        (full.messages || []).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      );
      await persistConversationId(full.id);
      setHint("");
      setFollowUp("");
      setError("");
    },
    [persistConversationId],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setBooting(true);
      try {
        const [storedId, list] = await Promise.all([
          AsyncStorage.getItem(CONVERSATION_STORAGE_KEY),
          aiApi.listConversations(),
        ]);

        if (cancelled) return;

        setConversations(list || []);

        const targetId =
          storedId && list?.some((c) => c.id === storedId)
            ? storedId
            : list?.[0]?.id;

        if (targetId) {
          await loadConversation(targetId);
        }
      } catch {
        /* fresh conversation is fine */
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadConversation]);

  const startNewChat = async () => {
    setConversationId(null);
    setMessages([]);
    setHint("");
    setFollowUp("");
    setError("");
    setShowHistory(false);
    await persistConversationId(null);
    haptics.light();
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    const content = input.trim();
    const userMessage: TutorMessage = { role: "user", content };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");
    setHint("");

    try {
      const data = await aiApi.tutor([...messages, { role: "user", content }], {
        conversationId: conversationId || undefined,
        topic: "General study mentor",
      });

      setConversationId(data.conversationId);
      await persistConversationId(data.conversationId);
      setMessages([...next, { role: "assistant", content: data.response }]);
      setFollowUp(data.followUp || "");
      setHint(data.hint || "");
      haptics.light();

      const list = await aiApi.listConversations();
      setConversations(list || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mentor unavailable");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, loading, hint]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
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
          <View style={styles.headerActions}>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setShowHistory((v) => !v)}
              accessibilityLabel="Toggle conversation history"
            >
              History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={startNewChat}
              accessibilityLabel="Start new conversation"
            >
              New
            </Button>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Badge>🧠 Socratic Mentor</Badge>
          <Text style={[styles.title, { color: colors.foreground }]}>
            AI Mentor
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Ask anything — I guide with questions, not answers.
          </Text>
        </View>

        {showHistory && conversations.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.historyRow}
            contentContainerStyle={styles.historyContent}
          >
            {conversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                onPress={() => {
                  loadConversation(conv.id);
                  setShowHistory(false);
                }}
                style={[
                  styles.historyChip,
                  {
                    backgroundColor:
                      conv.id === conversationId
                        ? colors.primary + "26"
                        : colors.secondary,
                    borderColor:
                      conv.id === conversationId
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.historyChipText,
                    {
                      color:
                        conv.id === conversationId
                          ? colors.primary
                          : colors.secondaryForeground,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {conv.title || conv.topic || "Chat"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        <Card style={styles.chatCard}>
          <ScrollView
            ref={scrollRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {booting ? (
              <View style={styles.booting}>
                <ActivityIndicator color={colors.primary} />
                <Text style={{ color: colors.mutedForeground, marginTop: 8 }}>
                  Loading conversation…
                </Text>
              </View>
            ) : messages.length === 0 ? (
              <Text
                style={[styles.emptyHint, { color: colors.mutedForeground }]}
              >
                Start a conversation about any topic — programming, security,
                networking, cloud, and more. Your chat is saved automatically.
              </Text>
            ) : (
              messages.map((msg, i) => (
                <View
                  key={`${msg.role}-${i}`}
                  style={[
                    styles.bubble,
                    msg.role === "user"
                      ? {
                          alignSelf: "flex-end",
                          backgroundColor: colors.primary + "26",
                          marginLeft: 48,
                        }
                      : {
                          alignSelf: "flex-start",
                          backgroundColor: colors.secondary,
                          marginRight: 48,
                        },
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      {
                        color:
                          msg.role === "user"
                            ? colors.foreground
                            : colors.mutedForeground,
                      },
                    ]}
                  >
                    {msg.content}
                  </Text>
                </View>
              ))
            )}

            {loading ? (
              <Text
                style={[styles.thinking, { color: colors.mutedForeground }]}
              >
                Thinking…
              </Text>
            ) : null}

            {hint ? (
              <Card
                style={
                  {
                    ...styles.hintCard,
                    backgroundColor: colors.secondary,
                  } as const
                }
              >
                <Badge variant="outline" style={{ marginBottom: 6 }}>
                  💡 Hint
                </Badge>
                <Text
                  style={{
                    color: colors.foreground,
                    fontSize: 13,
                    lineHeight: 18,
                  }}
                >
                  {hint}
                </Text>
              </Card>
            ) : null}

            {followUp && !loading ? (
              <Text
                style={[styles.followUp, { color: colors.mutedForeground }]}
              >
                Follow-up: {followUp}
              </Text>
            ) : null}

            {error ? (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {error}
              </Text>
            ) : null}
          </ScrollView>
        </Card>

        <View style={styles.inputRow}>
          <Input
            value={input}
            onChangeText={setInput}
            placeholder="Ask your mentor…"
            multiline
            style={styles.input}
            editable={!loading && !booting}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Button
            onPress={send}
            disabled={!input.trim() || loading || booting}
            loading={loading}
            style={styles.sendBtn}
            accessibilityLabel="Send message"
          >
            Send
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: 44,
  },
  back: { fontSize: 16, fontWeight: "600" },
  headerActions: { flexDirection: "row", gap: 4 },
  titleBlock: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 6,
  },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 14, lineHeight: 20 },
  historyRow: { maxHeight: 44, marginBottom: 8 },
  historyContent: { paddingHorizontal: 16, gap: 8 },
  historyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 160,
  },
  historyChipText: { fontSize: 12, fontWeight: "600" },
  chatCard: { flex: 1, marginHorizontal: 16, marginBottom: 8 },
  messagesScroll: { flex: 1 },
  messagesContent: { padding: 16, gap: 10, flexGrow: 1 },
  booting: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  emptyHint: { fontSize: 13, lineHeight: 20 },
  bubble: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "100%",
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  thinking: { fontSize: 12, fontStyle: "italic" },
  hintCard: { padding: 12, marginTop: 4 },
  followUp: { fontSize: 12, fontStyle: "italic", marginTop: 4 },
  errorText: { fontSize: 12, marginTop: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  input: { flex: 1, maxHeight: 100, paddingVertical: 12, fontSize: 15 },
  sendBtn: { minWidth: 72 },
});
