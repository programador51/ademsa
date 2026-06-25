"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import ImageIcon from "@mui/icons-material/Image";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ReportesFiltersBar from "@/components/filters/ReportesFiltersBar";
import { useApp } from "@/contexts/AppContext";
import { formatDateTime, formatFolio } from "@/lib/formatters";
import {
  FIELDS,
  REPORTE_ESTATUS,
  REPORTE_ESTATUS_LABELS,
  ROLES,
} from "@/lib/baserow/constants";
import { BaserowFile, Reporte } from "@/lib/baserow/types";
import { getLinkIds, getLinkLabel, getSelectId } from "@/lib/baserow/utils";
import Swal from "sweetalert2";
import { reportHasMantenimiento, resolveReporteHierarchy } from "../filters";
import {
  isReporteCerrado,
  useAdminReportes,
} from "../AdminReportesContext";

export default function AdminReportesView() {
  const { user } = useApp();
  const {
    reportes,
    filters,
    setFilters,
    tipos,
    agrupadores,
    proyectos,
    isLoading,
    updateReporte,
    createCorrectivoFromReporte,
    isUpdating,
    isCreatingCorrectivo,
  } = useAdminReportes();

  if (user?.rol !== ROLES.ADMINISTRADOR) {
    return <Alert severity="error">Acceso no autorizado</Alert>;
  }

  const handleToggleStatus = async (reporte: Reporte) => {
    const cerrado = isReporteCerrado(reporte);
    const mantenimientoId = getLinkIds(reporte[FIELDS.REPORTES.MANTENIMIENTO])[0] ?? null;
    if (cerrado) {
      await updateReporte({
        id: reporte.id,
        estatus: REPORTE_ESTATUS.ABIERTA,
        fechaCierre: null,
        mantenimientoId,
      });
      return;
    }
    await updateReporte({
      id: reporte.id,
      estatus: REPORTE_ESTATUS.CERRADA,
      fechaCierre: new Date().toISOString(),
      mantenimientoId,
    });
  };

  const handleCreateCorrectivo = async (reporte: Reporte) => {
    try {
      await createCorrectivoFromReporte(reporte);
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "No se pudo crear el mantenimiento",
        text:
          error instanceof Error
            ? error.message
            : "Verifica que el reporte tenga un agrupador con proyecto vinculado.",
      });
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Reportes de residentes
      </Typography>

      <ReportesFiltersBar
        filters={filters}
        onChange={setFilters}
        tipos={tipos}
        agrupadores={agrupadores}
        proyectos={proyectos}
      />

      {isLoading ? (
        <Typography color="text.secondary">Cargando...</Typography>
      ) : reportes.length === 0 ? (
        <Typography color="text.secondary">Sin reportes</Typography>
      ) : (
        reportes.map((reporte) => {
          const estatusId = getSelectId(reporte[FIELDS.REPORTES.ESTATUS]);
          const cerrado = isReporteCerrado(reporte);
          const tieneMantenimiento = reportHasMantenimiento(reporte);
          const imagenes = reporte[FIELDS.REPORTES.IMAGENES] ?? [];
          const hierarchy = resolveReporteHierarchy(
            reporte,
            agrupadores,
            proyectos,
            tipos
          );

          return (
            <Card key={reporte.id} variant="outlined">
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Stack spacing={1.5}>
                  <Typography variant="caption" color="text.secondary">
                    Folio {formatFolio(reporte.id)}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {reporte[FIELDS.REPORTES.DESCRIPCION]}
                  </Typography>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Fecha reporte
                    </Typography>
                    <Typography variant="body2">
                      {formatDateTime(reporte[FIELDS.REPORTES.FECHA_REPORTE])}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Nivel 1 · Tipo
                    </Typography>
                    <Typography variant="body2">{hierarchy.tipoNombre}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Nivel 2 · Agrupador
                    </Typography>
                    <Typography variant="body2">
                      {hierarchy.agrupadorNombre}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Nivel 3 · Proyecto
                    </Typography>
                    <Typography variant="body2">{hierarchy.proyectoNombre}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Reportado por
                    </Typography>
                    <Typography variant="body2">
                      {getLinkLabel(reporte[FIELDS.REPORTES.REPORTADO_POR])}
                    </Typography>
                  </Box>

                  <TextField
                    select
                    label="Estatus"
                    value={estatusId ?? REPORTE_ESTATUS.ABIERTA}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      void updateReporte({
                        id: reporte.id,
                        estatus: next,
                        fechaCierre:
                          next === REPORTE_ESTATUS.CERRADA
                            ? reporte[FIELDS.REPORTES.FECHA_CIERRE] ??
                              new Date().toISOString()
                            : null,
                        mantenimientoId:
                          getLinkIds(reporte[FIELDS.REPORTES.MANTENIMIENTO])[0] ??
                          null,
                      });
                    }}
                    size="small"
                    fullWidth
                    disabled={isUpdating}
                  >
                    {Object.entries(REPORTE_ESTATUS_LABELS).map(([id, label]) => (
                      <MenuItem key={id} value={Number(id)}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <DatePicker
                    label="Fecha de cierre"
                    disabled={!cerrado || isUpdating}
                    value={
                      reporte[FIELDS.REPORTES.FECHA_CIERRE]
                        ? dayjs(reporte[FIELDS.REPORTES.FECHA_CIERRE])
                        : null
                    }
                    onChange={(date) => {
                      if (!date) return;
                      void updateReporte({
                        id: reporte.id,
                        estatus: REPORTE_ESTATUS.CERRADA,
                        fechaCierre: date.toISOString(),
                        mantenimientoId:
                          getLinkIds(reporte[FIELDS.REPORTES.MANTENIMIENTO])[0] ??
                          null,
                      });
                    }}
                    slotProps={{
                      textField: { fullWidth: true, size: "small" },
                    }}
                  />

                  {imagenes.length > 0 && (
                    <Stack spacing={0.75}>
                      <Typography variant="caption" color="text.secondary">
                        Imágenes adjuntas
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        {imagenes.map((image, index) => (
                          <ReportImageButton
                            key={`${image.url}-${index}`}
                            image={image}
                            index={index}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  )}

                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => void handleToggleStatus(reporte)}
                      disabled={isUpdating}
                    >
                      {cerrado ? "Reabrir reporte" : "Cerrar reporte"}
                    </Button>
                    {!cerrado && !tieneMantenimiento && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<BuildIcon />}
                        onClick={() => void handleCreateCorrectivo(reporte)}
                        disabled={isCreatingCorrectivo}
                      >
                        Crear mant. correctivo
                      </Button>
                    )}
                    {tieneMantenimiento && (
                      <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
                        Ya tiene mantenimiento correctivo vinculado
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })
      )}
    </Stack>
  );
}

function ReportImageButton({
  image,
  index,
}: {
  image: BaserowFile;
  index: number;
}) {
  const label = image.name?.trim() || `Imagen ${index + 1}`;

  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={<ImageIcon />}
      component="a"
      href={image.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </Button>
  );
}
