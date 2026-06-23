"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { ReactNode, useMemo, useState } from "react";
import { ThemeModeProvider, useThemeMode } from "@/contexts/ThemeModeContext";

function MuiThemeBridge({ children }: { children: ReactNode }) {
  const { resolvedMode } = useThemeMode();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedMode,
          primary: { main: "#1565c0" },
          secondary: { main: "#00897b" },
          background: {
            default: resolvedMode === "dark" ? "#0f1419" : "#f4f6f8",
            paper: resolvedMode === "dark" ? "#1a2332" : "#ffffff",
          },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
          MuiContainer: {
            defaultProps: { maxWidth: false },
          },
        },
      }),
    [resolvedMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const [cache] = useState(() => createCache({ key: "mui", prepend: true }));

  return (
    <CacheProvider value={cache}>
      <ThemeModeProvider>
        <MuiThemeBridge>{children}</MuiThemeBridge>
      </ThemeModeProvider>
    </CacheProvider>
  );
}
