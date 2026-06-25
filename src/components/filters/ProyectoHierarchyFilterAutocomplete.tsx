"use client";

import { useMemo } from "react";
import { ProyectoHierarchyAutocompleteField } from "@/components/forms/ProyectoHierarchyAutocompleteField";
import { ProyectoHierarchyFilters } from "@/lib/baserow/proyectoHierarchyUtils";
import {
  buildProyectoHierarchyOptions,
  findProyectoHierarchyOption,
} from "@/lib/baserow/proyectoHierarchyOptions";
import { Agrupador, Proyecto, Tipo } from "@/lib/baserow/types";

interface ProyectoHierarchyFilterAutocompleteProps {
  filters: ProyectoHierarchyFilters;
  onChange: (filters: ProyectoHierarchyFilters) => void;
  tipos: Tipo[];
  agrupadores: Agrupador[];
  proyectos: Proyecto[];
  label?: string;
  placeholder?: string;
}

export default function ProyectoHierarchyFilterAutocomplete({
  filters,
  onChange,
  tipos,
  agrupadores,
  proyectos,
  label = "Filtrar por servicio (Nivel 3)",
  placeholder = "Todos los servicios · escribe para buscar",
}: ProyectoHierarchyFilterAutocompleteProps) {
  const options = useMemo(
    () => buildProyectoHierarchyOptions(tipos, agrupadores, proyectos),
    [tipos, agrupadores, proyectos]
  );

  const selected = useMemo(
    () =>
      findProyectoHierarchyOption(
        options,
        filters.proyectoId ? Number(filters.proyectoId) : null
      ) ?? null,
    [filters.proyectoId, options]
  );

  return (
    <ProyectoHierarchyAutocompleteField
      options={options}
      value={selected}
      size="small"
      label={label}
      placeholder={placeholder}
      helperText="Filtra por nombre del servicio (N3), agrupador (N2) o tipo (N1)."
      onChange={(option) => {
        if (!option) {
          onChange({
            tipoId: "",
            agrupadorId: "",
            proyectoId: "",
          });
          return;
        }
        onChange({
          tipoId: option.tipoId,
          agrupadorId: option.agrupadorId,
          proyectoId: option.proyectoId,
        });
      }}
    />
  );
}
