"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { buildCondominioFilter, fetchTable } from "@/lib/api/data";
import { agrupadoresForTipos, tiposForCondominio } from "@/lib/baserow/condominioFilters";
import { FIELDS } from "@/lib/baserow/constants";
import { Agrupador, Proyecto, Tipo } from "@/lib/baserow/types";
import { getLinkIds } from "@/lib/baserow/utils";

export function useServiciosHierarchyData(condominioId: number | null) {
  const tipoFilter = condominioId
    ? buildCondominioFilter(condominioId, FIELDS.TIPOS.CONDOMINIO)
    : undefined;

  const tiposQuery = useQuery({
    queryKey: ["hierarchy-tipos", condominioId],
    queryFn: () =>
      fetchTable<Tipo>("tipos", tipoFilter ? { filters: tipoFilter } : undefined),
    enabled: !!condominioId,
  });

  const agrupadoresQuery = useQuery({
    queryKey: ["hierarchy-agrupadores", condominioId],
    queryFn: () => fetchTable<Agrupador>("agrupadores"),
    enabled: !!condominioId,
  });

  const proyectosQuery = useQuery({
    queryKey: ["hierarchy-proyectos", condominioId],
    queryFn: () => fetchTable<Proyecto>("proyectos"),
    enabled: !!condominioId,
  });

  const tipos = useMemo(() => {
    if (!condominioId) return [];
    return tiposForCondominio(tiposQuery.data?.results ?? [], condominioId);
  }, [tiposQuery.data, condominioId]);
  const tipoIds = useMemo(() => tipos.map((t) => t.id), [tipos]);
  const agrupadores = useMemo(
    () => agrupadoresForTipos(agrupadoresQuery.data?.results ?? [], tipoIds),
    [agrupadoresQuery.data, tipoIds]
  );
  const proyectos = useMemo(() => {
    if (!condominioId) return [];
    const all = proyectosQuery.data?.results ?? [];
    const agrupadorIds = new Set(agrupadores.map((row) => row.id));
    return all.filter((row) =>
      getLinkIds(row[FIELDS.PROYECTOS.AGRUPADOR]).some((id) =>
        agrupadorIds.has(id)
      )
    );
  }, [proyectosQuery.data, agrupadores, condominioId]);

  return {
    tipos,
    agrupadores,
    proyectos,
    isLoading:
      tiposQuery.isLoading ||
      agrupadoresQuery.isLoading ||
      proyectosQuery.isLoading,
  };
}

export function getHierarchyFromProyecto(
  proyectoId: number | null | undefined,
  agrupadores: Agrupador[],
  proyectos: Proyecto[]
): { tipoId: number | null; agrupadorId: number | null } {
  if (!proyectoId) return { tipoId: null, agrupadorId: null };
  const proyecto = proyectos.find((p) => p.id === proyectoId);
  if (!proyecto) return { tipoId: null, agrupadorId: null };
  const agrupadorId = getLinkIds(proyecto[FIELDS.PROYECTOS.AGRUPADOR])[0] ?? null;
  if (!agrupadorId) return { tipoId: null, agrupadorId: null };
  const agrupador = agrupadores.find((a) => a.id === agrupadorId);
  const tipoId = agrupador
    ? getLinkIds(agrupador[FIELDS.AGRUPADORES.TIPO])[0] ?? null
    : null;
  return { tipoId, agrupadorId };
}
