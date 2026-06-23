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
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextField } from "@/components/forms/FormTextField";
import { FIELDS, ROLE_LABELS, ROLES } from "@/lib/baserow/constants";
import {
  defaultUnidadFormValues,
  defaultUsuarioFormValues,
  unidadFormSchema,
  UnidadFormValues,
  usuarioFormSchema,
  UsuarioFormValues,
} from "../schemas";
import {
  getUnidadEditValues,
  getUsuarioEditValues,
  useUsuariosModule,
} from "../UsuariosContext";
import { useApp } from "@/contexts/AppContext";

export default function UsuarioFormDialog() {
  const { condominioId } = useApp();
  const {
    tab,
    dialogOpen,
    editingId,
    closeDialog,
    saveUsuario,
    saveUnidad,
    isSaving,
    usuarios,
    unidades,
    condominios,
  } = useUsuariosModule();

  const usuarioForm = useForm<UsuarioFormValues>({
    resolver: yupResolver(usuarioFormSchema) as Resolver<UsuarioFormValues>,
    defaultValues: defaultUsuarioFormValues,
  });

  const unidadForm = useForm<UnidadFormValues>({
    resolver: yupResolver(unidadFormSchema) as Resolver<UnidadFormValues>,
    defaultValues: defaultUnidadFormValues,
  });

  useEffect(() => {
    if (!dialogOpen) {
      usuarioForm.reset(defaultUsuarioFormValues);
      unidadForm.reset(defaultUnidadFormValues);
      return;
    }
    if (tab === "usuarios") {
      if (editingId) {
        const row = usuarios.find((u) => u.id === editingId);
        usuarioForm.reset(row ? getUsuarioEditValues(row) : defaultUsuarioFormValues);
      } else {
        usuarioForm.reset(defaultUsuarioFormValues);
      }
    } else if (editingId) {
      const row = unidades.find((u) => u.id === editingId);
      unidadForm.reset(row ? getUnidadEditValues(row) : defaultUnidadFormValues);
    } else {
      unidadForm.reset({
        ...defaultUnidadFormValues,
        condominioId: condominioId ?? 0,
      });
    }
  }, [dialogOpen, editingId, tab, usuarios, unidades, condominioId, usuarioForm, unidadForm]);

  const isUsuario = tab === "usuarios";

  return (
    <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
      <DialogTitle>
        {editingId ? "Editar" : "Nuevo"} {isUsuario ? "usuario" : "unidad"}
      </DialogTitle>
      {isUsuario ? (
        <form onSubmit={usuarioForm.handleSubmit((v) => saveUsuario(v))}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormTextField name="nombre" control={usuarioForm.control} label="Nombre" />
              <FormTextField name="email" control={usuarioForm.control} label="Email" type="email" />
              <FormSelect
                name="rol"
                control={usuarioForm.control}
                label="Rol"
                options={Object.entries(ROLES).map(([, value]) => ({
                  value,
                  label: ROLE_LABELS[value],
                }))}
              />
              <FormTextField
                name="password"
                control={usuarioForm.control}
                label={editingId ? "Nueva contraseña (opcional)" : "Contraseña"}
                type="password"
              />
              <FormSelect
                name="condominioId"
                control={usuarioForm.control}
                label="Condominio"
                emptyOption="Ninguno"
                options={condominios.map((c) => ({
                  value: c.id,
                  label: c[FIELDS.CONDOMINIOS.NOMBRE] ?? `Condominio #${c.id}`,
                }))}
              />
              <FormSelect
                name="unidadId"
                control={usuarioForm.control}
                label="Unidad"
                emptyOption="Ninguna"
                options={unidades.map((u) => ({
                  value: u.id,
                  label: `${u[FIELDS.UNIDADES.NUMERO]} · ${u[FIELDS.UNIDADES.EDIFICIO]}`,
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
      ) : (
        <form onSubmit={unidadForm.handleSubmit((v) => saveUnidad(v))}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormSelect
                name="condominioId"
                control={unidadForm.control}
                label="Condominio"
                options={condominios.map((c) => ({
                  value: c.id,
                  label: c[FIELDS.CONDOMINIOS.NOMBRE] ?? `Condominio #${c.id}`,
                }))}
              />
              <FormTextField name="numero" control={unidadForm.control} label="Número de unidad" />
              <FormTextField name="edificio" control={unidadForm.control} label="Edificio" />
              <FormTextField name="indiviso" control={unidadForm.control} label="Indiviso %" type="number" />
              <FormSelect
                name="propietarioId"
                control={unidadForm.control}
                label="Propietario"
                emptyOption="Ninguno"
                options={usuarios.map((u) => ({
                  value: u.id,
                  label: u[FIELDS.USUARIOS.NOMBRE],
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
