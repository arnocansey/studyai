import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../context/ThemeContext";

type Variant = "default" | "secondary" | "outline" | "success" | "destructive";

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  style?: ViewStyle;
}

export function Badge({ children, variant = "default", style }: BadgeProps) {
  const { colors, radius } = useTheme();

  const bg =
    variant === "default"
      ? colors.primary + "26"
      : variant === "secondary"
        ? colors.secondary
        : variant === "success"
          ? colors.success + "26"
          : variant === "destructive"
            ? colors.destructive + "26"
            : "transparent";

  const color =
    variant === "default"
      ? colors.primary
      : variant === "secondary"
        ? colors.secondaryForeground
        : variant === "success"
          ? colors.success
          : variant === "destructive"
            ? colors.destructive
            : colors.mutedForeground;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: variant === "outline" ? colors.border : "transparent",
          borderWidth: variant === "outline" ? 1 : 0,
          borderRadius: radius.full,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
