"use client";

import { Stack } from "@mui/material";
import { ReactNode } from "react";
import { ProyectoHierarchyFilters } from "@/lib/baserow/proyectoHierarchyUtils";
import { Agrupador, Proyecto, Tipo } from "@/lib/baserow/types";
import ProyectoHierarchyFilterAutocomplete from "./ProyectoHierarchyFilterAutocomplete";

interface ProyectoHierarchyFiltersBarProps {
  filters: ProyectoHierarchyFilters;
  onChange: (filters: ProyectoHierarchyFilters) => void;
  tipos: Tipo[];
  agrupadores: Agrupador[];
  proyectos: Proyecto[];
  extraFilters?: ReactNode;
}

export default function ProyectoHierarchyFiltersBar({
  filters,
  onChange,
  tipos,
  agrupadores,
  proyectos,
  extraFilters,
}: ProyectoHierarchyFiltersBarProps) {
  return (
    <Stack spacing={1.5}>
      {extraFilters}
      <ProyectoHierarchyFilterAutocomplete
        filters={filters}
        onChange={onChange}
        tipos={tipos}
        agrupadores={agrupadores}
        proyectos={proyectos}
      />
    </Stack>
  );
}
