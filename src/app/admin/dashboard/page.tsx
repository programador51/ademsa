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
import ApartmentIcon from "@mui/icons-material/Apartment";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CategoryIcon from "@mui/icons-material/Category";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PeopleIcon from "@mui/icons-material/People";
import SavingsIcon from "@mui/icons-material/Savings";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ROLES } from "@/lib/baserow/constants";

const MODULES = [
  {
    title: "Condominios",
    href: "/admin/condominios",
    icon: ApartmentIcon,
    color: "#1565c0",
  },
  {
    title: "Servicios",
    href: "/admin/servicios",
    icon: CategoryIcon,
    color: "#6a1b9a",
  },
  {
    title: "Mant. preventivos",
    href: "/admin/mantenimientos/preventivos",
    icon: EngineeringIcon,
    color: "#00838f",
  },
  {
    title: "Mant. correctivos",
    href: "/admin/mantenimientos/correctivos",
    icon: BuildCircleIcon,
    color: "#ef6c00",
  },
  {
    title: "Inversiones",
    href: "/admin/inversiones",
    icon: SavingsIcon,
    color: "#2e7d32",
  },
  {
    title: "Tickets",
    href: "/admin/reportes",
    icon: AssignmentIcon,
    color: "#c62828",
  },
  {
    title: "Usuarios y unidades",
    href: "/admin/usuarios",
    icon: PeopleIcon,
    color: "#4527a0",
  },
] as const;

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

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Panel admin
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {condominioNombre ?? `Condominio #${condominioId}`}
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        {MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <Grid key={module.href} size={{ xs: 6 }}>
              <Paper
                component="button"
                type="button"
                onClick={() => router.push(module.href)}
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
                      bgcolor: `${module.color}18`,
                      color: module.color,
                    }}
                  >
                    <Icon />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {module.title}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}
