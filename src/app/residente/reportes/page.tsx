"use client";

import { Alert, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ROLES } from "@/lib/baserow/constants";
import { ReportesProvider } from "@/modules/reportes/ReportesContext";
import ReportesView from "@/modules/reportes/components/ReportesView";

export default function ReportesPage() {
  const router = useRouter();
  const { user, condominioId } = useApp();

  if (user?.rol !== ROLES.RESIDENTE) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  if (!condominioId) {
    return (
      <Alert
        severity="info"
        action={
          <Button color="inherit" onClick={() => router.push("/select-condominio")}>
            Seleccionar
          </Button>
        }
      >
        Selecciona un condominio para ver tus reportes
      </Alert>
    );
  }

  return (
    <ReportesProvider>
      <ReportesView />
    </ReportesProvider>
  );
}
