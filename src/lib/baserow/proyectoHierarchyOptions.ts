import Fuse from "fuse.js";
import { FIELDS } from "@/lib/baserow/constants";
import { Agrupador, Proyecto, Tipo } from "@/lib/baserow/types";
import { getLinkIds } from "@/lib/baserow/utils";

export interface ProyectoHierarchyOption {
  proyectoId: number;
  proyectoNombre: string;
  proyectoDetalles: string;
  agrupadorId: number;
  agrupadorNombre: string;
  tipoId: number;
  tipoNombre: string;
  searchText: string;
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function levelNames(option: ProyectoHierarchyOption): string[] {
  return [option.proyectoNombre, option.agrupadorNombre, option.tipoNombre];
}

function levelNameIncludes(
  option: ProyectoHierarchyOption,
  query: string
): boolean {
  return levelNames(option).some((name) => normalizeSearch(name).includes(query));
}

/** 0 = nivel 3, 1 = nivel 2, 2 = nivel 1, 3 = solo coincidencia difusa Fuse */
export function getLevelMatchPriority(
  option: ProyectoHierarchyOption,
  query: string
): number {
  if (normalizeSearch(option.proyectoNombre).includes(query)) return 0;
  if (normalizeSearch(option.agrupadorNombre).includes(query)) return 1;
  if (normalizeSearch(option.tipoNombre).includes(query)) return 2;
  return 3;
}

export function buildProyectoHierarchyOptions(
  tipos: Tipo[],
  agrupadores: Agrupador[],
  proyectos: Proyecto[]
): ProyectoHierarchyOption[] {
  const tiposById = new Map(tipos.map((row) => [row.id, row]));
  const agrupadoresById = new Map(agrupadores.map((row) => [row.id, row]));
  const options: ProyectoHierarchyOption[] = [];

  for (const proyecto of proyectos) {
    const agrupadorId = getLinkIds(proyecto[FIELDS.PROYECTOS.AGRUPADOR])[0];
    if (!agrupadorId) continue;

    const agrupador = agrupadoresById.get(agrupadorId);
    if (!agrupador) continue;

    const tipoId = getLinkIds(agrupador[FIELDS.AGRUPADORES.TIPO])[0];
    if (!tipoId) continue;

    const tipo = tiposById.get(tipoId);
    if (!tipo) continue;

    const proyectoNombre = proyecto[FIELDS.PROYECTOS.NOMBRE]?.trim() || "Sin nombre";
    const proyectoDetalles = proyecto[FIELDS.PROYECTOS.DETALLES]?.trim() || "";
    const agrupadorNombre =
      agrupador[FIELDS.AGRUPADORES.NOMBRE]?.trim() || "Sin agrupador";
    const tipoNombre = tipo[FIELDS.TIPOS.NOMBRE]?.trim() || "Sin tipo";

    options.push({
      proyectoId: proyecto.id,
      proyectoNombre,
      proyectoDetalles,
      agrupadorId,
      agrupadorNombre,
      tipoId,
      tipoNombre,
      searchText: normalizeSearch(
        [proyectoNombre, agrupadorNombre, tipoNombre].join(" ")
      ),
    });
  }

  return options.sort((a, b) => {
    const tipo = a.tipoNombre.localeCompare(b.tipoNombre, "es");
    if (tipo !== 0) return tipo;
    const agrupador = a.agrupadorNombre.localeCompare(b.agrupadorNombre, "es");
    if (agrupador !== 0) return agrupador;
    return a.proyectoNombre.localeCompare(b.proyectoNombre, "es");
  });
}

export function createProyectoHierarchyFuse(options: ProyectoHierarchyOption[]) {
  return new Fuse(options, {
    keys: [
      {
        name: "proyectoNombre",
        weight: 0.5,
        getFn: (option) => normalizeSearch(option.proyectoNombre),
      },
      {
        name: "agrupadorNombre",
        weight: 0.3,
        getFn: (option) => normalizeSearch(option.agrupadorNombre),
      },
      {
        name: "tipoNombre",
        weight: 0.2,
        getFn: (option) => normalizeSearch(option.tipoNombre),
      },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 1,
  });
}

export function filterProyectoHierarchyOptions(
  options: ProyectoHierarchyOption[],
  inputValue: string,
  fuse?: Fuse<ProyectoHierarchyOption>
): ProyectoHierarchyOption[] {
  const query = normalizeSearch(inputValue);
  if (!query) return options;

  const searcher = fuse ?? createProyectoHierarchyFuse(options);
  const fuseResults = searcher.search(query);
  const fuseById = new Map(
    fuseResults.map((result) => [result.item.proyectoId, result])
  );

  const matchedIds = new Set<number>([
    ...fuseResults.map((result) => result.item.proyectoId),
    ...options
      .filter((option) => levelNameIncludes(option, query))
      .map((option) => option.proyectoId),
  ]);

  return [...matchedIds]
    .map((id) => options.find((option) => option.proyectoId === id))
    .filter((option): option is ProyectoHierarchyOption => !!option)
    .sort((a, b) => {
      const priorityDiff =
        getLevelMatchPriority(a, query) - getLevelMatchPriority(b, query);
      if (priorityDiff !== 0) return priorityDiff;

      const scoreA = fuseById.get(a.proyectoId)?.score ?? 1;
      const scoreB = fuseById.get(b.proyectoId)?.score ?? 1;
      if (scoreA !== scoreB) return scoreA - scoreB;

      return a.proyectoNombre.localeCompare(b.proyectoNombre, "es");
    });
}

export function findProyectoHierarchyOption(
  options: ProyectoHierarchyOption[],
  proyectoId: number | null | undefined
): ProyectoHierarchyOption | null {
  if (!proyectoId) return null;
  return options.find((option) => option.proyectoId === Number(proyectoId)) ?? null;
}
