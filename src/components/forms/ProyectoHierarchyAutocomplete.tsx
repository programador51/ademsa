"use client";

import { CircularProgress } from "@mui/material";
import { useEffect, useMemo } from "react";
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useApp } from "@/contexts/AppContext";
import { useServiciosHierarchyData } from "@/hooks/useServiciosHierarchyData";
import {
  buildProyectoHierarchyOptions,
  findProyectoHierarchyOption,
} from "@/lib/baserow/proyectoHierarchyOptions";
import { ProyectoHierarchyAutocompleteField } from "./ProyectoHierarchyAutocompleteField";

export interface ProyectoHierarchyAutocompleteProps<T extends FieldValues> {
  control: Control<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  tipoField?: FieldPath<T>;
  agrupadorField?: FieldPath<T>;
  proyectoField?: FieldPath<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function ProyectoHierarchyAutocomplete<T extends FieldValues>({
  control,
  watch,
  setValue,
  tipoField = "tipoId" as FieldPath<T>,
  agrupadorField = "agrupadorId" as FieldPath<T>,
  proyectoField = "proyectoId" as FieldPath<T>,
  label = "Servicio (Nivel 3)",
  placeholder = "Escribe para buscar por servicio, tipo o agrupador",
  required = false,
  disabled = false,
}: ProyectoHierarchyAutocompleteProps<T>) {
  const { condominioId } = useApp();
  const { tipos, agrupadores, proyectos, isLoading } =
    useServiciosHierarchyData(condominioId);

  const options = useMemo(
    () => buildProyectoHierarchyOptions(tipos, agrupadores, proyectos),
    [tipos, agrupadores, proyectos]
  );

  const proyectoId = watch(proyectoField) as number | "" | null | undefined;

  useEffect(() => {
    if (!proyectoId || options.length === 0) return;
    const match = findProyectoHierarchyOption(options, Number(proyectoId));
    if (!match) return;
    setValue(tipoField, match.tipoId as never, { shouldValidate: true });
    setValue(agrupadorField, match.agrupadorId as never, { shouldValidate: true });
  }, [proyectoId, options, setValue, tipoField, agrupadorField]);

  if (isLoading) {
    return <CircularProgress size={24} />;
  }

  return (
    <Controller
      name={proyectoField}
      control={control}
      rules={
        required
          ? { required: "Selecciona un servicio del nivel 3" }
          : undefined
      }
      render={({ field, fieldState }) => {
        const selected =
          findProyectoHierarchyOption(options, field.value as number | null) ??
          null;

        return (
          <ProyectoHierarchyAutocompleteField
            options={options}
            value={selected}
            disabled={disabled}
            label={label}
            placeholder={placeholder}
            required={required}
            error={!!fieldState.error}
            helperText={
              fieldState.error?.message ??
              "Busca por nombre del servicio, tipo (nivel 1) o agrupador (nivel 2)"
            }
            onBlur={field.onBlur}
            onChange={(option) => {
              field.onChange(option?.proyectoId ?? null);
              setValue(tipoField, (option?.tipoId ?? null) as never, {
                shouldValidate: true,
              });
              setValue(agrupadorField, (option?.agrupadorId ?? null) as never, {
                shouldValidate: true,
              });
            }}
          />
        );
      }}
    />
  );
}
