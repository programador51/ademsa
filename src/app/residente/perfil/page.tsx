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
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { fetchRow, updateTableRow } from "@/lib/api/data";
import { FIELDS, ROLES } from "@/lib/baserow/constants";
import { Unidad, Usuario } from "@/lib/baserow/types";
import { getLinkLabel } from "@/lib/baserow/utils";

export default function PerfilPage() {
  const router = useRouter();
  const { user, refreshUser } = useApp();
  const [nombre, setNombre] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: perfil } = useQuery({
    queryKey: ["perfil", user?.id],
    queryFn: () => fetchRow<Usuario>("usuarios", user!.id),
    enabled: !!user?.id,
  });

  const { data: unidades } = useQuery({
    queryKey: ["mis-unidades", user?.unidadIds],
    queryFn: async () => {
      const results = await Promise.all(
        user!.unidadIds.map((id) => fetchRow<Unidad>("unidades", id))
      );
      return results;
    },
    enabled: !!user?.unidadIds.length,
  });

  useEffect(() => {
    if (perfil) {
      setNombre(perfil[FIELDS.USUARIOS.NOMBRE]);
    }
  }, [perfil]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateTableRow<Usuario>("usuarios", user!.id, {
        [FIELDS.USUARIOS.NOMBRE]: nombre,
      }),
    onSuccess: async () => {
      setMessage("Perfil actualizado correctamente");
      setError(null);
      await refreshUser();
    },
    onError: () => setError("No se pudo actualizar el perfil"),
  });

  if (user?.rol !== ROLES.RESIDENTE) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Mi perfil
      </Typography>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              fullWidth
            />
            <TextField
              label="Email"
              value={user?.email ?? ""}
              disabled
              fullWidth
            />
            <TextField
              label="Rol"
              value={user?.rolLabel ?? ""}
              disabled
              fullWidth
            />
            <Button
              variant="contained"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || !nombre}
            >
              Guardar cambios
            </Button>
            <Button variant="text" onClick={() => router.push("/select-condominio")}>
              Cambiar condominio
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Mis unidades
          </Typography>
          {!user?.unidadIds.length ? (
            <Typography color="text.secondary">
              No tienes unidades asignadas.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {unidades?.map((unidad) => (
                <Typography key={unidad.id}>
                  {unidad[FIELDS.UNIDADES.NUMERO]} · Edificio {unidad[FIELDS.UNIDADES.EDIFICIO]} ·{" "}
                  {getLinkLabel(unidad[FIELDS.UNIDADES.CONDOMINIO])}
                </Typography>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
