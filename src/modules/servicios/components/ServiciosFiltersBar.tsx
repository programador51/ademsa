"use client";

import { MenuItem, Stack, TextField } from "@mui/material";
import { FIELDS } from "@/lib/baserow/constants";
import { useServicios } from "../ServiciosContext";

export default function ServiciosFiltersBar() {
  const { nivel, filters, setFilters, tipos, agrupadoresFiltrados } =
    useServicios();

  return (
    <Stack spacing={1.5}>
      <TextField
        label="Buscar"
        placeholder={nivel === 3 ? "Nombre o detalles..." : "Nombre..."}
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        fullWidth
        size="small"
      />

      {nivel >= 2 && (
        <TextField
          select
          label="Filtrar por tipo"
          value={filters.tipoId}
          onChange={(e) =>
            setFilters({
              ...filters,
              tipoId: e.target.value ? Number(e.target.value) : "",
              agrupadorId: "",
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
      )}

      {nivel === 3 && (
        <TextField
          select
          label="Filtrar por agrupador"
          value={filters.agrupadorId}
          onChange={(e) =>
            setFilters({
              ...filters,
              agrupadorId: e.target.value ? Number(e.target.value) : "",
            })
          }
          fullWidth
          size="small"
        >
          <MenuItem value="">Todos los agrupadores</MenuItem>
          {agrupadoresFiltrados.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item[FIELDS.AGRUPADORES.NOMBRE]}
            </MenuItem>
          ))}
        </TextField>
      )}
    </Stack>
  );
}
