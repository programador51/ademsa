"use client";

import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ROLES } from "@/lib/baserow/constants";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, condominioId, condominioNombre } = useApp();

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
        Selecciona un condominio
      </Alert>
    );
  }

  const links = [
    { title: "Condominios", href: "/admin/condominios" },
    { title: "Servicios", href: "/admin/servicios" },
    { title: "Mant. preventivos", href: "/admin/mantenimientos/preventivos" },
    { title: "Mant. correctivos", href: "/admin/mantenimientos/correctivos" },
    { title: "Inversiones", href: "/admin/inversiones" },
    { title: "Usuarios y unidades", href: "/admin/usuarios" },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Panel admin
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {condominioNombre ?? `Condominio #${condominioId}`}
      </Typography>
      {links.map((link) => (
        <Card key={link.href} variant="outlined">
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Typography>{link.title}</Typography>
              <Button size="small" onClick={() => router.push(link.href)}>
                Abrir
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
