"use client";

import {
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import { ThemeMode, useThemeMode } from "@/contexts/ThemeModeContext";

const MODES: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: "system", label: "Sistema", icon: <SettingsBrightnessIcon fontSize="small" /> },
  { value: "light", label: "Claro", icon: <LightModeIcon fontSize="small" /> },
  { value: "dark", label: "Oscuro", icon: <DarkModeIcon fontSize="small" /> },
];

export function ThemeModeToggle() {
  const { mode, setMode } = useThemeMode();

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
      {MODES.map((item) => (
        <Tooltip key={item.value} title={item.label}>
          <IconButton
            size="small"
            color={mode === item.value ? "primary" : "default"}
            onClick={() => setMode(item.value)}
            aria-label={item.label}
          >
            {item.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Stack>
  );
}

export function ThemeModeSelect() {
  const { mode, setMode } = useThemeMode();

  return (
    <FormControl fullWidth size="small">
      <InputLabel>Tema</InputLabel>
      <Select
        label="Tema"
        value={mode}
        onChange={(e) => setMode(e.target.value as ThemeMode)}
      >
        <MenuItem value="system">Seguir sistema</MenuItem>
        <MenuItem value="light">Claro</MenuItem>
        <MenuItem value="dark">Oscuro</MenuItem>
      </Select>
      <FormHelperText>Aplica en toda la aplicación</FormHelperText>
    </FormControl>
  );
}
