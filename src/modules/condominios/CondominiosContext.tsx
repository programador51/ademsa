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
  createTableRow,
  deleteTableRow,
  fetchTable,
  updateTableRow,
} from "@/lib/api/data";
import { showCreateSuccess } from "@/lib/ui/alerts";
import { FIELDS } from "@/lib/baserow/constants";
import { Condominio } from "@/lib/baserow/types";
import {
  CondominioFormValues,
  defaultCondominioFormValues,
} from "./schemas";

interface CondominiosContextValue {
  rows: Condominio[];
  isLoading: boolean;
  error: string | null;
  dialogOpen: boolean;
  editing: Condominio | null;
  openCreate: () => void;
  openEdit: (row: Condominio) => void;
  closeDialog: () => void;
  saveCondominio: (values: CondominioFormValues) => Promise<void>;
  deleteCondominio: (row: Condominio) => Promise<void>;
  isSaving: boolean;
}

const CondominiosContext = createContext<CondominiosContextValue | undefined>(
  undefined
);

export function CondominiosProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { user } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Condominio | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["condominios"],
    queryFn: () => fetchTable<Condominio>("condominios"),
  });

  const filteredRows = useMemo(() => {
    const all = data?.results ?? [];
    if (!user?.condominioIds.length) return [];
    return all.filter((c) => user.condominioIds.includes(c.id));
  }, [data, user]);

  const saveMutation = useMutation({
    mutationFn: async (values: CondominioFormValues) => {
      const creating = !editing;
      const payload = {
        [FIELDS.CONDOMINIOS.NOMBRE]: values.nombre,
        [FIELDS.CONDOMINIOS.DIRECCION]: values.direccion,
      };
      if (editing) {
        await updateTableRow<Condominio>("condominios", editing.id, payload);
      } else {
        await createTableRow<Condominio>("condominios", payload);
      }
      return creating;
    },
    onSuccess: (creating) => {
      if (creating) showCreateSuccess("El condominio");
      queryClient.invalidateQueries({ queryKey: ["condominios"] });
      setDialogOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (row: Condominio) => deleteTableRow("condominios", row.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["condominios"] }),
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((row: Condominio) => {
    setEditing(row);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditing(null);
  }, []);

  const value = useMemo(
    () => ({
      rows: filteredRows,
      isLoading,
      error: error ? "Error al cargar condominios" : null,
      dialogOpen,
      editing,
      openCreate,
      openEdit,
      closeDialog,
      saveCondominio: (values: CondominioFormValues) =>
        saveMutation.mutateAsync(values).then(() => undefined),
      deleteCondominio: (row: Condominio) =>
        deleteMutation.mutateAsync(row).then(() => undefined),
      isSaving: saveMutation.isPending,
    }),
    [
      filteredRows,
      isLoading,
      error,
      dialogOpen,
      editing,
      openCreate,
      openEdit,
      closeDialog,
      saveMutation,
      deleteMutation,
    ]
  );

  return (
    <CondominiosContext.Provider value={value}>
      {children}
    </CondominiosContext.Provider>
  );
}

export function useCondominios() {
  const ctx = useContext(CondominiosContext);
  if (!ctx) {
    throw new Error("useCondominios debe usarse dentro de CondominiosProvider");
  }
  return ctx;
}

export function getCondominioEditValues(row: Condominio): CondominioFormValues {
  return {
    nombre: row[FIELDS.CONDOMINIOS.NOMBRE] ?? "",
    direccion: row[FIELDS.CONDOMINIOS.DIRECCION] ?? "",
  };
}

export { defaultCondominioFormValues };
