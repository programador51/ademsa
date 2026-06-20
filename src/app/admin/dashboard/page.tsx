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

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, condominioId } = useApp();

  if (user?.rol !== ROLES.ADMINISTRADOR) {
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
        Selecciona un condominio para administrar
      </Alert>
    );
  }

  const modules = [
    { title: "Condominios", desc: "CRUD de condominios", href: "/admin/condominios" },
    { title: "Servicios", desc: "Tipos, agrupadores y proyectos", href: "/admin/servicios" },
    { title: "Mantenimientos", desc: "Preventivos y correctivos", href: "/admin/mantenimientos/preventivos" },
    { title: "Inversiones", desc: "Control de inversiones", href: "/admin/inversiones" },
    { title: "Usuarios", desc: "Asignación de unidades", href: "/admin/usuarios" },
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Panel de administración
        </Typography>
        <Typography color="text.secondary">
          Condominio activo: #{condominioId}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {modules.map((module) => (
          <Grid key={module.href} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">{module.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {module.desc}
                </Typography>
                <Button variant="contained" onClick={() => router.push(module.href)}>
                  Administrar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
