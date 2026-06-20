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
import { MantenimientoCorrectivo, Proyecto } from "@/lib/baserow/types";
import { getLinkLabel } from "@/lib/baserow/utils";

export default function MantCorrectivosPage() {
  const queryClient = useQueryClient();
  const { user, condominioId } = useApp();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [presupuesto, setPresupuesto] = useState("");
  const [ejercido, setEjercido] = useState("");
  const [proyectoId, setProyectoId] = useState<number | "">("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["mant-correctivos", condominioId],
    queryFn: () => fetchTable<MantenimientoCorrectivo>("mant-correctivos"),
    enabled: !!condominioId,
  });

  const { data: proyectos } = useQuery({
    queryKey: ["proyectos-select", condominioId],
    queryFn: () => fetchTable<Proyecto>("proyectos"),
    enabled: !!condominioId,
  });

  useEffect(() => {
    if (!open) {
      setPresupuesto("");
      setEjercido("");
      setProyectoId("");
      setEditingId(null);
    }
  }, [open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        [FIELDS.MANT_CORRECTIVOS.PRESUPUESTO]: presupuesto || null,
        [FIELDS.MANT_CORRECTIVOS.EJERCIDO]: ejercido || null,
        ...(proyectoId ? { [FIELDS.MANT_CORRECTIVOS.PROYECTO]: [proyectoId] } : {}),
      };
      if (editingId) return updateTableRow("mant-correctivos", editingId, payload);
      return createTableRow("mant-correctivos", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mant-correctivos"] });
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (row: MantenimientoCorrectivo) =>
      deleteTableRow("mant-correctivos", row.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["mant-correctivos"] }),
  });

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  return (
    <Stack spacing={2}>
      <CrudTable
        title="Mantenimientos correctivos"
        rows={data?.results ?? []}
        loading={isLoading}
        error={error ? "Error al cargar datos" : null}
        onCreate={() => setOpen(true)}
        onEdit={(row) => {
          setEditingId(row.id);
          setPresupuesto(row[FIELDS.MANT_CORRECTIVOS.PRESUPUESTO] ?? "");
          setEjercido(row[FIELDS.MANT_CORRECTIVOS.EJERCIDO] ?? "");
          setProyectoId(row[FIELDS.MANT_CORRECTIVOS.PROYECTO]?.[0]?.id ?? "");
          setOpen(true);
        }}
        onDelete={(row) => deleteMutation.mutate(row)}
        columns={[
          {
            id: FIELDS.MANT_CORRECTIVOS.FOLIO,
            label: "Folio",
            render: (row) => row[FIELDS.MANT_CORRECTIVOS.FOLIO],
          },
          {
            id: FIELDS.MANT_CORRECTIVOS.PRESUPUESTO,
            label: "Presupuesto",
            render: (row) => row[FIELDS.MANT_CORRECTIVOS.PRESUPUESTO] ?? "—",
          },
          {
            id: FIELDS.MANT_CORRECTIVOS.EJERCIDO,
            label: "Ejercido",
            render: (row) => row[FIELDS.MANT_CORRECTIVOS.EJERCIDO] ?? "—",
          },
          {
            id: FIELDS.MANT_CORRECTIVOS.PROYECTO,
            label: "Proyecto",
            render: (row) => getLinkLabel(row[FIELDS.MANT_CORRECTIVOS.PROYECTO]),
          },
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingId ? "Editar mantenimiento correctivo" : "Nuevo mantenimiento correctivo"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Presupuesto"
              type="number"
              value={presupuesto}
              onChange={(e) => setPresupuesto(e.target.value)}
              fullWidth
            />
            <TextField
              label="Ejercido"
              type="number"
              value={ejercido}
              onChange={(e) => setEjercido(e.target.value)}
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
