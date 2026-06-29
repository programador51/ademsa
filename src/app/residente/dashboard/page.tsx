"use client";

import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BoltIcon from "@mui/icons-material/Bolt";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { useServiciosHierarchyData } from "@/hooks/useServiciosHierarchyData";
import { tiposAccesoRapidoForCondominio } from "@/lib/baserow/condominioFilters";
import { FIELDS, ROLES } from "@/lib/baserow/constants";

const QUICK_ACCESS_COLORS = [
  "#c62828",
  "#1565c0",
  "#2e7d32",
  "#ef6c00",
  "#6a1b9a",
  "#00838f",
] as const;

function DashboardTile({
  title,
  color,
  icon: Icon,
  onClick,
}: {
  title: string;
  color: string;
  icon: typeof AssignmentIcon;
  onClick: () => void;
}) {
  return (
    <Paper
      component="button"
      type="button"
      onClick={onClick}
      elevation={0}
      sx={{
        width: "100%",
        p: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        cursor: "pointer",
        textAlign: "center",
        bgcolor: "background.paper",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Stack spacing={1} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: `${color}18`,
            color,
          }}
        >
          <Icon />
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function ResidenteDashboardPage() {
  const router = useRouter();
  const { user, condominioId, condominioNombre } = useApp();
  const { tipos } = useServiciosHierarchyData(condominioId);

  const tiposAccesoRapido = useMemo(
    () =>
      condominioId ? tiposAccesoRapidoForCondominio(tipos, condominioId) : [],
    [tipos, condominioId]
  );

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
        Selecciona un condominio para continuar
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Bienvenido, {user?.nombre}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {condominioNombre ?? `Condominio #${condominioId}`}
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        {tiposAccesoRapido.map((tipo, index) => {
          const color = QUICK_ACCESS_COLORS[index % QUICK_ACCESS_COLORS.length];
          const nombre = tipo[FIELDS.TIPOS.NOMBRE]?.trim() || `Tipo #${tipo.id}`;
          return (
            <Grid key={tipo.id} size={{ xs: 6 }}>
              <DashboardTile
                title={`Tickets ${nombre}`}
                color={color}
                icon={BoltIcon}
                onClick={() =>
                  router.push(`/residente/reportes?create=1&tipoId=${tipo.id}`)
                }
              />
            </Grid>
          );
        })}
        <Grid size={{ xs: 6 }}>
          <DashboardTile
            title="Tickets"
            color="#c62828"
            icon={AssignmentIcon}
            onClick={() => router.push("/residente/reportes")}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
