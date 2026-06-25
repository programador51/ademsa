import { FIELDS } from "./constants";
import { Agrupador, BaserowLinkRow, Proyecto, Tipo } from "./types";
import { getLinkIds, getLinkLabel } from "./utils";

type ProyectoLinkValue =
  | BaserowLinkRow
  | BaserowLinkRow[]
  | number
  | number[]
  | null
  | undefined;

export interface ProyectoHierarchyFilters {
  tipoId: number | "";
  agrupadorId: number | "";
  proyectoId: number | "";
}

export const defaultProyectoHierarchyFilters: ProyectoHierarchyFilters = {
  tipoId: "",
  agrupadorId: "",
  proyectoId: "",
};

export interface ProyectoHierarchyLabels {
  tipoNombre: string;
  agrupadorNombre: string;
  proyectoNombre: string;
  tipoId: number | null;
  agrupadorId: number | null;
  proyectoId: number | null;
}

export function resolveProyectoHierarchy(
  proyectoLink: ProyectoLinkValue,
  agrupadores: Agrupador[],
  proyectos: Proyecto[],
  tipos: Tipo[]
): ProyectoHierarchyLabels {
  const proyectoId = getLinkIds(proyectoLink)[0] ?? null;
  const proyecto = proyectoId
    ? proyectos.find((p) => p.id === proyectoId)
    : undefined;
  const agrupadorId = proyecto
    ? getLinkIds(proyecto[FIELDS.PROYECTOS.AGRUPADOR])[0] ?? null
    : null;
  const agrupador = agrupadorId
    ? agrupadores.find((a) => a.id === agrupadorId)
    : undefined;
  const tipoId = agrupador
    ? getLinkIds(agrupador[FIELDS.AGRUPADORES.TIPO])[0] ?? null
    : null;
  const tipo = tipoId ? tipos.find((t) => t.id === tipoId) : undefined;

  return {
    tipoNombre: tipo?.[FIELDS.TIPOS.NOMBRE] ?? "—",
    agrupadorNombre: agrupador?.[FIELDS.AGRUPADORES.NOMBRE] ?? "—",
    proyectoNombre:
      proyecto?.[FIELDS.PROYECTOS.NOMBRE] ?? getLinkLabel(proyectoLink),
    tipoId,
    agrupadorId,
    proyectoId,
  };
}

export function rowMatchesHierarchyFilters(
  proyectoLink: ProyectoLinkValue,
  filters: ProyectoHierarchyFilters,
  agrupadores: Agrupador[],
  proyectos: Proyecto[],
  tipos: Tipo[]
): boolean {
  const hierarchy = resolveProyectoHierarchy(
    proyectoLink,
    agrupadores,
    proyectos,
    tipos
  );

  if (filters.tipoId && hierarchy.tipoId !== Number(filters.tipoId)) {
    return false;
  }
  if (
    filters.agrupadorId &&
    hierarchy.agrupadorId !== Number(filters.agrupadorId)
  ) {
    return false;
  }
  if (
    filters.proyectoId &&
    hierarchy.proyectoId !== Number(filters.proyectoId)
  ) {
    return false;
  }
  return true;
}

export function agrupadoresByTipoFilter(
  agrupadores: Agrupador[],
  tipoId: number | ""
) {
  if (!tipoId) return agrupadores;
  return agrupadores.filter((row) =>
    getLinkIds(row[FIELDS.AGRUPADORES.TIPO]).includes(Number(tipoId))
  );
}

export function proyectosByAgrupadorFilter(
  proyectos: Proyecto[],
  agrupadorId: number | ""
) {
  if (!agrupadorId) return proyectos;
  return proyectos.filter((row) =>
    getLinkIds(row[FIELDS.PROYECTOS.AGRUPADOR]).includes(Number(agrupadorId))
  );
}

export function getDefaultHierarchyForTipo(
  tipoId: number,
  agrupadores: Agrupador[],
  proyectos: Proyecto[]
): { agrupadorId: number | null; proyectoId: number | null } {
  const tipoAgrupadores = agrupadores.filter((row) =>
    getLinkIds(row[FIELDS.AGRUPADORES.TIPO]).includes(tipoId)
  );
  const agrupador =
    tipoAgrupadores.find(
      (row) => row[FIELDS.AGRUPADORES.NOMBRE]?.trim() === "N/A"
    ) ?? tipoAgrupadores[0];
  if (!agrupador) return { agrupadorId: null, proyectoId: null };

  const agrupadorProyectos = proyectos.filter((row) =>
    getLinkIds(row[FIELDS.PROYECTOS.AGRUPADOR]).includes(agrupador.id)
  );
  const proyecto =
    agrupadorProyectos.find(
      (row) => row[FIELDS.PROYECTOS.NOMBRE]?.trim() === "N/A"
    ) ?? agrupadorProyectos[0];

  return {
    agrupadorId: agrupador.id,
    proyectoId: proyecto?.id ?? null,
  };
}
