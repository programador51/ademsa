"use client";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ReactNode } from "react";
import "dayjs/locale/es";

export default function DateLocalizationProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      {children}
    </LocalizationProvider>
  );
}
