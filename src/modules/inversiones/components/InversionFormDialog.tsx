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
import { Resolver, useForm } from "react-hook-form";
import { FormDatePicker } from "@/components/forms/FormDatePicker";
import { FormMoneyField } from "@/components/forms/FormMoneyField";
import { FormSelect } from "@/components/forms/FormSelect";
import { ProyectoHierarchyFields } from "@/components/forms/ProyectoHierarchyFields";
import { useApp } from "@/contexts/AppContext";
import {
  getHierarchyFromProyecto,
  useServiciosHierarchyData,
} from "@/hooks/useServiciosHierarchyData";
import { ESTATUS_LABELS, INVERSION_ESTATUS } from "@/lib/baserow/constants";
import {
  defaultInversionFormValues,
  inversionFormSchema,
  InversionFormValues,
} from "../schemas";
import { getInversionEditValues, useInversiones } from "../InversionesContext";

export default function InversionFormDialog() {
  const { condominioId } = useApp();
  const { dialogOpen, editingId, closeDialog, saveInversion, isSaving, rows } =
    useInversiones();
  const { agrupadores, proyectos } = useServiciosHierarchyData(condominioId);

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<InversionFormValues>({
      resolver: yupResolver(inversionFormSchema) as Resolver<InversionFormValues>,
      defaultValues: defaultInversionFormValues,
    });

  useEffect(() => {
    if (!dialogOpen) {
      reset(defaultInversionFormValues);
      return;
    }
    if (editingId) {
      const row = rows.find((r) => r.id === editingId);
      if (row) {
        const base = getInversionEditValues(row);
        const hierarchy = getHierarchyFromProyecto(
          base.proyectoId,
          agrupadores,
          proyectos
        );
        reset({ ...base, ...hierarchy });
      } else {
        reset(defaultInversionFormValues);
      }
    } else {
      reset(defaultInversionFormValues);
    }
  }, [dialogOpen, editingId, rows, agrupadores, proyectos, reset]);

  return (
    <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
      <DialogTitle>{editingId ? "Editar inversión" : "Nueva inversión"}</DialogTitle>
      <form onSubmit={handleSubmit((v) => saveInversion(v))}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormDatePicker name="fecha" control={control} label="Fecha" />
            <FormMoneyField name="presupuesto" control={control} label="Presupuesto" />
            <FormMoneyField name="ingreso" control={control} label="Ingreso recibido" />
            <FormMoneyField name="ejercido" control={control} label="Ejercido" />
            <FormSelect
              name="estatus"
              control={control}
              label="Estatus"
              emptyOption="Ninguno"
              options={Object.entries(INVERSION_ESTATUS).map(([, value]) => ({
                value,
                label: ESTATUS_LABELS[value],
              }))}
            />
            <ProyectoHierarchyFields
              control={control}
              watch={watch}
              setValue={setValue}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
