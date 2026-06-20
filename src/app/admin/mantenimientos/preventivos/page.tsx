"use client";

import {
  Alert,
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
import { useEffect, useState } from "react";
import CrudTable from "@/components/common/CrudTable";
import { useApp } from "@/contexts/AppContext";
import {
  createTableRow,
  deleteTableRow,
  fetchTable,
  updateTableRow,
} from "@/lib/api/data";
import { FIELDS, ROLES } from "@/lib/baserow/constants";
import { MantenimientoPreventivo, Proyecto } from "@/lib/baserow/types";
import { getLinkLabel } from "@/lib/baserow/utils";

export default function MantPreventivosPage() {
  const queryClient = useQueryClient();
  const { user, condominioId } = useApp();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [ultimo, setUltimo] = useState("");
  const [siguiente, setSiguiente] = useState("");
  const [proyectoId, setProyectoId] = useState<number | "">("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["mant-preventivos", condominioId],
    queryFn: () => fetchTable<MantenimientoPreventivo>("mant-preventivos"),
    enabled: !!condominioId,
  });

  const { data: proyectos } = useQuery({
    queryKey: ["proyectos-select", condominioId],
    queryFn: () => fetchTable<Proyecto>("proyectos"),
    enabled: !!condominioId,
  });

  useEffect(() => {
    if (!open) {
      setUltimo("");
      setSiguiente("");
      setProyectoId("");
      setEditingId(null);
    }
  }, [open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        [FIELDS.MANT_PREVENTIVOS.ULTIMO]: ultimo || null,
        [FIELDS.MANT_PREVENTIVOS.SIGUIENTE]: siguiente || null,
        ...(proyectoId ? { [FIELDS.MANT_PREVENTIVOS.PROYECTO]: [proyectoId] } : {}),
      };
      if (editingId) return updateTableRow("mant-preventivos", editingId, payload);
      return createTableRow("mant-preventivos", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mant-preventivos"] });
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (row: MantenimientoPreventivo) =>
      deleteTableRow("mant-preventivos", row.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["mant-preventivos"] }),
  });

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  return (
    <Stack spacing={2}>
      <CrudTable
        title="Mantenimientos preventivos"
        rows={data?.results ?? []}
        loading={isLoading}
        error={error ? "Error al cargar datos" : null}
        onCreate={() => setOpen(true)}
        onEdit={(row) => {
          setEditingId(row.id);
          setUltimo(row[FIELDS.MANT_PREVENTIVOS.ULTIMO]?.slice(0, 10) ?? "");
          setSiguiente(row[FIELDS.MANT_PREVENTIVOS.SIGUIENTE]?.slice(0, 10) ?? "");
          setProyectoId(row[FIELDS.MANT_PREVENTIVOS.PROYECTO]?.[0]?.id ?? "");
          setOpen(true);
        }}
        onDelete={(row) => deleteMutation.mutate(row)}
        columns={[
          {
            id: FIELDS.MANT_PREVENTIVOS.FOLIO,
            label: "Folio",
            render: (row) => row[FIELDS.MANT_PREVENTIVOS.FOLIO],
          },
          {
            id: FIELDS.MANT_PREVENTIVOS.ULTIMO,
            label: "Último",
            render: (row) => row[FIELDS.MANT_PREVENTIVOS.ULTIMO]?.slice(0, 10) ?? "—",
          },
          {
            id: FIELDS.MANT_PREVENTIVOS.SIGUIENTE,
            label: "Siguiente",
            render: (row) => row[FIELDS.MANT_PREVENTIVOS.SIGUIENTE]?.slice(0, 10) ?? "—",
          },
          {
            id: FIELDS.MANT_PREVENTIVOS.PROYECTO,
            label: "Proyecto",
            render: (row) => getLinkLabel(row[FIELDS.MANT_PREVENTIVOS.PROYECTO]),
          },
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingId ? "Editar mantenimiento preventivo" : "Nuevo mantenimiento preventivo"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Último mantenimiento"
              type="date"
              value={ultimo}
              onChange={(e) => setUltimo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Siguiente mantenimiento"
              type="date"
              value={siguiente}
              onChange={(e) => setSiguiente(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              select
              label="Proyecto"
              value={proyectoId}
              onChange={(e) => setProyectoId(Number(e.target.value))}
              fullWidth
            >
              {proyectos?.results.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p[FIELDS.PROYECTOS.NOMBRE]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
