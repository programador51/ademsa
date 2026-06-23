"use client";

import { CircularProgress, Stack } from "@mui/material";
import { useEffect, useMemo } from "react";
import {
  Control,
  FieldPath,
  FieldValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useApp } from "@/contexts/AppContext";
import { FIELDS } from "@/lib/baserow/constants";
import { getLinkIds } from "@/lib/baserow/utils";
import { useServiciosHierarchyData } from "@/hooks/useServiciosHierarchyData";
import { FormSelect } from "./FormSelect";

interface ProyectoHierarchyFieldsProps<T extends FieldValues> {
  control: Control<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  tipoField?: FieldPath<T>;
  agrupadorField?: FieldPath<T>;
  proyectoField?: FieldPath<T>;
}

export function ProyectoHierarchyFields<T extends FieldValues>({
  control,
  watch,
  setValue,
  tipoField = "tipoId" as FieldPath<T>,
  agrupadorField = "agrupadorId" as FieldPath<T>,
  proyectoField = "proyectoId" as FieldPath<T>,
}: ProyectoHierarchyFieldsProps<T>) {
  const { condominioId } = useApp();
  const { tipos, agrupadores, proyectos, isLoading } =
    useServiciosHierarchyData(condominioId);

  const tipoId = watch(tipoField) as number | "" | null | undefined;
  const agrupadorId = watch(agrupadorField) as number | "" | null | undefined;

  const agrupadoresFiltrados = useMemo(() => {
    if (!tipoId) return agrupadores;
    return agrupadores.filter((row) =>
      getLinkIds(row[FIELDS.AGRUPADORES.TIPO]).includes(Number(tipoId))
    );
  }, [agrupadores, tipoId]);

  const proyectosFiltrados = useMemo(() => {
    if (!agrupadorId) return [];
    return proyectos.filter((row) =>
      getLinkIds(row[FIELDS.PROYECTOS.AGRUPADOR]).includes(Number(agrupadorId))
    );
  }, [proyectos, agrupadorId]);

  useEffect(() => {
    if (!tipoId) {
      setValue(agrupadorField, null as never);
      setValue(proyectoField, null as never);
    }
  }, [tipoId, setValue, agrupadorField, proyectoField]);

  useEffect(() => {
    if (!tipoId) return;
    const validAgrupador = agrupadoresFiltrados.some(
      (a) => a.id === Number(agrupadorId)
    );
    if (agrupadorId && !validAgrupador) {
      setValue(agrupadorField, null as never);
      setValue(proyectoField, null as never);
    }
  }, [tipoId, agrupadorId, agrupadoresFiltrados, setValue, agrupadorField, proyectoField]);

  useEffect(() => {
    if (!agrupadorId) return;
    const proyectoId = watch(proyectoField) as number | null | undefined;
    const validProyecto = proyectosFiltrados.some((p) => p.id === Number(proyectoId));
    if (proyectoId && !validProyecto) {
      setValue(proyectoField, null as never);
    }
  }, [agrupadorId, proyectosFiltrados, watch, proyectoField, setValue]);

  if (isLoading) {
    return <CircularProgress size={24} />;
  }

  return (
    <Stack spacing={2}>
      <FormSelect
        name={tipoField}
        control={control}
        label="Nivel 1 · Tipo"
        emptyOption="Selecciona un tipo"
        options={tipos.map((tipo) => ({
          value: tipo.id,
          label: tipo[FIELDS.TIPOS.NOMBRE],
        }))}
      />
      <FormSelect
        name={agrupadorField}
        control={control}
        label="Nivel 2 · Agrupador"
        emptyOption="Selecciona un agrupador"
        disabled={!tipoId}
        options={agrupadoresFiltrados.map((item) => ({
          value: item.id,
          label: item[FIELDS.AGRUPADORES.NOMBRE],
        }))}
      />
      <FormSelect
        name={proyectoField}
        control={control}
        label="Nivel 3 · Proyecto"
        emptyOption="Selecciona un proyecto"
        disabled={!agrupadorId}
        options={proyectosFiltrados.map((item) => ({
          value: item.id,
          label: item[FIELDS.PROYECTOS.NOMBRE],
        }))}
      />
    </Stack>
  );
}
