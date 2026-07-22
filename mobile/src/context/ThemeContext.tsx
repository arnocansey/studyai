import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  DARK_COLORS,
  LIGHT_COLORS,
  ThemeColors,
  radius,
} from "../theme/tokens";

export type { ThemeColors };
export { radius };

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  radius: typeof radius;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  colors: DARK_COLORS,
  radius,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        colors: isDark ? DARK_COLORS : LIGHT_COLORS,
        radius,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
