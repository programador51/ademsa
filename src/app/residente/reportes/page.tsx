"use client";

import { Suspense } from "react";
import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ROLES } from "@/lib/baserow/constants";
import { ReportesProvider } from "@/modules/reportes/ReportesContext";
import ReportesView from "@/modules/reportes/components/ReportesView";
import { defaultResidenteReportesFilters } from "@/modules/reportes/filters";

function ReportesPageContent() {
  const searchParams = useSearchParams();
  const quickCreateTipoId =
    searchParams.get("create") === "1" && searchParams.get("tipoId")
      ? Number(searchParams.get("tipoId"))
      : null;

  return (
    <ReportesProvider initialFilters={defaultResidenteReportesFilters}>
      <ReportesView quickCreateTipoId={quickCreateTipoId} />
    </ReportesProvider>
  );
}

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
        Selecciona un condominio para ver tus tickets
      </Alert>
    );
  }

  return (
    <Suspense
      fallback={
        <Stack sx={{ py: 4 , alignItems:'center' }}>
          <CircularProgress size={28} />
        </Stack>
      }
    >
      <ReportesPageContent />
    </Suspense>
  );
}
