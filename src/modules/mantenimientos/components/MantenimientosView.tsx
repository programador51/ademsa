"use client";

import { Alert, Button, MenuItem, Stack, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MobileCardList from "@/components/common/MobileCardList";
import ProyectoHierarchyFiltersBar from "@/components/filters/ProyectoHierarchyFiltersBar";
import { useApp } from "@/contexts/AppContext";
import { resolveProyectoHierarchy } from "@/lib/baserow/proyectoHierarchyUtils";
import { formatDateTime, formatFolio, formatMoney } from "@/lib/formatters";
import { FIELDS, MANT_CORRECTIVO_ESTATUS, ROLES } from "@/lib/baserow/constants";
import {
  MantenimientoCorrectivo,
  MantenimientoPreventivo,
} from "@/lib/baserow/types";
import { useMantenimientos } from "../MantenimientosContext";
import MantenimientoFormDialog from "./MantenimientoFormDialog";

export default function MantenimientosView() {
  const { user } = useApp();
  const {
    tipo,
    rows,
    isLoading,
    error,
    openCreate,
    openEdit,
    deleteRow,
    hierarchyFilters,
    setHierarchyFilters,
    correctivoFilters,
    setCorrectivoFilters,
    tipos,
    agrupadores,
    proyectos,
  } = useMantenimientos();

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  const resolveHierarchy = (
    link:
      | MantenimientoPreventivo[typeof FIELDS.MANT_PREVENTIVOS.PROYECTO]
      | MantenimientoCorrectivo[typeof FIELDS.MANT_CORRECTIVOS.PROYECTO]
  ) => resolveProyectoHierarchy(link, agrupadores, proyectos, tipos);

  const title =
    tipo === "preventivo"
      ? "Mantenimientos preventivos"
      : "Mantenimientos correctivos";

  if (tipo === "preventivo") {
    return (
      <Stack spacing={2}>
        <ProyectoHierarchyFiltersBar
          filters={hierarchyFilters}
          onChange={setHierarchyFilters}
          tipos={tipos}
          agrupadores={agrupadores}
          proyectos={proyectos}
        />
        <MobileCardList<MantenimientoPreventivo>
          title={title}
          rows={rows as MantenimientoPreventivo[]}
          loading={isLoading}
          onEdit={openEdit}
          onDelete={(row) => deleteRow(row)}
          deleteLabel={(row) =>
            `el mantenimiento preventivo folio ${formatFolio(row[FIELDS.MANT_PREVENTIVOS.FOLIO])}`
          }
          headerAction={
            <Button size="small" startIcon={<AddIcon />} onClick={openCreate}>
              Nuevo
            </Button>
          }
          columns={[
            {
              id: FIELDS.MANT_PREVENTIVOS.FOLIO,
              label: "Folio",
              primary: true,
              render: (row) => formatFolio(row[FIELDS.MANT_PREVENTIVOS.FOLIO]),
            },
            {
              id: "tipo",
              label: "Nivel 1 · Tipo",
              render: (row) =>
                resolveHierarchy(row[FIELDS.MANT_PREVENTIVOS.PROYECTO]).tipoNombre,
            },
            {
              id: "agrupador",
              label: "Nivel 2 · Agrupador",
              render: (row) =>
                resolveHierarchy(row[FIELDS.MANT_PREVENTIVOS.PROYECTO])
                  .agrupadorNombre,
            },
            {
              id: FIELDS.MANT_PREVENTIVOS.PROYECTO,
              label: "Nivel 3 · Proyecto",
              render: (row) =>
                resolveHierarchy(row[FIELDS.MANT_PREVENTIVOS.PROYECTO])
                  .proyectoNombre,
            },
            {
              id: FIELDS.MANT_PREVENTIVOS.ULTIMO,
              label: "Último",
              render: (row) => formatDateTime(row[FIELDS.MANT_PREVENTIVOS.ULTIMO]),
            },
            {
              id: FIELDS.MANT_PREVENTIVOS.SIGUIENTE,
              label: "Siguiente",
              render: (row) =>
                formatDateTime(row[FIELDS.MANT_PREVENTIVOS.SIGUIENTE]),
            },
          ]}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <MantenimientoFormDialog />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <ProyectoHierarchyFiltersBar
        filters={correctivoFilters}
        onChange={(hierarchy) =>
          setCorrectivoFilters({ ...correctivoFilters, ...hierarchy })
        }
        tipos={tipos}
        agrupadores={agrupadores}
        proyectos={proyectos}
        extraFilters={
          <TextField
            select
            label="Estatus"
            value={correctivoFilters.estatus}
            onChange={(e) =>
              setCorrectivoFilters({
                ...correctivoFilters,
                estatus: e.target.value,
              })
            }
            fullWidth
            size="small"
          >
            <MenuItem value="">Todos los estatus</MenuItem>
            {Object.values(MANT_CORRECTIVO_ESTATUS).map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        }
      />
      <MobileCardList<MantenimientoCorrectivo>
        title={title}
        rows={rows as MantenimientoCorrectivo[]}
        loading={isLoading}
        onEdit={openEdit}
        onDelete={(row) => deleteRow(row)}
        deleteLabel={(row) =>
          `el mantenimiento correctivo folio ${formatFolio(row[FIELDS.MANT_CORRECTIVOS.FOLIO])}`
        }
        headerAction={
          <Button size="small" startIcon={<AddIcon />} onClick={openCreate}>
            Nuevo
          </Button>
        }
        columns={[
          {
            id: FIELDS.MANT_CORRECTIVOS.FOLIO,
            label: "Folio",
            primary: true,
            render: (row) => formatFolio(row[FIELDS.MANT_CORRECTIVOS.FOLIO]),
          },
          {
            id: "tipo",
            label: "Nivel 1 · Tipo",
            render: (row) =>
              resolveHierarchy(row[FIELDS.MANT_CORRECTIVOS.PROYECTO]).tipoNombre,
          },
          {
            id: "agrupador",
            label: "Nivel 2 · Agrupador",
            render: (row) =>
              resolveHierarchy(row[FIELDS.MANT_CORRECTIVOS.PROYECTO])
                .agrupadorNombre,
          },
          {
            id: FIELDS.MANT_CORRECTIVOS.PROYECTO,
            label: "Nivel 3 · Proyecto",
            render: (row) =>
              resolveHierarchy(row[FIELDS.MANT_CORRECTIVOS.PROYECTO])
                .proyectoNombre,
          },
          {
            id: FIELDS.MANT_CORRECTIVOS.FECHA_REPORTE,
            label: "Fecha reporte",
            render: (row) =>
              formatDateTime(row[FIELDS.MANT_CORRECTIVOS.FECHA_REPORTE]),
          },
          {
            id: FIELDS.MANT_CORRECTIVOS.FECHA_CORRECCION,
            label: "Fecha corrección",
            render: (row) =>
              formatDateTime(row[FIELDS.MANT_CORRECTIVOS.FECHA_CORRECCION]),
          },
          {
            id: FIELDS.MANT_CORRECTIVOS.ESTATUS,
            label: "Estatus",
            render: (row) => row[FIELDS.MANT_CORRECTIVOS.ESTATUS] ?? "—",
          },
          {
            id: FIELDS.MANT_CORRECTIVOS.PRESUPUESTO,
            label: "Presupuesto",
            render: (row) => formatMoney(row[FIELDS.MANT_CORRECTIVOS.PRESUPUESTO]),
          },
          {
            id: FIELDS.MANT_CORRECTIVOS.EJERCIDO,
            label: "Ejercido",
            render: (row) => formatMoney(row[FIELDS.MANT_CORRECTIVOS.EJERCIDO]),
          },
        ]}
      />
      {error && <Alert severity="error">{error}</Alert>}
      <MantenimientoFormDialog />
    </Stack>
  );
}
