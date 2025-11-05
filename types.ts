import { darkThemeColors } from "./Theme";

export type AppThemeType = "dark" | "light" | "system";
export type ResolvedThemeType = "dark" | "light";
export type ColorKey = keyof typeof darkThemeColors;
