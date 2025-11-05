import { useState, useMemo } from "react";
import { useColorScheme } from "react-native";
import { AppThemeType, ResolvedThemeType } from "../types";
import { themeColors } from "./colors";
export const useAppTheme = () => {
  // Get device color scheme
  const deviceColorScheme = useColorScheme();
  const [theme, setTheme] = useState<AppThemeType>("system");

  // Resolve the actual theme to use
  const resolvedTheme: ResolvedThemeType = useMemo(() => {
    if (theme === "system") {
      return deviceColorScheme === "dark" ? "dark" : "light";
    }
    return theme;
  }, [theme, deviceColorScheme]);

  // Now you can access colors directly
  const colors = themeColors[resolvedTheme];

  return {
    colors,
    theme,
    setTheme,
    resolvedTheme,
  };
};
