import { FIELDS } from "@/lib/baserow/constants";
import { Agrupador, Proyecto, Tipo } from "@/lib/baserow/types";
import { getLinkIds } from "@/lib/baserow/utils";
import { ServiciosFilters } from "./schemas";

function matchesSearch(value: string | null | undefined, search: string) {
  if (!search.trim()) return true;
  return (value ?? "").toLowerCase().includes(search.trim().toLowerCase());
}

export function filterTipos(rows: Tipo[], filters: ServiciosFilters) {
  return rows.filter((row) =>
    matchesSearch(row[FIELDS.TIPOS.NOMBRE], filters.search)
  );
}

export function filterAgrupadores(rows: Agrupador[], filters: ServiciosFilters) {
  return rows.filter((row) => {
    const tipoIds = getLinkIds(row[FIELDS.AGRUPADORES.TIPO]);
    const tipoMatch =
      !filters.tipoId || tipoIds.includes(Number(filters.tipoId));
    const searchMatch = matchesSearch(
      row[FIELDS.AGRUPADORES.NOMBRE],
      filters.search
    );
    return tipoMatch && searchMatch;
  });
}

export function filterProyectos(
  rows: Proyecto[],
  filters: ServiciosFilters,
  agrupadores: Agrupador[]
) {
  return rows.filter((row) => {
    const agrupadorIds = getLinkIds(row[FIELDS.PROYECTOS.AGRUPADOR]);
    const agrupador = agrupadores.find((a) => agrupadorIds.includes(a.id));
    if (!agrupador) return false;

    const tipoIds = getLinkIds(agrupador[FIELDS.AGRUPADORES.TIPO]);
    const tipoMatch =
      !filters.tipoId || tipoIds.includes(Number(filters.tipoId));
    const agrupadorMatch =
      !filters.agrupadorId ||
      agrupadorIds.includes(Number(filters.agrupadorId));
    const searchMatch =
      matchesSearch(row[FIELDS.PROYECTOS.NOMBRE], filters.search) ||
      matchesSearch(row[FIELDS.PROYECTOS.DETALLES], filters.search);

    return tipoMatch && agrupadorMatch && searchMatch;
  });
}

export function agrupadoresByTipo(
  agrupadores: Agrupador[],
  tipoId: number | ""
) {
  if (!tipoId) return agrupadores;
  return agrupadores.filter((row) =>
    getLinkIds(row[FIELDS.AGRUPADORES.TIPO]).includes(Number(tipoId))
  );
}
