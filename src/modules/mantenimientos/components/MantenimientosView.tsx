"use client";

import { useState } from "react";
import { Alert, Button, MenuItem, Stack, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import MobileCardList from "@/components/common/MobileCardList";
import ProyectoHierarchyFiltersBar from "@/components/filters/ProyectoHierarchyFiltersBar";
import { useApp } from "@/contexts/AppContext";
import { confirmCloseCorrectivoTicket } from "@/lib/ui/alerts";
import { resolveProyectoHierarchy } from "@/lib/baserow/proyectoHierarchyUtils";
import { formatDateTime, formatFolio, formatMoney } from "@/lib/formatters";
import { FIELDS, MANT_CORRECTIVO_ESTATUS, ROLES } from "@/lib/baserow/constants";
import {
  MantenimientoCorrectivo,
  MantenimientoPreventivo,
} from "@/lib/baserow/types";
import {
  getCorrectivoDisplayDescription,
  getCorrectivoReporteFolios,
  hasPreventivoAnterior,
  isCorrectivoCerrado,
  useMantenimientos,
} from "../MantenimientosContext";
import MantenimientoFormDialog from "./MantenimientoFormDialog";
import PreventivoSeguimientoDialog from "./PreventivoSeguimientoDialog";

export default function MantenimientosView() {
  const { user } = useApp();
  const [seguimientoRowId, setSeguimientoRowId] = useState<number | null>(null);
  const {
    tipo,
    rows,
    isLoading,
    error,
    openCreate,
    openEdit,
    openFollowUp,
    deleteRow,
    closeCorrectivoTicket,
    isClosingCorrectivo,
    hierarchyFilters,
    setHierarchyFilters,
    correctivoFilters,
    setCorrectivoFilters,
    tipos,
    agrupadores,
    proyectos,
    reportesById,
    preventivosById,
  } = useMantenimientos();

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  const resolveHierarchy = (
    link:
      | MantenimientoPreventivo[typeof FIELDS.MANT_PREVENTIVOS.PROYECTO]
      | MantenimientoCorrectivo[typeof FIELDS.MANT_CORRECTIVOS.PROYECTO]
  ) => resolveProyectoHierarchy(link, agrupadores, proyectos, tipos);

  const handleCloseCorrectivoTicket = async (row: MantenimientoCorrectivo) => {
    const folio = formatFolio(row[FIELDS.MANT_CORRECTIVOS.FOLIO]);
    const confirmed = await confirmCloseCorrectivoTicket(
      `el ticket folio ${folio}`
    );
    if (!confirmed) return;
    await closeCorrectivoTicket(row);
  };

  const title =
    tipo === "preventivo"
      ? "Mantenimientos preventivos"
      : "Mantenimientos correctivos";

  if (tipo === "preventivo") {
    return (
      <Stack spacing={2}>
        <ProyectoHierarchyFiltersBar
          filters={hierarchyFilters}
          onChange={(hierarchy) =>
            setHierarchyFilters({ ...hierarchyFilters, ...hierarchy })
          }
          tipos={tipos}
          agrupadores={agrupadores}
          proyectos={proyectos}
          extraFilters={
            <TextField
              label="Folio"
              value={hierarchyFilters.folio}
              onChange={(e) =>
                setHierarchyFilters({
                  ...hierarchyFilters,
                  folio: e.target.value,
                })
              }
              fullWidth
              size="small"
              placeholder="Buscar por folio"
            />
          }
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
          renderRowActions={(row) => (
            <Stack spacing={1}>
              {hasPreventivoAnterior(row) && (
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  startIcon={<HistoryIcon />}
                  onClick={() => setSeguimientoRowId(row.id)}
                >
                  Consultar seguimiento
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => openFollowUp(row)}
              >
                Siguiente mantenimiento
              </Button>
            </Stack>
          )}
          columns={[
            {
              id: FIELDS.MANT_PREVENTIVOS.FOLIO,
              label: "Folio",
              primary: true,
              render: (row) => formatFolio(row[FIELDS.MANT_PREVENTIVOS.FOLIO]),
            },
            {
              id: FIELDS.MANT_PREVENTIVOS.ESTADO,
              label: "Estado",
              render: (row) => row[FIELDS.MANT_PREVENTIVOS.ESTADO] ?? "—",
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
            {
              id: FIELDS.MANT_PREVENTIVOS.APLICADO_EL,
              label: "Aplicado el",
              render: (row) =>
                formatDateTime(row[FIELDS.MANT_PREVENTIVOS.APLICADO_EL]),
            },
          ]}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <PreventivoSeguimientoDialog
          open={seguimientoRowId != null}
          rowId={seguimientoRowId}
          onClose={() => setSeguimientoRowId(null)}
          preventivosById={preventivosById}
          tipos={tipos}
          agrupadores={agrupadores}
          proyectos={proyectos}
        />
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
          <Stack spacing={1.5}>
            <TextField
              label="Folio"
              value={correctivoFilters.folio}
              onChange={(e) =>
                setCorrectivoFilters({
                  ...correctivoFilters,
                  folio: e.target.value,
                })
              }
              fullWidth
              size="small"
              placeholder="Buscar por folio"
            />
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
          </Stack>
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
        renderRowActions={(row) =>
          !isCorrectivoCerrado(row) ? (
            <Button
              size="small"
              variant="contained"
              fullWidth
              onClick={() => void handleCloseCorrectivoTicket(row)}
              disabled={isClosingCorrectivo}
            >
              Cerrar ticket
            </Button>
          ) : null
        }
        columns={[
          {
            id: FIELDS.MANT_CORRECTIVOS.FOLIO,
            label: "Folio",
            primary: true,
            render: (row) => formatFolio(row[FIELDS.MANT_CORRECTIVOS.FOLIO]),
          },
          {
            id: FIELDS.MANT_CORRECTIVOS.REPORTES,
            label: "Nº ticket",
            render: (row) => getCorrectivoReporteFolios(row),
          },
          {
            id: FIELDS.MANT_CORRECTIVOS.DESCRIPCION,
            label: "Descripción",
            render: (row) => getCorrectivoDisplayDescription(row, reportesById),
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
          {
            id: FIELDS.MANT_CORRECTIVOS.NOTAS,
            label: "Notas",
            render: (row) => row[FIELDS.MANT_CORRECTIVOS.NOTAS]?.trim() || "—",
          },
        ]}
      />
      {error && <Alert severity="error">{error}</Alert>}
      <MantenimientoFormDialog />
    </Stack>
  );
}
