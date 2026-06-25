"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { FormTextField } from "@/components/forms/FormTextField";
import { ThemeModeSelect } from "@/components/layout/ThemeModeToggle";
import { useApp } from "@/contexts/AppContext";

const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Correo inválido")
    .required("El correo es requerido"),
  password: yup.string().default(""),
});

type LoginFormValues = yup.InferType<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useApp();
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Error al iniciar sesión");
        return;
      }
      await refreshUser();
      router.push("/select-condominio");
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        mx: "auto",
        px: 2,
        py: 3,
        justifyContent: "center",
      }}
    >
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Stack spacing={1} sx={{ alignItems: "center", textAlign: "center" }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LockOutlinedIcon />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Condominio Intranet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Acceso interno. Si dejas la contraseña vacía y tu correo existe,
                podrás entrar.
              </Typography>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Stack spacing={2} component="form" onSubmit={onSubmit}>
              <FormTextField
                name="email"
                control={control}
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                required
              />
              <FormTextField
                name="password"
                control={control}
                label="Contraseña (opcional)"
                type="password"
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={formState.isSubmitting}
              >
                {formState.isSubmitting ? "Ingresando..." : "Iniciar sesión"}
              </Button>
            </Stack>

            <ThemeModeSelect />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
