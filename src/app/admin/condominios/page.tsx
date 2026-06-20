"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { Condominio } from "@/lib/baserow/types";
import { FIELDS, ROLES } from "@/lib/baserow/constants";
import { getLinkLabel } from "@/lib/baserow/utils";

export default function CondominiosPage() {
  const queryClient = useQueryClient();
  const { user } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Condominio | null>(null);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["condominios"],
    queryFn: () => fetchTable<Condominio>("condominios"),
  });

  useEffect(() => {
    if (editing) {
      setNombre(editing[FIELDS.CONDOMINIOS.NOMBRE] ?? "");
      setDireccion(editing[FIELDS.CONDOMINIOS.DIRECCION] ?? "");
    } else {
      setNombre("");
      setDireccion("");
    }
  }, [editing]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        [FIELDS.CONDOMINIOS.NOMBRE]: nombre,
        [FIELDS.CONDOMINIOS.DIRECCION]: direccion,
      };
      if (editing) {
        return updateTableRow<Condominio>("condominios", editing.id, payload);
      }
      return createTableRow<Condominio>("condominios", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["condominios"] });
      setOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (row: Condominio) => deleteTableRow("condominios", row.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["condominios"] }),
  });

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  return (
    <Stack spacing={2}>
      <CrudTable
        title="Condominios"
        rows={data?.results ?? []}
        loading={isLoading}
        error={error ? "Error al cargar condominios" : null}
        onCreate={() => {
          setEditing(null);
          setOpen(true);
        }}
        onEdit={(row) => {
          setEditing(row);
          setOpen(true);
        }}
        onDelete={(row) => deleteMutation.mutate(row)}
        columns={[
          {
            id: FIELDS.CONDOMINIOS.NOMBRE,
            label: "Nombre",
            render: (row) => row[FIELDS.CONDOMINIOS.NOMBRE] || "—",
          },
          {
            id: FIELDS.CONDOMINIOS.DIRECCION,
            label: "Dirección",
            render: (row) => row[FIELDS.CONDOMINIOS.DIRECCION] || "—",
          },
          {
            id: FIELDS.CONDOMINIOS.USUARIOS,
            label: "Usuarios",
            render: (row) => getLinkLabel(row[FIELDS.CONDOMINIOS.USUARIOS]),
          },
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Editar condominio" : "Nuevo condominio"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              fullWidth
            />
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
