import {
  defaultProyectoHierarchyFilters,
  ProyectoHierarchyFilters,
} from "@/lib/baserow/proyectoHierarchyUtils";

export interface MantCorrectivoFilters extends ProyectoHierarchyFilters {
  estatus: string;
}

export const defaultMantCorrectivoFilters: MantCorrectivoFilters = {
  ...defaultProyectoHierarchyFilters,
  estatus: "",
};
