import React, { forwardRef } from "react";
import { TextInput, StyleSheet, TextInputProps, ViewStyle } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface InputProps extends TextInputProps {
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ style, containerStyle, ...props }, ref) => {
    const { colors, radius } = useTheme();
    return (
      <TextInput
        ref={ref}
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.foreground,
            borderRadius: radius.lg,
          },
          style,
          containerStyle,
        ]}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 48,
  },
});
