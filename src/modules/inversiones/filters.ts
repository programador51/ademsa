import {
  defaultProyectoHierarchyFilters,
  ProyectoHierarchyFilters,
} from "@/lib/baserow/proyectoHierarchyUtils";

export interface InversionesFilters extends ProyectoHierarchyFilters {
  estatus: number | "";
}

export const defaultInversionesFilters: InversionesFilters = {
  ...defaultProyectoHierarchyFilters,
  estatus: "",
};
