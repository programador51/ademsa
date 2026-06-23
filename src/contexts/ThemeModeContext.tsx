"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeModeContextValue {
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
}

const STORAGE_KEY = "condominio_theme_mode";

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(
  undefined
);

function getSystemMode(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setModeState(stored);
    }
  }, []);

  useEffect(() => {
    const apply = () => {
      setResolvedMode(mode === "system" ? getSystemMode() : mode);
    };
    apply();

    if (mode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => apply();
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ mode, resolvedMode, setMode }),
    [mode, resolvedMode, setMode]
  );

  return (
    <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error("useThemeMode debe usarse dentro de ThemeModeProvider");
  }
  return ctx;
}
