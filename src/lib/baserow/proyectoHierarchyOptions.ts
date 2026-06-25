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
        [proyectoNombre, proyectoDetalles, agrupadorNombre, tipoNombre].join(" ")
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

export function filterProyectoHierarchyOptions(
  options: ProyectoHierarchyOption[],
  inputValue: string
): ProyectoHierarchyOption[] {
  const query = normalizeSearch(inputValue);
  if (!query) return options;
  return options.filter((option) => option.searchText.includes(query));
}

export function findProyectoHierarchyOption(
  options: ProyectoHierarchyOption[],
  proyectoId: number | null | undefined
): ProyectoHierarchyOption | null {
  if (!proyectoId) return null;
  return options.find((option) => option.proyectoId === Number(proyectoId)) ?? null;
}
