"use client";

import { Alert, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MobileCardList from "@/components/common/MobileCardList";
import ProyectoHierarchyFiltersBar from "@/components/filters/ProyectoHierarchyFiltersBar";
import { useApp } from "@/contexts/AppContext";
import { resolveProyectoHierarchy } from "@/lib/baserow/proyectoHierarchyUtils";
import { formatDateTime, formatFolio, formatMoney } from "@/lib/formatters";
import { FIELDS, ROLES } from "@/lib/baserow/constants";
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
    tipos,
    agrupadores,
    proyectos,
  } = useMantenimientos();

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  const resolveHierarchy = (
    link: MantenimientoPreventivo[typeof FIELDS.MANT_PREVENTIVOS.PROYECTO]
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
    <>
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
              resolveProyectoHierarchy(
                row[FIELDS.MANT_CORRECTIVOS.PROYECTO],
                agrupadores,
                proyectos,
                tipos
              ).tipoNombre,
          },
          {
            id: "agrupador",
            label: "Nivel 2 · Agrupador",
            render: (row) =>
              resolveProyectoHierarchy(
                row[FIELDS.MANT_CORRECTIVOS.PROYECTO],
                agrupadores,
                proyectos,
                tipos
              ).agrupadorNombre,
          },
          {
            id: FIELDS.MANT_CORRECTIVOS.PROYECTO,
            label: "Nivel 3 · Proyecto",
            render: (row) =>
              resolveProyectoHierarchy(
                row[FIELDS.MANT_CORRECTIVOS.PROYECTO],
                agrupadores,
                proyectos,
                tipos
              ).proyectoNombre,
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
    </>
  );
}
