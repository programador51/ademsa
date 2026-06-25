"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
import { FormDatePicker } from "@/components/forms/FormDatePicker";
import { FormMoneyField } from "@/components/forms/FormMoneyField";
import { FormTextField } from "@/components/forms/FormTextField";
import { ProyectoHierarchyFields } from "@/components/forms/ProyectoHierarchyFields";
import { useApp } from "@/contexts/AppContext";
import {
  getHierarchyFromProyecto,
  useServiciosHierarchyData,
} from "@/hooks/useServiciosHierarchyData";
import { FIELDS } from "@/lib/baserow/constants";
import { formatDateTime } from "@/lib/formatters";
import {
  MantenimientoCorrectivo,
  MantenimientoPreventivo,
} from "@/lib/baserow/types";
import {
  defaultMantCorrectivoValues,
  defaultMantPreventivoFollowUpValues,
  defaultMantPreventivoValues,
  mantCorrectivoSchema,
  MantCorrectivoFormValues,
  mantPreventivoFollowUpSchema,
  MantPreventivoFollowUpFormValues,
  mantPreventivoSchema,
  MantPreventivoFormValues,
} from "../schemas";
import {
  getCorrectivoEditValues,
  getPreventivoEditValues,
  useMantenimientos,
} from "../MantenimientosContext";

export default function MantenimientoFormDialog() {
  const { condominioId } = useApp();
  const {
    tipo,
    dialogOpen,
    editingId,
    followUpParentId,
    closeDialog,
    savePreventivo,
    savePreventivoFollowUp,
    saveCorrectivo,
    isSaving,
    rows,
  } = useMantenimientos();
  const { agrupadores, proyectos } = useServiciosHierarchyData(condominioId);
  const hoy = dayjs().startOf("day");

  const preventivoForm = useForm<MantPreventivoFormValues>({
    resolver: yupResolver(mantPreventivoSchema) as Resolver<MantPreventivoFormValues>,
    defaultValues: defaultMantPreventivoValues,
  });

  const followUpForm = useForm<MantPreventivoFollowUpFormValues>({
    resolver: yupResolver(
      mantPreventivoFollowUpSchema
    ) as Resolver<MantPreventivoFollowUpFormValues>,
    defaultValues: defaultMantPreventivoFollowUpValues,
  });

  const correctivoForm = useForm<MantCorrectivoFormValues>({
    resolver: yupResolver(mantCorrectivoSchema) as Resolver<MantCorrectivoFormValues>,
    defaultValues: defaultMantCorrectivoValues,
  });

  const followUpParent = followUpParentId
    ? (rows.find((row) => row.id === followUpParentId) as
        | MantenimientoPreventivo
        | undefined)
    : undefined;

  useEffect(() => {
    if (!dialogOpen) {
      preventivoForm.reset(defaultMantPreventivoValues);
      followUpForm.reset(defaultMantPreventivoFollowUpValues);
      correctivoForm.reset(defaultMantCorrectivoValues);
      return;
    }
    if (followUpParentId) {
      followUpForm.reset(defaultMantPreventivoFollowUpValues);
      return;
    }
    if (editingId) {
      const row = rows.find((r) => r.id === editingId);
      if (tipo === "preventivo" && row) {
        const base = getPreventivoEditValues(row as MantenimientoPreventivo);
        const hierarchy = getHierarchyFromProyecto(
          base.proyectoId,
          agrupadores,
          proyectos
        );
        preventivoForm.reset({ ...base, ...hierarchy });
      } else if (row) {
        const base = getCorrectivoEditValues(row as MantenimientoCorrectivo);
        const hierarchy = getHierarchyFromProyecto(
          base.proyectoId,
          agrupadores,
          proyectos
        );
        correctivoForm.reset({ ...base, ...hierarchy });
      }
    } else {
      preventivoForm.reset(defaultMantPreventivoValues);
      correctivoForm.reset(defaultMantCorrectivoValues);
    }
  }, [
    dialogOpen,
    editingId,
    followUpParentId,
    tipo,
    rows,
    agrupadores,
    proyectos,
    preventivoForm,
    followUpForm,
    correctivoForm,
  ]);

  const isPreventivo = tipo === "preventivo";
  const isFollowUp = isPreventivo && !!followUpParentId && !editingId;
  const title = isPreventivo ? "mantenimiento preventivo" : "mantenimiento correctivo";

  if (isFollowUp && followUpParent) {
    return (
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Agregar seguimiento preventivo</DialogTitle>
        <form onSubmit={followUpForm.handleSubmit((v) => savePreventivoFollowUp(v))}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Se heredarán proyecto, último mantenimiento (
                {formatDateTime(followUpParent[FIELDS.MANT_PREVENTIVOS.ULTIMO])}) y
                siguiente programado (
                {formatDateTime(followUpParent[FIELDS.MANT_PREVENTIVOS.SIGUIENTE])}
                ). El campo &quot;Aplicado el&quot; podrá registrarse al editar el
                registro.
              </Typography>
              <FormDatePicker
                name="siguiente"
                control={followUpForm.control}
                label="Siguiente mantenimiento"
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

  return (
    <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
      <DialogTitle>
        {editingId ? "Editar" : "Nuevo"} {title}
      </DialogTitle>
      {isPreventivo ? (
        <form onSubmit={preventivoForm.handleSubmit((v) => savePreventivo(v))}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <ProyectoHierarchyFields
                control={preventivoForm.control}
                watch={preventivoForm.watch}
                setValue={preventivoForm.setValue}
              />
              <FormDatePicker
                name="ultimo"
                control={preventivoForm.control}
                label="Último mantenimiento"
              />
              <FormDatePicker
                name="siguiente"
                control={preventivoForm.control}
                label="Siguiente mantenimiento"
              />
              {editingId && (
                <FormDatePicker
                  name="aplicadoEl"
                  control={preventivoForm.control}
                  label="Aplicado el"
                  maxDate={hoy}
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              Guardar
            </Button>
          </DialogActions>
        </form>
      ) : (
        <form onSubmit={correctivoForm.handleSubmit((v) => saveCorrectivo(v))}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <ProyectoHierarchyFields
                control={correctivoForm.control}
                watch={correctivoForm.watch}
                setValue={correctivoForm.setValue}
              />
              <FormTextField
                name="descripcion"
                control={correctivoForm.control}
                label="Descripción"
                multiline
                minRows={3}
              />
              <FormTextField
                name="notas"
                control={correctivoForm.control}
                label="Notas de seguimiento"
                multiline
                minRows={3}
              />
              <FormDatePicker
                name="fechaReporte"
                control={correctivoForm.control}
                label="Fecha reporte"
              />
              <FormDatePicker
                name="fechaCorreccion"
                control={correctivoForm.control}
                label="Fecha corrección"
              />
              <FormMoneyField
                name="presupuesto"
                control={correctivoForm.control}
                label="Presupuesto"
              />
              <FormMoneyField
                name="ejercido"
                control={correctivoForm.control}
                label="Ejercido"
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
      )}
    </Dialog>
  );
}
