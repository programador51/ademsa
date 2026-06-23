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
import { FIELDS } from "@/lib/baserow/constants";
import {
  MantenimientoCorrectivo,
  MantenimientoPreventivo,
} from "@/lib/baserow/types";
import {
  defaultMantCorrectivoValues,
  defaultMantPreventivoValues,
  mantCorrectivoSchema,
  MantCorrectivoFormValues,
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
    closeDialog,
    savePreventivo,
    saveCorrectivo,
    isSaving,
    rows,
  } = useMantenimientos();
  const { agrupadores, proyectos } = useServiciosHierarchyData(condominioId);

  const preventivoForm = useForm<MantPreventivoFormValues>({
    resolver: yupResolver(mantPreventivoSchema) as Resolver<MantPreventivoFormValues>,
    defaultValues: defaultMantPreventivoValues,
  });

  const correctivoForm = useForm<MantCorrectivoFormValues>({
    resolver: yupResolver(mantCorrectivoSchema) as Resolver<MantCorrectivoFormValues>,
    defaultValues: defaultMantCorrectivoValues,
  });

  useEffect(() => {
    if (!dialogOpen) {
      preventivoForm.reset(defaultMantPreventivoValues);
      correctivoForm.reset(defaultMantCorrectivoValues);
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
        correctivoForm.reset(getCorrectivoEditValues(row as MantenimientoCorrectivo));
      }
    } else {
      preventivoForm.reset(defaultMantPreventivoValues);
      correctivoForm.reset(defaultMantCorrectivoValues);
    }
  }, [
    dialogOpen,
    editingId,
    tipo,
    rows,
    agrupadores,
    proyectos,
    preventivoForm,
    correctivoForm,
  ]);

  const isPreventivo = tipo === "preventivo";
  const title = isPreventivo ? "mantenimiento preventivo" : "mantenimiento correctivo";

  return (
    <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
      <DialogTitle>
        {editingId ? "Editar" : "Nuevo"} {title}
      </DialogTitle>
      {isPreventivo ? (
        <form onSubmit={preventivoForm.handleSubmit((v) => savePreventivo(v))}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
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
              <ProyectoHierarchyFields
                control={preventivoForm.control}
                watch={preventivoForm.watch}
                setValue={preventivoForm.setValue}
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
      ) : (
        <form onSubmit={correctivoForm.handleSubmit((v) => saveCorrectivo(v))}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
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
              <FormSelect
                name="proyectoId"
                control={correctivoForm.control}
                label="Proyecto"
                emptyOption="Ninguno"
                options={proyectos.map((p) => ({
                  value: p.id,
                  label: p[FIELDS.PROYECTOS.NOMBRE],
                }))}
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
