import { FIELDS } from "./constants";
import { Agrupador, BaserowLinkRow, Proyecto, Tipo } from "./types";
import { getLinkIds } from "./utils";

export function tiposForCondominio(tipos: Tipo[], condominioId: number): Tipo[] {
  if (!condominioId) return [];
  return tipos.filter((row) =>
    getLinkIds(row[FIELDS.TIPOS.CONDOMINIO]).includes(condominioId)
  );
}

export function agrupadoresForTipos(
  agrupadores: Agrupador[],
  tipoIds: number[]
): Agrupador[] {
  if (!tipoIds.length) return [];
  return agrupadores.filter((row) =>
    getLinkIds(row[FIELDS.AGRUPADORES.TIPO]).some((id) => tipoIds.includes(id))
  );
}

export function proyectosForAgrupadores(
  proyectos: Proyecto[],
  agrupadores: Agrupador[]
): Proyecto[] {
  if (!agrupadores.length) return [];
  const agrupadorIds = new Set(agrupadores.map((row) => row.id));
  return proyectos.filter((row) =>
    getLinkIds(row[FIELDS.PROYECTOS.AGRUPADOR]).some((id) =>
      agrupadorIds.has(id)
    )
  );
}

export function proyectoIdsForCondominio(proyectos: Proyecto[]): number[] {
  return proyectos.map((p) => p.id);
}

export function rowBelongsToProyectos(
  proyectoLink: BaserowLinkRow[] | null | undefined,
  proyectoIds: number[]
): boolean {
  if (!proyectoIds.length) return false;
  const ids = getLinkIds(proyectoLink);
  return ids.some((id) => proyectoIds.includes(id));
}
