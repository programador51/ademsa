"use client";

import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { FormTextField } from "@/components/forms/FormTextField";
import { ThemeModeSelect } from "@/components/layout/ThemeModeToggle";
import { useApp } from "@/contexts/AppContext";
import { fetchRow, updateTableRow } from "@/lib/api/data";
import { FIELDS, ROLES } from "@/lib/baserow/constants";
import { Unidad, Usuario } from "@/lib/baserow/types";
import { getLinkLabel } from "@/lib/baserow/utils";

const perfilSchema = yup.object({
  nombre: yup.string().trim().required("El nombre es requerido"),
});

type PerfilFormValues = yup.InferType<typeof perfilSchema>;

export default function PerfilPage() {
  const router = useRouter();
  const { user, refreshUser } = useApp();

  const { control, handleSubmit, reset } = useForm<PerfilFormValues>({
    resolver: yupResolver(perfilSchema),
    defaultValues: { nombre: "" },
  });

  const { data: perfil } = useQuery({
    queryKey: ["perfil", user?.id],
    queryFn: () => fetchRow<Usuario>("usuarios", user!.id),
    enabled: !!user?.id,
  });

  const { data: unidades } = useQuery({
    queryKey: ["mis-unidades", user?.unidadIds],
    queryFn: async () =>
      Promise.all(user!.unidadIds.map((id) => fetchRow<Unidad>("unidades", id))),
    enabled: !!user?.unidadIds.length,
  });

  useEffect(() => {
    if (perfil) reset({ nombre: perfil[FIELDS.USUARIOS.NOMBRE] });
  }, [perfil, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: PerfilFormValues) =>
      updateTableRow<Usuario>("usuarios", user!.id, {
        [FIELDS.USUARIOS.NOMBRE]: values.nombre,
      }),
    onSuccess: async () => {
      await refreshUser();
    },
  });

  if (user?.rol !== ROLES.RESIDENTE) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Mi perfil
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={handleSubmit((v) => updateMutation.mutate(v))}>
            <FormTextField name="nombre" control={control} label="Nombre" />
            <TextField label="Email" value={user?.email ?? ""} disabled fullWidth />
            <Typography variant="body2" color="text.secondary">
              Rol: {user?.rolLabel}
            </Typography>
            <Button type="submit" variant="contained" disabled={updateMutation.isPending}>
              Guardar cambios
            </Button>
            <Button variant="text" onClick={() => router.push("/select-condominio")}>
              Cambiar condominio
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Mis unidades
          </Typography>
          {!user?.unidadIds.length ? (
            <Typography color="text.secondary">No tienes unidades asignadas.</Typography>
          ) : (
            unidades?.map((unidad) => (
              <Typography key={unidad.id} variant="body2" sx={{ mb: 1 }}>
                {unidad[FIELDS.UNIDADES.NUMERO]} · {unidad[FIELDS.UNIDADES.EDIFICIO]} ·{" "}
                {getLinkLabel(unidad[FIELDS.UNIDADES.CONDOMINIO])}
              </Typography>
            ))
          )}
        </CardContent>
      </Card>

      <ThemeModeSelect />
    </Stack>
  );
}
