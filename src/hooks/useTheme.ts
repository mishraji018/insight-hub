import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light" | "system";

interface ThemeState {
    theme: Theme;
    themeMode: "light" | "dark";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const getSystemTheme = (): "light" | "dark" => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const useTheme = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: "system",
            themeMode: getSystemTheme(),
            setTheme: (theme: Theme) => {
                const themeMode = theme === "system" ? getSystemTheme() : theme;
                set({ theme, themeMode });
                applyTheme(themeMode);
            },
            toggleTheme: () => {
                const { themeMode } = get();
                const newTheme = themeMode === "light" ? "dark" : "light";
                set({ theme: newTheme, themeMode: newTheme });
                applyTheme(newTheme);
            },
        }),
        {
            name: "insight-theme-storage",
        }
    )
);

function applyTheme(mode: "light" | "dark") {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(mode);
}

// Initial application of theme
const storedTheme = localStorage.getItem("insight-theme-storage");
if (storedTheme) {
    try {
        const parsed = JSON.parse(storedTheme);
        if (parsed.state?.themeMode) {
            applyTheme(parsed.state.themeMode);
        }
    } catch (e) {
        console.error("Failed to parse theme from storage", e);
    }
}
