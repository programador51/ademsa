import {
  defaultProyectoHierarchyFilters,
  ProyectoHierarchyFilters,
} from "@/lib/baserow/proyectoHierarchyUtils";

export interface MantPreventivoFilters extends ProyectoHierarchyFilters {
  folio: string;
}

export const defaultMantPreventivoFilters: MantPreventivoFilters = {
  ...defaultProyectoHierarchyFilters,
  folio: "",
};

export interface MantCorrectivoFilters extends ProyectoHierarchyFilters {
  estatus: string;
  folio: string;
}

export const defaultMantCorrectivoFilters: MantCorrectivoFilters = {
  ...defaultProyectoHierarchyFilters,
  estatus: "",
  folio: "",
};
