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
import { FormTextField } from "@/components/forms/FormTextField";
import {
  condominioFormSchema,
  CondominioFormValues,
  defaultCondominioFormValues,
} from "../schemas";
import { getCondominioEditValues, useCondominios } from "../CondominiosContext";

export default function CondominioFormDialog() {
  const { dialogOpen, editing, closeDialog, saveCondominio, isSaving } =
    useCondominios();

  const { control, handleSubmit, reset } = useForm<CondominioFormValues>({
    resolver: yupResolver(condominioFormSchema) as Resolver<CondominioFormValues>,
    defaultValues: defaultCondominioFormValues,
  });

  useEffect(() => {
    if (!dialogOpen) {
      reset(defaultCondominioFormValues);
      return;
    }
    reset(editing ? getCondominioEditValues(editing) : defaultCondominioFormValues);
  }, [dialogOpen, editing, reset]);

  return (
    <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? "Editar condominio" : "Nuevo condominio"}</DialogTitle>
      <form onSubmit={handleSubmit((v) => saveCondominio(v))}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormTextField name="nombre" control={control} label="Nombre" required />
            <FormTextField name="direccion" control={control} label="Dirección" />
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
