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
import { FIELDS, ROLE_LABELS, ROLES } from "@/lib/baserow/constants";
import { Unidad, Usuario, Condominio } from "@/lib/baserow/types";
import { getLinkIds, getLinkLabel, getSelectId } from "@/lib/baserow/utils";

export default function UsuariosPage() {
  const queryClient = useQueryClient();
  const { user, condominioId } = useApp();
  const [tab, setTab] = useState<"usuarios" | "unidades">("usuarios");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<number | "">("");
  const [password, setPassword] = useState("");
  const [condominiosSel, setCondominiosSel] = useState<number[]>([]);
  const [unidadesSel, setUnidadesSel] = useState<number[]>([]);
  const [numeroUnidad, setNumeroUnidad] = useState("");
  const [edificio, setEdificio] = useState("");
  const [indiviso, setIndiviso] = useState("");
  const [propietarioId, setPropietarioId] = useState<number | "">("");

  const { data: usuarios } = useQuery({
    queryKey: ["usuarios-admin"],
    queryFn: () => fetchTable<Usuario>("usuarios"),
  });

  const unidadFilter = useMemo(
    () =>
      condominioId
        ? buildCondominioFilter(condominioId, FIELDS.UNIDADES.CONDOMINIO)
        : undefined,
    [condominioId]
  );

  const { data: unidades } = useQuery({
    queryKey: ["unidades", condominioId],
    queryFn: () =>
      fetchTable<Unidad>("unidades", unidadFilter ? { filters: unidadFilter } : undefined),
    enabled: !!condominioId,
  });

  const { data: condominios } = useQuery({
    queryKey: ["condominios-select"],
    queryFn: () => fetchTable<Condominio>("condominios"),
  });

  useEffect(() => {
    if (!open) {
      setNombre("");
      setEmail("");
      setRol("");
      setPassword("");
      setCondominiosSel([]);
      setUnidadesSel([]);
      setNumeroUnidad("");
      setEdificio("");
      setIndiviso("");
      setPropietarioId("");
      setEditingId(null);
    }
  }, [open, tab]);

  const saveUsuarioMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        [FIELDS.USUARIOS.NOMBRE]: nombre,
        [FIELDS.USUARIOS.EMAIL]: email,
        ...(rol ? { [FIELDS.USUARIOS.ROL]: rol } : {}),
        [FIELDS.USUARIOS.CONDOMINIOS]: condominiosSel,
        [FIELDS.USUARIOS.UNIDADES]: unidadesSel,
      };
      if (password) payload[FIELDS.USUARIOS.CONTRASENA] = password;
      if (editingId) return updateTableRow("usuarios", editingId, payload);
      return createTableRow("usuarios", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios-admin"] });
      setOpen(false);
    },
  });

  const saveUnidadMutation = useMutation({
    mutationFn: async () => {
      if (!condominioId) throw new Error("Condominio requerido");
      const payload: Record<string, unknown> = {
        [FIELDS.UNIDADES.NUMERO]: numeroUnidad,
        [FIELDS.UNIDADES.EDIFICIO]: edificio,
        [FIELDS.UNIDADES.INDIVISO]: indiviso || null,
        [FIELDS.UNIDADES.CONDOMINIO]: [condominioId],
        ...(propietarioId ? { [FIELDS.UNIDADES.PROPIETARIO]: [propietarioId] } : {}),
      };
      if (editingId) return updateTableRow("unidades", editingId, payload);
      return createTableRow("unidades", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades", condominioId] });
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (row: { id: number }) => {
      await deleteTableRow(tab === "usuarios" ? "usuarios" : "unidades", row.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tab === "usuarios" ? "usuarios-admin" : "unidades"] });
    },
  });

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Usuarios y unidades
      </Typography>

      <Stack direction="row" spacing={1}>
        <Button variant={tab === "usuarios" ? "contained" : "outlined"} onClick={() => setTab("usuarios")}>
          Usuarios
        </Button>
        <Button variant={tab === "unidades" ? "contained" : "outlined"} onClick={() => setTab("unidades")}>
          Unidades
        </Button>
      </Stack>

      {tab === "usuarios" ? (
        <CrudTable
          title="Usuarios"
          rows={usuarios?.results ?? []}
          onCreate={() => setOpen(true)}
          onEdit={(row) => {
            setEditingId(row.id);
            setNombre(row[FIELDS.USUARIOS.NOMBRE]);
            setEmail(row[FIELDS.USUARIOS.EMAIL]);
            setRol(getSelectId(row[FIELDS.USUARIOS.ROL]) ?? "");
            setCondominiosSel(getLinkIds(row[FIELDS.USUARIOS.CONDOMINIOS]));
            setUnidadesSel(getLinkIds(row[FIELDS.USUARIOS.UNIDADES]));
            setOpen(true);
          }}
          onDelete={(row) => deleteMutation.mutate(row)}
          columns={[
            {
              id: FIELDS.USUARIOS.NOMBRE,
              label: "Nombre",
              render: (row) => row[FIELDS.USUARIOS.NOMBRE],
            },
            {
              id: FIELDS.USUARIOS.EMAIL,
              label: "Email",
              render: (row) => row[FIELDS.USUARIOS.EMAIL],
            },
            {
              id: FIELDS.USUARIOS.ROL,
              label: "Rol",
              render: (row) => {
                const id = getSelectId(row[FIELDS.USUARIOS.ROL]);
                return id ? ROLE_LABELS[id] ?? "—" : "—";
              },
            }            
          ]}
        />
      ) : (
        <CrudTable
          title="Unidades"
          rows={unidades?.results ?? []}
          onCreate={() => setOpen(true)}
          onEdit={(row) => {
            setEditingId(row.id);
            setNumeroUnidad(row[FIELDS.UNIDADES.NUMERO]);
            setEdificio(row[FIELDS.UNIDADES.EDIFICIO]);
            setIndiviso(row[FIELDS.UNIDADES.INDIVISO] ?? "");
            setPropietarioId(row[FIELDS.UNIDADES.PROPIETARIO]?.[0]?.id ?? "");
            setOpen(true);
          }}
          onDelete={(row) => deleteMutation.mutate(row)}
          columns={[
            {
              id: FIELDS.UNIDADES.NUMERO,
              label: "Número",
              render: (row) => row[FIELDS.UNIDADES.NUMERO],
            },
            {
              id: FIELDS.UNIDADES.EDIFICIO,
              label: "Edificio",
              render: (row) => row[FIELDS.UNIDADES.EDIFICIO],
            },
            {
              id: FIELDS.UNIDADES.INDIVISO,
              label: "Indiviso %",
              render: (row) => row[FIELDS.UNIDADES.INDIVISO] ?? "—",
            },
            {
              id: FIELDS.UNIDADES.PROPIETARIO,
              label: "Propietario",
              render: (row) => getLinkLabel(row[FIELDS.UNIDADES.PROPIETARIO]),
            },
            {
              id:FIELDS.CONDOMINIOS.NOMBRE,
              label:'Condominio',
              render:(row)=>getLinkLabel(row[FIELDS.UNIDADES.CONDOMINIO])
            }
          ]}
        />
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingId ? "Editar" : "Nuevo"} {tab === "usuarios" ? "usuario" : "unidad"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {tab === "usuarios" ? (
              <>
                <TextField label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} fullWidth required />
                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
                <TextField select label="Rol" value={rol} onChange={(e) => setRol(Number(e.target.value))} fullWidth>
                  {Object.entries(ROLES).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {ROLE_LABELS[value]}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label={editingId ? "Nueva contraseña (opcional)" : "Contraseña"}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required={!editingId}
                />
                <TextField
                  select
                  label="Condominios"
                  value={condominiosSel[0] ?? ""}
                  onChange={(e) => setCondominiosSel([Number(e.target.value)])}
                  fullWidth
                >
                  {condominios?.results.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c[FIELDS.CONDOMINIOS.NOMBRE] ?? `Condominio #${c.id}`}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Unidad"
                  value={unidadesSel[0] ?? ""}
                  onChange={(e) => setUnidadesSel([Number(e.target.value)])}
                  fullWidth
                >
                  {unidades?.results.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u[FIELDS.UNIDADES.NUMERO]} · {u[FIELDS.UNIDADES.EDIFICIO]}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            ) : (
              <>
                <TextField label="Número de unidad" value={numeroUnidad} onChange={(e) => setNumeroUnidad(e.target.value)} fullWidth required />
                <TextField label="Edificio" value={edificio} onChange={(e) => setEdificio(e.target.value)} fullWidth required />
                <TextField label="Indiviso %" type="number" value={indiviso} onChange={(e) => setIndiviso(e.target.value)} fullWidth />
                <TextField select label="Propietario" value={propietarioId} onChange={(e) => setPropietarioId(Number(e.target.value))} fullWidth>
                  {usuarios?.results.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u[FIELDS.USUARIOS.NOMBRE]}
                    </MenuItem>
                  ))}
                </TextField>
                
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={
              tab === "usuarios"
                ? saveUsuarioMutation.isPending
                : saveUnidadMutation.isPending
            }
            onClick={() =>
              tab === "usuarios"
                ? saveUsuarioMutation.mutate()
                : saveUnidadMutation.mutate()
            }
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
