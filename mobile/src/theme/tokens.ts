/**
 * StudyAI mobile tokens — mirrors frontend/src/app/globals.css
 * HSL values converted to hex for React Native StyleSheet.
 */

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export type ThemeColors = {
  // Legacy aliases (existing screens)
  bg: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentLight: string;

  // Semantic (web parity)
  background: string;
  foreground: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  input: string;
  ring: string;
  cyberPurple: string;
  cyberGreen: string;
  cyberBlue: string;
  cyberOrange: string;
};

/** Dark — product default (matches .dark in globals.css) */
export const DARK_COLORS: ThemeColors = {
  background: "#08080A",
  foreground: "#F5F5F7",
  card: "#0E0E12",
  cardForeground: "#F5F5F7",
  primary: "#9B6DFF",
  primaryForeground: "#FFFFFF",
  secondary: "#222228",
  secondaryForeground: "#F5F5F7",
  muted: "#222228",
  mutedForeground: "#8E8E98",
  destructive: "#C23B3B",
  destructiveForeground: "#FAFAFA",
  success: "#22A35C",
  successForeground: "#FFFFFF",
  border: "#26262E",
  input: "#26262E",
  ring: "#9B6DFF",
  cyberPurple: "#8B5CF6",
  cyberGreen: "#22C55E",
  cyberBlue: "#3B82F6",
  cyberOrange: "#EA580C",

  // aliases
  bg: "#08080A",
  text: "#F5F5F7",
  textSecondary: "#D1D1D6",
  textMuted: "#8E8E98",
  accent: "#9B6DFF",
  accentLight: "#C4B5FD",
};

/** Light — matches :root in globals.css */
export const LIGHT_COLORS: ThemeColors = {
  background: "#FAFAFA",
  foreground: "#0F0F12",
  card: "#FFFFFF",
  cardForeground: "#0F0F12",
  primary: "#7C3AED",
  primaryForeground: "#FFFFFF",
  secondary: "#EFEFF1",
  secondaryForeground: "#1A1A1F",
  muted: "#EFEFF1",
  mutedForeground: "#6B6B76",
  destructive: "#DC2626",
  destructiveForeground: "#FFFFFF",
  success: "#16A34A",
  successForeground: "#FFFFFF",
  border: "#E0E0E5",
  input: "#E0E0E5",
  ring: "#7C3AED",
  cyberPurple: "#8B5CF6",
  cyberGreen: "#22C55E",
  cyberBlue: "#3B82F6",
  cyberOrange: "#EA580C",

  // aliases
  bg: "#FAFAFA",
  text: "#0F0F12",
  textSecondary: "#374151",
  textMuted: "#6B6B76",
  accent: "#7C3AED",
  accentLight: "#6D28D9",
};
