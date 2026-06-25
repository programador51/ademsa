import { FIELDS, REPORTE_ESTATUS } from "@/lib/baserow/constants";
import { rowBelongsToCondominio } from "@/lib/baserow/condominioFilters";
import {
  ProyectoHierarchyFilters,
  defaultProyectoHierarchyFilters,
} from "@/lib/baserow/proyectoHierarchyUtils";
import { Agrupador, Proyecto, Reporte, Tipo } from "@/lib/baserow/types";
import { getLinkIds, getSelectId } from "@/lib/baserow/utils";

export interface AdminReportesFilters extends ProyectoHierarchyFilters {
  estatus: number | "";
  fechaDesde: string;
  fechaHasta: string;
}

export type ReportesFilters = AdminReportesFilters;

export const defaultAdminReportesFilters: AdminReportesFilters = {
  ...defaultProyectoHierarchyFilters,
  estatus: "",
  fechaDesde: "",
  fechaHasta: "",
};

export function resolveReporteHierarchy(
  reporte: Reporte,
  agrupadores: Agrupador[],
  proyectos: Proyecto[],
  tipos: Tipo[]
) {
  const agrupadorId = getLinkIds(reporte[FIELDS.REPORTES.AGRUPADORES])[0] ?? null;
  const agrupador = agrupadorId
    ? agrupadores.find((row) => row.id === agrupadorId)
    : undefined;
  const tipoId = agrupador
    ? getLinkIds(agrupador[FIELDS.AGRUPADORES.TIPO])[0] ?? null
    : null;
  const tipo = tipoId ? tipos.find((row) => row.id === tipoId) : undefined;
  const proyecto = agrupadorId
    ? proyectos.find((row) =>
        getLinkIds(row[FIELDS.PROYECTOS.AGRUPADOR]).includes(agrupadorId)
      )
    : undefined;

  return {
    tipoNombre: tipo?.[FIELDS.TIPOS.NOMBRE] ?? "—",
    agrupadorNombre: agrupador?.[FIELDS.AGRUPADORES.NOMBRE] ?? "—",
    proyectoNombre: proyecto?.[FIELDS.PROYECTOS.NOMBRE] ?? "—",
    tipoId,
    agrupadorId,
    proyectoId: proyecto?.id ?? null,
  };
}

export function reportMatchesAdminFilters(
  reporte: Reporte,
  filters: AdminReportesFilters,
  agrupadores: Agrupador[],
  proyectos: Proyecto[],
  tipos: Tipo[],
  condominioId: number
): boolean {
  if (!rowBelongsToCondominio(reporte[FIELDS.REPORTES.CONDOMINIO], condominioId)) {
    return false;
  }

  const hierarchy = resolveReporteHierarchy(
    reporte,
    agrupadores,
    proyectos,
    tipos
  );

  if (filters.tipoId && hierarchy.tipoId !== Number(filters.tipoId)) {
    return false;
  }
  if (filters.agrupadorId && hierarchy.agrupadorId !== Number(filters.agrupadorId)) {
    return false;
  }
  if (filters.proyectoId) {
    const proyecto = proyectos.find((row) => row.id === Number(filters.proyectoId));
    const proyectoAgrupadorId = proyecto
      ? getLinkIds(proyecto[FIELDS.PROYECTOS.AGRUPADOR])[0]
      : null;
    if (proyectoAgrupadorId !== hierarchy.agrupadorId) {
      return false;
    }
  }

  if (filters.estatus) {
    const estatusId = getSelectId(reporte[FIELDS.REPORTES.ESTATUS]);
    if (estatusId !== filters.estatus) return false;
  }

  const fecha = reporte[FIELDS.REPORTES.FECHA_REPORTE];
  if (fecha) {
    const fechaDia = fecha.slice(0, 10);
    if (filters.fechaDesde && fechaDia < filters.fechaDesde) return false;
    if (filters.fechaHasta && fechaDia > filters.fechaHasta) return false;
  } else if (filters.fechaDesde || filters.fechaHasta) {
    return false;
  }

  return true;
}

export function reportHasMantenimiento(reporte: Reporte): boolean {
  return getLinkIds(reporte[FIELDS.REPORTES.MANTENIMIENTO]).length > 0;
}

export { REPORTE_ESTATUS };
