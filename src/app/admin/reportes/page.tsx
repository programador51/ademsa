"use client";

import { Alert } from "@mui/material";
import { useApp } from "@/contexts/AppContext";
import { ROLES } from "@/lib/baserow/constants";
import { AdminReportesProvider } from "@/modules/reportes/AdminReportesContext";
import AdminReportesView from "@/modules/reportes/components/AdminReportesView";

export default function AdminReportesPage() {
  const { user, condominioId } = useApp();

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  if (!condominioId) {
    return <Alert severity="info">Selecciona un condominio para ver los reportes.</Alert>;
  }

  return (
    <AdminReportesProvider>
      <AdminReportesView />
    </AdminReportesProvider>
  );
}
