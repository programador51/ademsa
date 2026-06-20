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
import { ESTATUS_LABELS, FIELDS, INVERSION_ESTATUS, ROLES } from "@/lib/baserow/constants";
import { Inversion, Proyecto } from "@/lib/baserow/types";
import { getLinkLabel, getSelectId } from "@/lib/baserow/utils";

export default function InversionesPage() {
  const queryClient = useQueryClient();
  const { user, condominioId } = useApp();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fecha, setFecha] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [ingreso, setIngreso] = useState("");
  const [ejercido, setEjercido] = useState("");
  const [estatus, setEstatus] = useState<number | "">("");
  const [proyectoId, setProyectoId] = useState<number | "">("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["inversiones", condominioId],
    queryFn: () => fetchTable<Inversion>("inversiones"),
    enabled: !!condominioId,
  });

  const { data: proyectos } = useQuery({
    queryKey: ["proyectos-select", condominioId],
    queryFn: () => fetchTable<Proyecto>("proyectos"),
    enabled: !!condominioId,
  });

  useEffect(() => {
    if (!open) {
      setFecha("");
      setPresupuesto("");
      setIngreso("");
      setEjercido("");
      setEstatus("");
      setProyectoId("");
      setEditingId(null);
    }
  }, [open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        [FIELDS.INVERSIONES.FECHA]: fecha || null,
        [FIELDS.INVERSIONES.PRESUPUESTO]: presupuesto || null,
        [FIELDS.INVERSIONES.INGRESO]: ingreso || null,
        [FIELDS.INVERSIONES.EJERCIDO]: ejercido || null,
        ...(estatus ? { [FIELDS.INVERSIONES.ESTATUS]: estatus } : {}),
        ...(proyectoId ? { [FIELDS.INVERSIONES.PROYECTO]: [proyectoId] } : {}),
      };
      if (editingId) return updateTableRow("inversiones", editingId, payload);
      return createTableRow("inversiones", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inversiones"] });
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (row: Inversion) => deleteTableRow("inversiones", row.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inversiones"] }),
  });

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  return (
    <Stack spacing={2}>
      <CrudTable
        title="Inversiones"
        rows={data?.results ?? []}
        loading={isLoading}
        error={error ? "Error al cargar datos" : null}
        onCreate={() => setOpen(true)}
        onEdit={(row) => {
          setEditingId(row.id);
          setFecha(row[FIELDS.INVERSIONES.FECHA]?.slice(0, 10) ?? "");
          setPresupuesto(row[FIELDS.INVERSIONES.PRESUPUESTO] ?? "");
          setIngreso(row[FIELDS.INVERSIONES.INGRESO] ?? "");
          setEjercido(row[FIELDS.INVERSIONES.EJERCIDO] ?? "");
          setEstatus(getSelectId(row[FIELDS.INVERSIONES.ESTATUS]) ?? "");
          setProyectoId(row[FIELDS.INVERSIONES.PROYECTO]?.[0]?.id ?? "");
          setOpen(true);
        }}
        onDelete={(row) => deleteMutation.mutate(row)}
        columns={[
          {
            id: FIELDS.INVERSIONES.FOLIO,
            label: "Folio",
            render: (row) => row[FIELDS.INVERSIONES.FOLIO],
          },
          {
            id: FIELDS.INVERSIONES.FECHA,
            label: "Fecha",
            render: (row) => row[FIELDS.INVERSIONES.FECHA]?.slice(0, 10) ?? "—",
          },
          {
            id: FIELDS.INVERSIONES.PRESUPUESTO,
            label: "Presupuesto",
            render: (row) => row[FIELDS.INVERSIONES.PRESUPUESTO] ?? "—",
          },
          {
            id: FIELDS.INVERSIONES.INGRESO,
            label: "Ingreso recibido",
            render: (row) => row[FIELDS.INVERSIONES.INGRESO] ?? "—",
          },
          {
            id: FIELDS.INVERSIONES.EJERCIDO,
            label: "Ejercido",
            render: (row) => row[FIELDS.INVERSIONES.EJERCIDO] ?? "—",
          },
          {
            id: FIELDS.INVERSIONES.ESTATUS,
            label: "Estatus",
            render: (row) => {
              const id = getSelectId(row[FIELDS.INVERSIONES.ESTATUS]);
              return id ? ESTATUS_LABELS[id] ?? "—" : "—";
            },
          },
          {
            id: FIELDS.INVERSIONES.PROYECTO,
            label: "Proyecto",
            render: (row) => getLinkLabel(row[FIELDS.INVERSIONES.PROYECTO]),
          },
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Editar inversión" : "Nueva inversión"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <TextField label="Presupuesto" type="number" value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)} fullWidth />
            <TextField label="Ingreso recibido" type="number" value={ingreso} onChange={(e) => setIngreso(e.target.value)} fullWidth />
            <TextField label="Ejercido" type="number" value={ejercido} onChange={(e) => setEjercido(e.target.value)} fullWidth />
            <TextField select label="Estatus" value={estatus} onChange={(e) => setEstatus(Number(e.target.value))} fullWidth>
              {Object.entries(INVERSION_ESTATUS).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {ESTATUS_LABELS[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Proyecto" value={proyectoId} onChange={(e) => setProyectoId(Number(e.target.value))} fullWidth>
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
