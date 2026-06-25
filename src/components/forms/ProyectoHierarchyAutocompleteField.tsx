"use client";

import {
  Autocomplete,
  Box,
  Stack,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import {
  createProyectoHierarchyFuse,
  filterProyectoHierarchyOptions,
  ProyectoHierarchyOption,
} from "@/lib/baserow/proyectoHierarchyOptions";

export interface ProyectoHierarchyAutocompleteFieldProps {
  options: ProyectoHierarchyOption[];
  value: ProyectoHierarchyOption | null;
  onChange: (option: ProyectoHierarchyOption | null) => void;
  onBlur?: () => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  size?: TextFieldProps["size"];
  loading?: boolean;
}

export function ProyectoHierarchyAutocompleteField({
  options,
  value,
  onChange,
  onBlur,
  label = "Servicio (Nivel 3)",
  placeholder = "Escribe para buscar por servicio, agrupador o tipo",
  helperText = "Coincidencia parcial por nombre: primero nivel 3, luego 2 y 1",
  error = false,
  required = false,
  disabled = false,
  size = "medium",
  loading = false,
}: ProyectoHierarchyAutocompleteFieldProps) {
  const fuse = useMemo(() => createProyectoHierarchyFuse(options), [options]);
  const selectionHint = value
    ? `Nivel 1 · ${value.tipoNombre} · Nivel 2 · ${value.agrupadorNombre}`
    : null;

  return (
    <Stack spacing={0.25}>
      <Autocomplete<ProyectoHierarchyOption, false, false, false>
      disabled={disabled || options.length === 0}
      loading={loading}
      options={options}
      value={value}
      onChange={(_, option) => onChange(option)}
      onBlur={onBlur}
      getOptionLabel={(option) => option.proyectoNombre}
      getOptionKey={(option) => option.proyectoId}
      isOptionEqualToValue={(option, current) =>
        option.proyectoId === current.proyectoId
      }
      filterOptions={(items, state) =>
        filterProyectoHierarchyOptions(items, state.inputValue, fuse)
      }
      noOptionsText="Sin coincidencias"
      loadingText="Cargando servicios..."
      renderOption={(props, option) => {
        const { key: _key, ...optionProps } = props;
        return (
          <Box
            component="li"
            key={option.proyectoId}
            {...optionProps}
            sx={{ py: 1.25 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {option.proyectoNombre}
              </Typography>
              {option.proyectoDetalles &&
                option.proyectoDetalles !== option.proyectoNombre && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.25 }}
                  >
                    {option.proyectoDetalles}
                  </Typography>
                )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Nivel 1 · {option.tipoNombre} · Nivel 2 · {option.agrupadorNombre}
              </Typography>
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={error ? helperText : value ? undefined : helperText}
          fullWidth
          size={size}
        />
      )}
    />
      {selectionHint && (
        <Typography variant="caption" color="text.secondary" sx={{ px: 1.75 }}>
          {selectionHint}
        </Typography>
      )}
    </Stack>
  );
}
