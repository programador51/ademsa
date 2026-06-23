"use client";

import { Alert, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MobileCardList from "@/components/common/MobileCardList";
import { useApp } from "@/contexts/AppContext";
import { FIELDS, ROLE_LABELS, ROLES } from "@/lib/baserow/constants";
import { getLinkLabel, getSelectId } from "@/lib/baserow/utils";
import { useUsuariosModule } from "../UsuariosContext";
import UsuarioFormDialog from "./UsuarioFormDialog";

export default function UsuariosView() {
  const { user } = useApp();
  const {
    tab,
    setTab,
    usuarios,
    unidades,
    isLoading,
    openCreate,
    openEditUsuario,
    openEditUnidad,
    deleteRow,
  } = useUsuariosModule();

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Usuarios y unidades
      </Typography>

      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant={tab === "usuarios" ? "contained" : "outlined"}
          onClick={() => setTab("usuarios")}
        >
          Usuarios
        </Button>
        <Button
          size="small"
          variant={tab === "unidades" ? "contained" : "outlined"}
          onClick={() => setTab("unidades")}
        >
          Unidades
        </Button>
      </Stack>

      {tab === "usuarios" ? (
        <MobileCardList
          title="Usuarios"
          rows={usuarios}
          loading={isLoading}
          onEdit={openEditUsuario}
          onDelete={(row) => deleteRow(row.id)}
          deleteLabel={(row) => `al usuario "${row[FIELDS.USUARIOS.NOMBRE]}"`}
          headerAction={
            <Button size="small" startIcon={<AddIcon />} onClick={openCreate}>
              Nuevo
            </Button>
          }
          columns={[
            {
              id: FIELDS.USUARIOS.NOMBRE,
              label: "Nombre",
              primary: true,
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
            },
          ]}
        />
      ) : (
        <MobileCardList
          title="Unidades"
          rows={unidades}
          loading={isLoading}
          onEdit={openEditUnidad}
          onDelete={(row) => deleteRow(row.id)}
          deleteLabel={(row) =>
            `la unidad "${row[FIELDS.UNIDADES.NUMERO]} · ${row[FIELDS.UNIDADES.EDIFICIO]}"`
          }
          headerAction={
            <Button size="small" startIcon={<AddIcon />} onClick={openCreate}>
              Nuevo
            </Button>
          }
          columns={[
            {
              id: FIELDS.UNIDADES.NUMERO,
              label: "Número",
              primary: true,
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
              id: FIELDS.UNIDADES.CONDOMINIO,
              label: "Condominio",
              render: (row) => getLinkLabel(row[FIELDS.UNIDADES.CONDOMINIO]),
            },
          ]}
        />
      )}

      <UsuarioFormDialog />
    </Stack>
  );
}
