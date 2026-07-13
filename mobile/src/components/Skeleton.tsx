import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Skeleton width={40} height={40} borderRadius={10} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
        {lines > 2 && <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />}
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIconCircle, { backgroundColor: colors.accent + '15' }]}>
        <Animated.Text style={{ fontSize: 48 }}>{icon}</Animated.Text>
      </View>
      <Animated.Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Animated.Text>
      <Animated.Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>{subtitle}</Animated.Text>
      {action && (
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: colors.accent }]}
          onPress={action.onPress}
        >
          <Text style={styles.retryBtnText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function ErrorRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIconCircle, { backgroundColor: '#EF4444' + '15' }]}>
        <Animated.Text style={{ fontSize: 48 }}>⚠️</Animated.Text>
      </View>
      <Animated.Text style={[styles.emptyTitle, { color: colors.text }]}>Something went wrong</Animated.Text>
      <Animated.Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>{message}</Animated.Text>
      <TouchableOpacity
        style={[styles.retryBtn, { backgroundColor: colors.accent }]}
        onPress={onRetry}
      >
        <Text style={styles.retryBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14,
    marginHorizontal: 16, marginBottom: 10, borderWidth: 1,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 60 },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  retryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
