import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export function Button({
  children,
  onPress,
  variant = "default",
  size = "md",
  disabled,
  loading,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const { colors, radius } = useTheme();
  const isDisabled = disabled || loading;

  const bg =
    variant === "default"
      ? colors.primary
      : variant === "secondary"
        ? colors.secondary
        : variant === "destructive"
          ? colors.destructive
          : "transparent";

  const borderColor =
    variant === "outline"
      ? colors.border
      : variant === "ghost"
        ? "transparent"
        : bg;

  const textColor =
    variant === "default" || variant === "destructive"
      ? colors.primaryForeground
      : variant === "secondary"
        ? colors.secondaryForeground
        : colors.foreground;

  const padV = size === "sm" ? 10 : size === "lg" ? 16 : 13;
  const padH = size === "sm" ? 14 : size === "lg" ? 22 : 18;
  const fontSize = size === "sm" ? 13 : size === "lg" ? 17 : 15;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === "outline" ? 1 : 0,
          borderRadius: radius.lg,
          paddingVertical: padV,
          paddingHorizontal: padH,
          opacity: isDisabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : typeof children === "string" ? (
        <Text
          style={[{ color: textColor, fontSize, fontWeight: "600" }, textStyle]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
});
