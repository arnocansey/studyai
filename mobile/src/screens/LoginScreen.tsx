import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { haptics } from "../services/haptics";
import { Button, Card, Input, Badge } from "../components/ui";

interface Props {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const { colors, isDark, toggleTheme, radius } = useTheme();
  const { login, signup } = useUser();

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (isSignUp && !name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signup(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      haptics.success();
      onLogin();
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
      haptics.warning();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={[
                styles.themeToggle,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: radius.full,
                },
              ]}
              onPress={toggleTheme}
              accessibilityLabel={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              accessibilityRole="button"
            >
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={20}
                color={colors.foreground}
              />
            </TouchableOpacity>

            <View style={styles.brand}>
              <Badge>StudyAI</Badge>
              <Text style={[styles.title, { color: colors.foreground }]}>
                Study<Text style={{ color: colors.primary }}>AI</Text>
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.mutedForeground }]}
              >
                Master coding with AI-powered guidance
              </Text>
            </View>

            <Card style={styles.card}>
              <View style={styles.form}>
                {error ? (
                  <View
                    style={[
                      styles.errorBox,
                      {
                        backgroundColor: colors.destructive + "22",
                        borderColor: colors.destructive + "55",
                        borderRadius: radius.lg,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: colors.destructive,
                        textAlign: "center",
                        fontSize: 14,
                      }}
                    >
                      {error}
                    </Text>
                  </View>
                ) : null}

                {isSignUp ? (
                  <Input
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    accessibilityLabel="Full name"
                    textContentType="name"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                  />
                ) : null}

                <Input
                  ref={emailRef}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Email address"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />

                <View style={styles.passwordRow}>
                  <Input
                    ref={passwordRef}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    accessibilityLabel="Password"
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    style={{ flex: 1, paddingRight: 48 }}
                  />
                  <TouchableOpacity
                    style={styles.eye}
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.mutedForeground}
                    />
                  </TouchableOpacity>
                </View>

                <Button onPress={handleSubmit} loading={loading} size="lg">
                  {isSignUp ? "Create account" : "Sign in"}
                </Button>

                <TouchableOpacity
                  onPress={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                  style={styles.switchMode}
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    {isSignUp
                      ? "Already have an account? Sign in"
                      : "Don't have an account? Sign up"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  themeToggle: {
    position: "absolute",
    top: 8,
    right: 0,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { alignItems: "flex-start", marginBottom: 24, gap: 10 },
  title: { fontSize: 40, fontWeight: "800", letterSpacing: -1 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  card: { padding: 16 },
  form: { gap: 12 },
  errorBox: { borderWidth: 1, padding: 12 },
  passwordRow: { position: "relative" },
  eye: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    width: 40,
  },
  switchMode: { paddingVertical: 8 },
});
