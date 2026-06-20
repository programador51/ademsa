"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ROLES } from "@/lib/baserow/constants";

export default function ResidenteDashboardPage() {
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
        Selecciona un condominio para continuar
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Bienvenido, {user?.nombre}
        </Typography>
        <Typography color="text.secondary">
          Gestiona tus reportes y actualiza tu perfil desde este portal.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Crear reporte
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Reporta incidencias o solicitudes para tu condominio.
              </Typography>
              <Button variant="contained" onClick={() => router.push("/residente/reportes")}>
                Ir a reportes
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mi perfil
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Actualiza tu nombre y revisa tus unidades asignadas.
              </Typography>
              <Button variant="outlined" onClick={() => router.push("/residente/perfil")}>
                Ver perfil
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
