"use client";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CrudTable from "@/components/common/CrudTable";
import { useApp } from "@/contexts/AppContext";
import {
  buildCondominioFilter,
  createTableRow,
  fetchTable,
  uploadFile,
} from "@/lib/api/data";
import { FIELDS, ROLES } from "@/lib/baserow/constants";
import { Agrupador, Reporte } from "@/lib/baserow/types";
import { getLinkLabel } from "@/lib/baserow/utils";

export default function ReportesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, condominioId } = useApp();
  const [open, setOpen] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [agrupadorId, setAgrupadorId] = useState<number | "">("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const filters = condominioId
    ? buildCondominioFilter(condominioId, FIELDS.REPORTES.CONDOMINIO)
    : undefined;

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ["reportes", condominioId],
    queryFn: () =>
      fetchTable<Reporte>("reportes", filters ? { filters } : undefined),
    enabled: !!condominioId,
  });

  const { data: agrupadores } = useQuery({
    queryKey: ["agrupadores", condominioId],
    queryFn: async () => {
      const response = await fetchTable<Agrupador>("agrupadores");
      return response.results;
    },
    enabled: !!condominioId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!condominioId) throw new Error("Condominio requerido");

      const uploaded = await Promise.all(files.map((file) => uploadFile(file)));

      return createTableRow<Reporte>("reportes", {
        [FIELDS.REPORTES.DESCRIPCION]: descripcion,
        [FIELDS.REPORTES.CONDOMINIO]: [condominioId],
        ...(agrupadorId ? { [FIELDS.REPORTES.AGRUPADORES]: [agrupadorId] } : {}),
        ...(uploaded.length
          ? { [FIELDS.REPORTES.IMAGENES]: uploaded.map((f) => ({ name: f.name })) }
          : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reportes", condominioId] });
      setOpen(false);
      setDescripcion("");
      setAgrupadorId("");
      setFiles([]);
      setError(null);
    },
    onError: () => setError("No se pudo crear el reporte"),
  });

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
        Selecciona un condominio para ver tus reportes
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <CrudTable
        title="Mis reportes"
        rows={data?.results ?? []}
        loading={isLoading}
        error={queryError ? "Error al cargar reportes" : null}
        onCreate={() => setOpen(true)}
        createLabel="Nuevo reporte"
        columns={[
          {
            id: FIELDS.REPORTES.DESCRIPCION,
            label: "Descripción",
            render: (row) => row[FIELDS.REPORTES.DESCRIPCION],
          },
          {
            id: FIELDS.REPORTES.FECHA_REPORTE,
            label: "Fecha",
            render: (row) => {
              const fecha = row[FIELDS.REPORTES.FECHA_REPORTE];
              return fecha ? new Date(fecha).toLocaleString("es-MX") : "—";
            },
          },
          {
            id: FIELDS.REPORTES.AGRUPADORES,
            label: "Agrupador",
            render: (row) => getLinkLabel(row[FIELDS.REPORTES.AGRUPADORES]),
          },
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nuevo reporte</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Descripción"
              multiline
              minRows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              fullWidth
            />
            <TextField
              select
              label="Agrupador (opcional)"
              value={agrupadorId}
              onChange={(e) => setAgrupadorId(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">Sin agrupador</MenuItem>
              {agrupadores?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item[FIELDS.AGRUPADORES.NOMBRE]}
                </MenuItem>
              ))}
            </TextField>
            <Box>
              <Button variant="outlined" component="label">
                Adjuntar imágenes
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                />
              </Button>
              {files.length > 0 && (
                <Box sx={{ mt: 1 }}>{files.map((f) => f.name).join(", ")}</Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!descripcion || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            Crear reporte
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
