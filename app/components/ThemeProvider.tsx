"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type ThemeContextType = {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("homeai_theme") as Theme | null;
            if (saved === "dark" || saved === "light") {
                setThemeState(saved);
            } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                setThemeState("dark");
            }
            setMounted(true);
        } catch {
            setMounted(true);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("homeai_theme", theme);
    }, [theme, mounted]);

    const toggleTheme = () => setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
    const setTheme = (newTheme: Theme) => setThemeState(newTheme);

    const value = { theme, isDark: theme === "dark", toggleTheme, setTheme };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}