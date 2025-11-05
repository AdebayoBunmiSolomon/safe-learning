import { createContext, useContext, ReactNode } from "react";
import { useAppTheme } from "./useAppTheme";

type ThemeContextType = ReturnType<typeof useAppTheme>;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = useAppTheme();
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
