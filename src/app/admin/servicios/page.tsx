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
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import CrudTable from "@/components/common/CrudTable";
import { useApp } from "@/contexts/AppContext";
import {
  buildCondominioFilter,
  createTableRow,
  deleteTableRow,
  fetchTable,
  updateTableRow,
} from "@/lib/api/data";
import { FIELDS, ROLES } from "@/lib/baserow/constants";
import { Agrupador, Proyecto, Tipo } from "@/lib/baserow/types";
import { getLinkLabel } from "@/lib/baserow/utils";

type TabKey = "tipos" | "agrupadores" | "proyectos";

export default function ServiciosPage() {
  const queryClient = useQueryClient();
  const { user, condominioId } = useApp();
  const [tab, setTab] = useState<TabKey>("tipos");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [detalles, setDetalles] = useState("");
  const [tipoId, setTipoId] = useState<number | "">("");
  const [agrupadorId, setAgrupadorId] = useState<number | "">("");

  const condoFilter = useMemo(
    () =>
      condominioId
        ? buildCondominioFilter(
            condominioId,
            tab === "tipos"
              ? FIELDS.TIPOS.CONDOMINIO
              : FIELDS.PROYECTOS.CONDOMINIO,
          )
        : undefined,
    [condominioId, tab],
  );

  const { data: tipos } = useQuery({
    queryKey: ["tipos", condominioId],
    queryFn: () =>
      fetchTable<Tipo>(
        "tipos",
        condoFilter ? { filters: condoFilter } : undefined,
      ),
    enabled: !!condominioId,
  });

  const { data: agrupadores } = useQuery({
    queryKey: ["agrupadores-servicios", condominioId],
    queryFn: () => fetchTable<Agrupador>("agrupadores"),
    enabled: !!condominioId,
  });

  const { data: proyectos } = useQuery({
    queryKey: ["proyectos", condominioId],
    queryFn: () =>
      fetchTable<Proyecto>(
        "proyectos",
        condoFilter ? { filters: condoFilter } : undefined,
      ),
    enabled: !!condominioId,
  });

  useEffect(() => {
    if (!open) {
      setNombre("");
      setDetalles("");
      setTipoId("");
      setAgrupadorId("");
    }
  }, [tab, open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!condominioId) throw new Error("Condominio requerido");

      if (tab === "tipos") {
        const payload = {
          [FIELDS.TIPOS.NOMBRE]: nombre,
          [FIELDS.TIPOS.CONDOMINIO]: [condominioId],
        };
        if (editingId) return updateTableRow("tipos", editingId, payload);
        return createTableRow("tipos", payload);
      }

      if (tab === "agrupadores") {
        const payload = {
          [FIELDS.AGRUPADORES.NOMBRE]: nombre,
          ...(tipoId ? { [FIELDS.AGRUPADORES.TIPO]: [tipoId] } : {}),
        };
        if (editingId) return updateTableRow("agrupadores", editingId, payload);
        return createTableRow("agrupadores", payload);
      }

      const payload = {
        [FIELDS.PROYECTOS.NOMBRE]: nombre,
        [FIELDS.PROYECTOS.DETALLES]: detalles,
        [FIELDS.PROYECTOS.CONDOMINIO]: [condominioId],
        ...(agrupadorId ? { [FIELDS.PROYECTOS.AGRUPADOR]: [agrupadorId] } : {}),
      };
      if (editingId) return updateTableRow("proyectos", editingId, payload);
      return createTableRow("proyectos", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tab, condominioId] });
      queryClient.invalidateQueries({ queryKey: ["agrupadores-servicios"] });
      setOpen(false);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (row: { id: number }) => {
      await deleteTableRow(tab, row.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tab, condominioId] });
    },
  });

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  if (!condominioId) {
    return (
      <Alert severity="info">
        Selecciona un condominio para administrar servicios
      </Alert>
    );
  }

  const rows =
    tab === "tipos"
      ? (tipos?.results ?? [])
      : tab === "agrupadores"
        ? (agrupadores?.results ?? [])
        : (proyectos?.results ?? []);

  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Servicios del condominio
      </Typography>

      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        <Tab value="tipos" label="Tipos (Nivel 1)" />
        <Tab value="agrupadores" label="Agrupadores (Nivel 2)" />
        <Tab value="proyectos" label="Proyectos (Nivel 3)" />
      </Tabs>

      <CrudTable
        title={
          tab === "tipos"
            ? "Tipos"
            : tab === "agrupadores"
              ? "Agrupadores"
              : "Proyectos"
        }
        rows={rows as { id: number }[]}
        onCreate={() => {
          setEditingId(null);
          setOpen(true);
        }}
        onEdit={(row) => {
          setEditingId(row.id);
          if (tab === "tipos") {
            const nombre = (row as Tipo)[FIELDS.TIPOS.NOMBRE];
            setNombre(nombre);
          }
          if (tab === "agrupadores") {
            const idAgrupador = (row as Agrupador)[FIELDS.AGRUPADORES.TIPO][0]
              .id;

            setNombre((row as Agrupador)[FIELDS.AGRUPADORES.NOMBRE]);
            setTipoId(idAgrupador);
          }

          if (tab === "proyectos") {
            const p = row as Proyecto;
            setNombre(p[FIELDS.PROYECTOS.NOMBRE]);
            setDetalles(p[FIELDS.PROYECTOS.DETALLES]);
            setAgrupadorId(p[FIELDS.PROYECTOS.AGRUPADOR][0].id)
          }
          setOpen(true);
        }}
        onDelete={(row) => deleteMutation.mutate(row)}
        columns={
          tab === "tipos"
            ? [
                {
                  id: FIELDS.TIPOS.NOMBRE,
                  label: "Nombre",
                  render: (row) => (row as Tipo)[FIELDS.TIPOS.NOMBRE],
                },
              ]
            : tab === "agrupadores"
              ? [
                  {
                    id: FIELDS.AGRUPADORES.NOMBRE,
                    label: "Nombre",
                    render: (row) =>
                      (row as Agrupador)[FIELDS.AGRUPADORES.NOMBRE],
                  },
                  {
                    id: FIELDS.AGRUPADORES.TIPO,
                    label: "Tipo",
                    render: (row) =>
                      getLinkLabel((row as Agrupador)[FIELDS.AGRUPADORES.TIPO]),
                  },
                ]
              : [
                  {
                    id: FIELDS.PROYECTOS.NOMBRE,
                    label: "Nombre",
                    render: (row) => (row as Proyecto)[FIELDS.PROYECTOS.NOMBRE],
                  },
                  {
                    id: FIELDS.PROYECTOS.DETALLES,
                    label: "Detalles",
                    render: (row) =>
                      (row as Proyecto)[FIELDS.PROYECTOS.DETALLES],
                  },
                  {
                    id: FIELDS.PROYECTOS.AGRUPADOR,
                    label: "Agrupador",
                    render: (row) =>
                      getLinkLabel(
                        (row as Proyecto)[FIELDS.PROYECTOS.AGRUPADOR],
                      ),
                  },
                ]
        }
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingId ? "Editar" : "Nuevo"}{" "}
          {tab === "tipos"
            ? "tipo"
            : tab === "agrupadores"
              ? "agrupador"
              : "proyecto"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              fullWidth
              required
            />
            {tab === "proyectos" && (
              <TextField
                label="Detalles"
                value={detalles}
                onChange={(e) => setDetalles(e.target.value)}
                fullWidth
                multiline
                minRows={3}
              />
            )}
            {tab === "agrupadores" && (
              <TextField
                select
                label="Tipo"
                value={tipoId}
                onChange={(e) => setTipoId(Number(e.target.value))}
                fullWidth
              >
                {tipos?.results.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo[FIELDS.TIPOS.NOMBRE]}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {tab === "proyectos" && (
              <TextField
                select
                label="Agrupador"
                value={agrupadorId}
                onChange={(e) => setAgrupadorId(Number(e.target.value))}
                fullWidth
              >
                {agrupadores?.results.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item[FIELDS.AGRUPADORES.NOMBRE]}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!nombre || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
