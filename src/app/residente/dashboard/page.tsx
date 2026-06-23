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
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ROLES } from "@/lib/baserow/constants";

export default function ResidenteDashboardPage() {
  const router = useRouter();
  const { user, condominioId, condominioNombre } = useApp();

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
        <Grid size={{ xs: 6 }}>
          <Paper
            component="button"
            type="button"
            onClick={() => router.push("/residente/reportes")}
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
                  bgcolor: "#c6282818",
                  color: "#c62828",
                }}
              >
                <AssignmentIcon />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Crear reportes
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
