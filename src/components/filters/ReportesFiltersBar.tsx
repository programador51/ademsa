"use client";

import { MenuItem, Stack, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ProyectoHierarchyFiltersBar from "@/components/filters/ProyectoHierarchyFiltersBar";
import { REPORTE_ESTATUS_LABELS } from "@/lib/baserow/constants";
import { Agrupador, Proyecto, Tipo } from "@/lib/baserow/types";
import {
  AdminReportesFilters,
  defaultAdminReportesFilters,
} from "@/modules/reportes/filters";

interface ReportesFiltersBarProps {
  filters: AdminReportesFilters;
  onChange: (filters: AdminReportesFilters) => void;
  tipos: Tipo[];
  agrupadores: Agrupador[];
  proyectos: Proyecto[];
  useTicketLabels?: boolean;
}

export default function ReportesFiltersBar({
  filters,
  onChange,
  tipos,
  agrupadores,
  proyectos,
  useTicketLabels = false,
}: ReportesFiltersBarProps) {
  const fechaLabel = "Fecha ticket";

  return (
    <ProyectoHierarchyFiltersBar
      filters={filters}
      onChange={(hierarchy) => onChange({ ...filters, ...hierarchy })}
      tipos={tipos}
      agrupadores={agrupadores}
      proyectos={proyectos}
      extraFilters={
        <Stack spacing={1.5}>
          <TextField
            label={'Folio del ticket'}
            value={filters.registroId}
            onChange={(e) =>
              onChange({
                ...filters,
                registroId: e.target.value,
              })
            }
            fullWidth
            size="small"
            placeholder="Buscar por ID o folio"
          />
          <TextField
            select
            label="Estatus"
            value={filters.estatus}
            onChange={(e) =>
              onChange({
                ...filters,
                estatus: e.target.value ? Number(e.target.value) : "",
              })
            }
            fullWidth
            size="small"
          >
            <MenuItem value="">Todos los estatus</MenuItem>
            {Object.entries(REPORTE_ESTATUS_LABELS).map(([id, label]) => (
              <MenuItem key={id} value={Number(id)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <DatePicker
            label={`${fechaLabel} desde`}
            value={filters.fechaDesde ? dayjs(filters.fechaDesde) : null}
            onChange={(date) =>
              onChange({
                ...filters,
                fechaDesde: date ? date.format("YYYY-MM-DD") : "",
              })
            }
            slotProps={{ textField: { fullWidth: true, size: "small" } }}
          />
          <DatePicker
            label={`${fechaLabel} hasta`}
            value={filters.fechaHasta ? dayjs(filters.fechaHasta) : null}
            onChange={(date) =>
              onChange({
                ...filters,
                fechaHasta: date ? date.format("YYYY-MM-DD") : "",
              })
            }
            slotProps={{ textField: { fullWidth: true, size: "small" } }}
          />
        </Stack>
      }
    />
  );
}

export { defaultAdminReportesFilters };
