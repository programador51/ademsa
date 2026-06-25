"use client";

import { Alert, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MobileCardList from "@/components/common/MobileCardList";
import { useApp } from "@/contexts/AppContext";
import { FIELDS, ROLES } from "@/lib/baserow/constants";
import { useCondominios } from "../CondominiosContext";
import CondominioFormDialog from "./CondominioFormDialog";

export default function CondominiosView() {
  const { user } = useApp();
  const {
    rows,
    isLoading,
    error,
    openCreate,
    openEdit,
    deleteCondominio,
  } = useCondominios();

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  return (
    <>
      <MobileCardList
        title="Condominios"
        rows={rows}
        loading={isLoading}
        onEdit={openEdit}
        onDelete={(row) => deleteCondominio(row)}
        deleteLabel={(row) =>
          `el condominio "${row[FIELDS.CONDOMINIOS.NOMBRE] ?? `#${row.id}`}"`
        }
        headerAction={
          <Button size="small" startIcon={<AddIcon />} onClick={openCreate}>
            Nuevo
          </Button>
        }
        columns={[
          {
            id: FIELDS.CONDOMINIOS.NOMBRE,
            label: "Nombre",
            primary: true,
            render: (row) => row[FIELDS.CONDOMINIOS.NOMBRE] || "—",
          },
          {
            id: FIELDS.CONDOMINIOS.DIRECCION,
            label: "Dirección",
            render: (row) => row[FIELDS.CONDOMINIOS.DIRECCION] || "—",
          },
        ]}
      />
      {error && <Alert severity="error">{error}</Alert>}
      <CondominioFormDialog />
    </>
  );
}
