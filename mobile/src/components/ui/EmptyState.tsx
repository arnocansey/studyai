import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "./Button";
import { Card } from "./Card";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <Card style={styles.card}>
      <View style={styles.inner}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {title}
        </Text>
        {description ? (
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {description}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <Button onPress={onAction} size="sm" style={{ marginTop: 8 }}>
            {actionLabel}
          </Button>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderStyle: "dashed",
  },
  inner: {
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },
});
