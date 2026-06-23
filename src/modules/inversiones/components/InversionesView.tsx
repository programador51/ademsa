"use client";

import { Alert, Button, MenuItem, Stack, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MobileCardList from "@/components/common/MobileCardList";
import ProyectoHierarchyFiltersBar from "@/components/filters/ProyectoHierarchyFiltersBar";
import { useApp } from "@/contexts/AppContext";
import { resolveProyectoHierarchy } from "@/lib/baserow/proyectoHierarchyUtils";
import { formatDateTime, formatFolio, formatMoney } from "@/lib/formatters";
import {
  ESTATUS_LABELS,
  FIELDS,
  INVERSION_ESTATUS,
  ROLES,
} from "@/lib/baserow/constants";
import { getSelectId } from "@/lib/baserow/utils";
import { useInversiones } from "../InversionesContext";
import InversionFormDialog from "./InversionFormDialog";

export default function InversionesView() {
  const { user } = useApp();
  const {
    rows,
    filters,
    setFilters,
    tipos,
    agrupadores,
    proyectos,
    isLoading,
    error,
    openCreate,
    openEdit,
    deleteInversion,
  } = useInversiones();

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  const resolveHierarchy = (proyectoLink: (typeof rows)[0][typeof FIELDS.INVERSIONES.PROYECTO]) =>
    resolveProyectoHierarchy(proyectoLink, agrupadores, proyectos, tipos);

  return (
    <Stack spacing={2}>
      <ProyectoHierarchyFiltersBar
        filters={filters}
        onChange={(hierarchy) => setFilters({ ...filters, ...hierarchy })}
        tipos={tipos}
        agrupadores={agrupadores}
        proyectos={proyectos}
        extraFilters={
          <TextField
            select
            label="Estatus"
            value={filters.estatus}
            onChange={(e) =>
              setFilters({
                ...filters,
                estatus: e.target.value ? Number(e.target.value) : "",
              })
            }
            fullWidth
            size="small"
          >
            <MenuItem value="">Todos los estatus</MenuItem>
            {Object.entries(INVERSION_ESTATUS).map(([, value]) => (
              <MenuItem key={value} value={value}>
                {ESTATUS_LABELS[value]}
              </MenuItem>
            ))}
          </TextField>
        }
      />

      <MobileCardList
        title="Inversiones"
        rows={rows}
        loading={isLoading}
        onEdit={openEdit}
        onDelete={(row) => deleteInversion(row)}
        deleteLabel={(row) =>
          `la inversión folio ${formatFolio(row[FIELDS.INVERSIONES.FOLIO])}`
        }
        headerAction={
          <Button size="small" startIcon={<AddIcon />} onClick={openCreate}>
            Nuevo
          </Button>
        }
        columns={[
          {
            id: FIELDS.INVERSIONES.FOLIO,
            label: "Folio",
            primary: true,
            render: (row) => formatFolio(row[FIELDS.INVERSIONES.FOLIO]),
          },
          {
            id: FIELDS.INVERSIONES.FECHA,
            label: "Fecha",
            render: (row) => formatDateTime(row[FIELDS.INVERSIONES.FECHA]),
          },
          {
            id: "tipo",
            label: "Nivel 1 · Tipo",
            render: (row) =>
              resolveHierarchy(row[FIELDS.INVERSIONES.PROYECTO]).tipoNombre,
          },
          {
            id: "agrupador",
            label: "Nivel 2 · Agrupador",
            render: (row) =>
              resolveHierarchy(row[FIELDS.INVERSIONES.PROYECTO]).agrupadorNombre,
          },
          {
            id: FIELDS.INVERSIONES.PROYECTO,
            label: "Nivel 3 · Proyecto",
            render: (row) =>
              resolveHierarchy(row[FIELDS.INVERSIONES.PROYECTO]).proyectoNombre,
          },
          {
            id: FIELDS.INVERSIONES.PRESUPUESTO,
            label: "Presupuesto",
            render: (row) => formatMoney(row[FIELDS.INVERSIONES.PRESUPUESTO]),
          },
          {
            id: FIELDS.INVERSIONES.INGRESO,
            label: "Ingreso recibido",
            render: (row) => formatMoney(row[FIELDS.INVERSIONES.INGRESO]),
          },
          {
            id: FIELDS.INVERSIONES.EJERCIDO,
            label: "Ejercido",
            render: (row) => formatMoney(row[FIELDS.INVERSIONES.EJERCIDO]),
          },
          {
            id: FIELDS.INVERSIONES.ESTATUS,
            label: "Estatus",
            render: (row) => {
              const id = getSelectId(row[FIELDS.INVERSIONES.ESTATUS]);
              return id ? ESTATUS_LABELS[id] ?? "—" : "—";
            },
          },
        ]}
      />
      {error && <Alert severity="error">{error}</Alert>}
      <InversionFormDialog />
    </Stack>
  );
}
