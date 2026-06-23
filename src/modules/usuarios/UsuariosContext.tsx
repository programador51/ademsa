"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import {
  buildCondominioFilter,
  createTableRow,
  deleteTableRow,
  fetchTable,
  updateTableRow,
} from "@/lib/api/data";
import { showCreateSuccess } from "@/lib/ui/alerts";
import { FIELDS } from "@/lib/baserow/constants";
import { Condominio, Unidad, Usuario } from "@/lib/baserow/types";
import { getLinkIds, getSelectId } from "@/lib/baserow/utils";
import {
  defaultUnidadFormValues,
  defaultUsuarioFormValues,
  UnidadFormValues,
  UsuarioFormValues,
  UsuariosTab,
} from "./schemas";

interface UsuariosContextValue {
  tab: UsuariosTab;
  setTab: (tab: UsuariosTab) => void;
  usuarios: Usuario[];
  unidades: Unidad[];
  condominios: Condominio[];
  isLoading: boolean;
  dialogOpen: boolean;
  editingId: number | null;
  openCreate: () => void;
  openEditUsuario: (row: Usuario) => void;
  openEditUnidad: (row: Unidad) => void;
  closeDialog: () => void;
  saveUsuario: (values: UsuarioFormValues) => Promise<void>;
  saveUnidad: (values: UnidadFormValues) => Promise<void>;
  deleteRow: (id: number) => Promise<void>;
  isSaving: boolean;
}

const UsuariosContext = createContext<UsuariosContextValue | undefined>(
  undefined
);

export function UsuariosProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { condominioId } = useApp();
  const [tab, setTab] = useState<UsuariosTab>("usuarios");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: usuariosData, isLoading: loadingUsuarios } = useQuery({
    queryKey: ["usuarios-admin"],
    queryFn: () => fetchTable<Usuario>("usuarios"),
  });

  const unidadFilter = condominioId
    ? buildCondominioFilter(condominioId, FIELDS.UNIDADES.CONDOMINIO)
    : undefined;

  const { data: unidadesData, isLoading: loadingUnidades } = useQuery({
    queryKey: ["unidades", condominioId],
    queryFn: () =>
      fetchTable<Unidad>("unidades", unidadFilter ? { filters: unidadFilter } : undefined),
    enabled: !!condominioId,
  });

  const { data: condominiosData } = useQuery({
    queryKey: ["condominios-select"],
    queryFn: () => fetchTable<Condominio>("condominios"),
  });

  const saveUsuarioMutation = useMutation({
    mutationFn: async (values: UsuarioFormValues) => {
      const creating = editingId === null;
      const payload: Record<string, unknown> = {
        [FIELDS.USUARIOS.NOMBRE]: values.nombre,
        [FIELDS.USUARIOS.EMAIL]: values.email,
        [FIELDS.USUARIOS.ROL]: values.rol,
        [FIELDS.USUARIOS.CONDOMINIOS]: values.condominioId ? [values.condominioId] : [],
        [FIELDS.USUARIOS.UNIDADES]: values.unidadId ? [values.unidadId] : [],
      };
      if (values.password) payload[FIELDS.USUARIOS.CONTRASENA] = values.password;
      if (editingId) await updateTableRow("usuarios", editingId, payload);
      else await createTableRow("usuarios", payload);
      return creating;
    },
    onSuccess: (creating) => {
      if (creating) showCreateSuccess("El usuario");
      queryClient.invalidateQueries({ queryKey: ["usuarios-admin"] });
      setDialogOpen(false);
      setEditingId(null);
    },
  });

  const saveUnidadMutation = useMutation({
    mutationFn: async (values: UnidadFormValues) => {
      const creating = editingId === null;
      const payload: Record<string, unknown> = {
        [FIELDS.UNIDADES.NUMERO]: values.numero,
        [FIELDS.UNIDADES.EDIFICIO]: values.edificio,
        [FIELDS.UNIDADES.INDIVISO]: values.indiviso || null,
        [FIELDS.UNIDADES.CONDOMINIO]: [values.condominioId],
        ...(values.propietarioId
          ? { [FIELDS.UNIDADES.PROPIETARIO]: [values.propietarioId] }
          : {}),
      };
      if (editingId) await updateTableRow("unidades", editingId, payload);
      else await createTableRow("unidades", payload);
      return creating;
    },
    onSuccess: (creating) => {
      if (creating) showCreateSuccess("La unidad");
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      setDialogOpen(false);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteTableRow(tab === "usuarios" ? "usuarios" : "unidades", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [tab === "usuarios" ? "usuarios-admin" : "unidades"],
      });
    },
  });

  const openCreate = useCallback(() => {
    setEditingId(null);
    setDialogOpen(true);
  }, []);

  const openEditUsuario = useCallback((row: Usuario) => {
    setEditingId(row.id);
    setTab("usuarios");
    setDialogOpen(true);
  }, []);

  const openEditUnidad = useCallback((row: Unidad) => {
    setEditingId(row.id);
    setTab("unidades");
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingId(null);
  }, []);

  const value = useMemo(
    () => ({
      tab,
      setTab,
      usuarios: usuariosData?.results ?? [],
      unidades: unidadesData?.results ?? [],
      condominios: condominiosData?.results ?? [],
      isLoading: loadingUsuarios || loadingUnidades,
      dialogOpen,
      editingId,
      openCreate,
      openEditUsuario,
      openEditUnidad,
      closeDialog,
      saveUsuario: (values: UsuarioFormValues) =>
        saveUsuarioMutation.mutateAsync(values).then(() => undefined),
      saveUnidad: (values: UnidadFormValues) =>
        saveUnidadMutation.mutateAsync(values).then(() => undefined),
      deleteRow: (id: number) =>
        deleteMutation.mutateAsync(id).then(() => undefined),
      isSaving: saveUsuarioMutation.isPending || saveUnidadMutation.isPending,
    }),
    [
      tab,
      usuariosData,
      unidadesData,
      condominiosData,
      loadingUsuarios,
      loadingUnidades,
      dialogOpen,
      editingId,
      openCreate,
      openEditUsuario,
      openEditUnidad,
      closeDialog,
      saveUsuarioMutation,
      saveUnidadMutation,
      deleteMutation,
    ]
  );

  return (
    <UsuariosContext.Provider value={value}>{children}</UsuariosContext.Provider>
  );
}

export function useUsuariosModule() {
  const ctx = useContext(UsuariosContext);
  if (!ctx) {
    throw new Error("useUsuariosModule debe usarse dentro de UsuariosProvider");
  }
  return ctx;
}

export function getUsuarioEditValues(row: Usuario): UsuarioFormValues {
  return {
    nombre: row[FIELDS.USUARIOS.NOMBRE],
    email: row[FIELDS.USUARIOS.EMAIL],
    rol: getSelectId(row[FIELDS.USUARIOS.ROL]) ?? 0,
    password: "",
    condominioId: getLinkIds(row[FIELDS.USUARIOS.CONDOMINIOS])[0] ?? null,
    unidadId: getLinkIds(row[FIELDS.USUARIOS.UNIDADES])[0] ?? null,
  };
}

export function getUnidadEditValues(row: Unidad): UnidadFormValues {
  return {
    condominioId: getLinkIds(row[FIELDS.UNIDADES.CONDOMINIO])[0] ?? 0,
    numero: row[FIELDS.UNIDADES.NUMERO],
    edificio: row[FIELDS.UNIDADES.EDIFICIO],
    indiviso: row[FIELDS.UNIDADES.INDIVISO] ?? "",
    propietarioId: row[FIELDS.UNIDADES.PROPIETARIO]?.[0]?.id ?? null,
  };
}

export {
  defaultUnidadFormValues,
  defaultUsuarioFormValues,
};
