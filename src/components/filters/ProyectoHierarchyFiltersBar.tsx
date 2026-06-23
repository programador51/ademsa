"use client";

import { MenuItem, Stack, TextField } from "@mui/material";
import { ReactNode } from "react";
import { FIELDS } from "@/lib/baserow/constants";
import {
  agrupadoresByTipoFilter,
  ProyectoHierarchyFilters,
  proyectosByAgrupadorFilter,
} from "@/lib/baserow/proyectoHierarchyUtils";
import { Agrupador, Proyecto, Tipo } from "@/lib/baserow/types";

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
  const agrupadoresFiltrados = agrupadoresByTipoFilter(
    agrupadores,
    filters.tipoId
  );
  const proyectosFiltrados = proyectosByAgrupadorFilter(
    proyectos,
    filters.agrupadorId
  );

  return (
    <Stack spacing={1.5}>
      {extraFilters}
      <TextField
        select
        label="Nivel 1 · Tipo"
        value={filters.tipoId}
        onChange={(e) =>
          onChange({
            ...filters,
            tipoId: e.target.value ? Number(e.target.value) : "",
            agrupadorId: "",
            proyectoId: "",
          })
        }
        fullWidth
        size="small"
      >
        <MenuItem value="">Todos los tipos</MenuItem>
        {tipos.map((tipo) => (
          <MenuItem key={tipo.id} value={tipo.id}>
            {tipo[FIELDS.TIPOS.NOMBRE]}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Nivel 2 · Agrupador"
        value={filters.agrupadorId}
        onChange={(e) =>
          onChange({
            ...filters,
            agrupadorId: e.target.value ? Number(e.target.value) : "",
            proyectoId: "",
          })
        }
        fullWidth
        size="small"
        disabled={!filters.tipoId}
      >
        <MenuItem value="">Todos los agrupadores</MenuItem>
        {agrupadoresFiltrados.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            {item[FIELDS.AGRUPADORES.NOMBRE]}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Nivel 3 · Proyecto"
        value={filters.proyectoId}
        onChange={(e) =>
          onChange({
            ...filters,
            proyectoId: e.target.value ? Number(e.target.value) : "",
          })
        }
        fullWidth
        size="small"
        disabled={!filters.agrupadorId}
      >
        <MenuItem value="">Todos los proyectos</MenuItem>
        {proyectosFiltrados.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            {item[FIELDS.PROYECTOS.NOMBRE]}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
