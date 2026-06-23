"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextField } from "@/components/forms/FormTextField";
import { FIELDS } from "@/lib/baserow/constants";
import { Agrupador } from "@/lib/baserow/types";
import { getLinkIds } from "@/lib/baserow/utils";
import {
  defaultServicioFormValues,
  servicioFormSchema,
  ServicioFormValues,
} from "../schemas";
import { getEditFormValues, useServicios } from "../ServiciosContext";

export default function ServicioFormDialog() {
  const {
    nivel,
    dialogOpen,
    editingId,
    closeDialog,
    saveServicio,
    isSaving,
    tipos,
    agrupadores,
    agrupadoresFiltrados,
    filteredRows,
  } = useServicios();

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<ServicioFormValues>({
      resolver: yupResolver(servicioFormSchema) as Resolver<ServicioFormValues>,
      defaultValues: { ...defaultServicioFormValues, nivel },
    });

  const formNivel = watch("nivel");
  const formTipoId = watch("tipoId");

  useEffect(() => {
    if (formNivel === 3 && formTipoId) {
      setValue("agrupadorId", undefined as unknown as number);
    }
  }, [formTipoId, formNivel, setValue]);

  const agrupadoresForm = formTipoId
    ? agrupadores.filter((row) =>
        getLinkIds(row[FIELDS.AGRUPADORES.TIPO]).includes(Number(formTipoId))
      )
    : agrupadores;

  useEffect(() => {
    if (!dialogOpen) {
      reset({ ...defaultServicioFormValues, nivel });
      return;
    }
    if (editingId) {
      const row = filteredRows.find((r) => r.id === editingId);
      if (row) {
        const values = getEditFormValues(nivel, row);
        if (nivel === 3 && values.agrupadorId) {
          const agrupador = agrupadores.find((a) => a.id === values.agrupadorId);
          if (agrupador) {
            values.tipoId = getLinkIds(agrupador[FIELDS.AGRUPADORES.TIPO])[0];
          }
        }
        reset(values);
      }
    } else {
      reset({ ...defaultServicioFormValues, nivel });
    }
  }, [dialogOpen, editingId, nivel, filteredRows, agrupadores, reset]);

  useEffect(() => {
    setValue("nivel", nivel);
  }, [nivel, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    await saveServicio({ ...values, nivel });
  });

  return (
    <Dialog open={dialogOpen} onClose={closeDialog} fullScreen>
      <DialogTitle>
        {editingId ? "Editar" : "Nuevo"}{" "}
        {nivel === 1 ? "Nivel 1 · Tipo" : nivel === 2 ? "Nivel 2 · Agrupador" : "Nivel 3 · Proyecto"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormTextField
            name="nombre"
            control={control}
            label={formNivel === 3 ? "Nombre del proyecto" : "Nombre"}
            required
          />

          {formNivel === 3 && (
            <FormTextField
              name="detalles"
              control={control}
              label="Detalles"
              multiline
              minRows={3}
            />
          )}

          {(formNivel === 2 || formNivel === 3) && (
            <FormSelect
              name="tipoId"
              control={control}
              label="Tipo"
              options={tipos.map((t) => ({
                value: t.id,
                label: t[FIELDS.TIPOS.NOMBRE],
              }))}
            />
          )}

          {formNivel === 3 && (
            <FormSelect
              name="agrupadorId"
              control={control}
              label="Agrupador"
              options={agrupadoresForm.map((a: Agrupador) => ({
                value: a.id,
                label: a[FIELDS.AGRUPADORES.NOMBRE],
              }))}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={closeDialog}>Cancelar</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isSaving}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
