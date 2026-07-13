import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator, ScrollView, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { haptics } from '../services/haptics';

interface Props {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const { colors, isDark, toggleTheme } = useTheme();
  const { login, signup, updateUser } = useUser();

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your name');
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
      const message = err?.message || 'Something went wrong. Please try again.';
      setError(message);
      haptics.warning();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.accent }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={toggleTheme}
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            accessibilityRole="button"
          >
            <Text style={styles.themeToggleText}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🎓</Text>
            <Text style={styles.title}>Study<Text style={{ color: '#E0D4FC' }}>AI</Text></Text>
            <Text style={styles.subtitle}>Master coding with AI-powered guidance</Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                placeholderTextColor="rgba(255,255,255,0.5)"
                accessibilityLabel="Full name"
                textContentType="name"
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            )}
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={!isSignUp}
              placeholderTextColor="rgba(255,255,255,0.5)"
              accessibilityLabel="Email address"
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <View style={styles.passwordContainer}>
              <TextInput
                ref={passwordRef}
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="rgba(255,255,255,0.5)"
                accessibilityLabel="Password"
                textContentType="password"
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                accessibilityRole="button"
              >
                <Text style={styles.passwordToggleText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
              accessibilityLabel={isSignUp ? 'Create account' : 'Sign in'}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => { setIsSignUp(!isSignUp); setError(''); }}
              accessibilityLabel={isSignUp ? 'Switch to sign in' : 'Switch to sign up'}
              accessibilityRole="button"
            >
              <Text style={styles.linkText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton} accessibilityLabel="Continue with Apple" accessibilityRole="button">
                <Text style={styles.socialButtonText}>🍎</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} accessibilityLabel="Continue with Google" accessibilityRole="button">
                <Text style={styles.socialButtonText}>🔵</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} accessibilityLabel="Continue with GitHub" accessibilityRole="button">
                <Text style={styles.socialButtonText}>🐙</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 40 },
  themeToggle: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 12, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  themeToggleText: { fontSize: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 80 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', marginTop: 10 },
  subtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.85)', marginTop: 5 },
  form: { gap: 14 },
  errorContainer: { backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 12, padding: 12, marginBottom: 4 },
  errorText: { color: '#FCA5A5', fontSize: 14, textAlign: 'center' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, fontSize: 16, color: '#FFFFFF', minHeight: 52,
  },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14 },
  passwordInput: { flex: 1, paddingHorizontal: 18, paddingVertical: 16, fontSize: 16, color: '#FFFFFF', minHeight: 52 },
  passwordToggle: { paddingHorizontal: 14, minWidth: 44, minHeight: 52, justifyContent: 'center', alignItems: 'center' },
  passwordToggleText: { fontSize: 18 },
  button: {
    backgroundColor: '#1F2937', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 6, minHeight: 54, justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  linkButton: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: '#FFFFFF', fontSize: 14 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  dividerText: { color: '#FFFFFF', marginHorizontal: 12, fontSize: 12 },
  socialButtons: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialButton: {
    width: 56, height: 56, backgroundColor: '#FFFFFF', borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  socialButtonText: { fontSize: 24 },
});
