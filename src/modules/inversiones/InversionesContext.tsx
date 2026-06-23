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
import { useServiciosHierarchyData } from "@/hooks/useServiciosHierarchyData";
import {
  buildCondominioFilter,
  createTableRow,
  deleteTableRow,
  fetchTable,
  updateTableRow,
} from "@/lib/api/data";
import {
  proyectoIdsForCondominio,
  rowBelongsToProyectos,
} from "@/lib/baserow/condominioFilters";
import { rowMatchesHierarchyFilters } from "@/lib/baserow/proyectoHierarchyUtils";
import { showCreateSuccess } from "@/lib/ui/alerts";
import { FIELDS } from "@/lib/baserow/constants";
import {
  Agrupador,
  Inversion,
  Proyecto,
  Tipo,
} from "@/lib/baserow/types";
import { getSelectId } from "@/lib/baserow/utils";
import {
  defaultInversionesFilters,
  InversionesFilters,
} from "./filters";
import {
  defaultInversionFormValues,
  InversionFormValues,
} from "./schemas";

interface InversionesContextValue {
  rows: Inversion[];
  filters: InversionesFilters;
  setFilters: (filters: InversionesFilters) => void;
  tipos: Tipo[];
  agrupadores: Agrupador[];
  proyectos: Proyecto[];
  isLoading: boolean;
  error: string | null;
  dialogOpen: boolean;
  editingId: number | null;
  openCreate: () => void;
  openEdit: (row: Inversion) => void;
  closeDialog: () => void;
  saveInversion: (values: InversionFormValues) => Promise<void>;
  deleteInversion: (row: Inversion) => Promise<void>;
  isSaving: boolean;
}

const InversionesContext = createContext<InversionesContextValue | undefined>(
  undefined
);

function sortInversionesNewestFirst(rows: Inversion[]): Inversion[] {
  return [...rows].sort((a, b) => {
    const dateA = a[FIELDS.INVERSIONES.FECHA];
    const dateB = b[FIELDS.INVERSIONES.FECHA];
    if (dateA && dateB) return dateB.localeCompare(dateA);
    if (dateA) return -1;
    if (dateB) return 1;
    return b.id - a.id;
  });
}

export function InversionesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { condominioId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filters, setFilters] = useState(defaultInversionesFilters);

  const { tipos, agrupadores, proyectos } =
    useServiciosHierarchyData(condominioId);

  const proyectoFilter = condominioId
    ? buildCondominioFilter(condominioId, FIELDS.PROYECTOS.CONDOMINIO)
    : undefined;

  const { data: proyectosData } = useQuery({
    queryKey: ["proyectos-condominio", condominioId],
    queryFn: () =>
      fetchTable<Proyecto>(
        "proyectos",
        proyectoFilter ? { filters: proyectoFilter } : undefined
      ),
    enabled: !!condominioId,
  });

  const proyectoIds = useMemo(
    () => proyectoIdsForCondominio(proyectosData?.results ?? []),
    [proyectosData]
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["inversiones", condominioId],
    queryFn: () => fetchTable<Inversion>("inversiones"),
    enabled: !!condominioId,
  });

  const rows = useMemo(() => {
    const all = (data?.results ?? []).filter((row) =>
      rowBelongsToProyectos(row[FIELDS.INVERSIONES.PROYECTO], proyectoIds)
    );

    const filtered = all.filter((row) => {
      const estatusId = getSelectId(row[FIELDS.INVERSIONES.ESTATUS]);
      if (filters.estatus && estatusId !== Number(filters.estatus)) {
        return false;
      }
      return rowMatchesHierarchyFilters(
        row[FIELDS.INVERSIONES.PROYECTO],
        filters,
        agrupadores,
        proyectos,
        tipos
      );
    });

    return sortInversionesNewestFirst(filtered);
  }, [data, proyectoIds, filters, agrupadores, proyectos, tipos]);

  const saveMutation = useMutation({
    mutationFn: async (values: InversionFormValues) => {
      const creating = editingId === null;
      const payload = {
        [FIELDS.INVERSIONES.FECHA]: values.fecha || null,
        [FIELDS.INVERSIONES.PRESUPUESTO]: values.presupuesto || null,
        [FIELDS.INVERSIONES.INGRESO]: values.ingreso || null,
        [FIELDS.INVERSIONES.EJERCIDO]: values.ejercido || null,
        ...(values.estatus ? { [FIELDS.INVERSIONES.ESTATUS]: values.estatus } : {}),
        ...(values.proyectoId
          ? { [FIELDS.INVERSIONES.PROYECTO]: [values.proyectoId] }
          : {}),
      };
      if (editingId) await updateTableRow("inversiones", editingId, payload);
      else await createTableRow("inversiones", payload);
      return creating;
    },
    onSuccess: (creating) => {
      if (creating) showCreateSuccess("La inversión");
      queryClient.invalidateQueries({ queryKey: ["inversiones"] });
      setDialogOpen(false);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (row: Inversion) => deleteTableRow("inversiones", row.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["inversiones"] }),
  });

  const openCreate = useCallback(() => {
    setEditingId(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((row: Inversion) => {
    setEditingId(row.id);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingId(null);
  }, []);

  const value = useMemo(
    () => ({
      rows,
      filters,
      setFilters,
      tipos,
      agrupadores,
      proyectos,
      isLoading,
      error: error ? "Error al cargar datos" : null,
      dialogOpen,
      editingId,
      openCreate,
      openEdit,
      closeDialog,
      saveInversion: (values: InversionFormValues) =>
        saveMutation.mutateAsync(values).then(() => undefined),
      deleteInversion: (row: Inversion) =>
        deleteMutation.mutateAsync(row).then(() => undefined),
      isSaving: saveMutation.isPending,
    }),
    [
      rows,
      filters,
      tipos,
      agrupadores,
      proyectos,
      isLoading,
      error,
      dialogOpen,
      editingId,
      openCreate,
      openEdit,
      closeDialog,
      saveMutation,
      deleteMutation,
    ]
  );

  return (
    <InversionesContext.Provider value={value}>
      {children}
    </InversionesContext.Provider>
  );
}

export function useInversiones() {
  const ctx = useContext(InversionesContext);
  if (!ctx) {
    throw new Error("useInversiones debe usarse dentro de InversionesProvider");
  }
  return ctx;
}

export function getInversionEditValues(row: Inversion): InversionFormValues {
  return {
    fecha: row[FIELDS.INVERSIONES.FECHA]?.slice(0, 10) ?? "",
    presupuesto: row[FIELDS.INVERSIONES.PRESUPUESTO] ?? "",
    ingreso: row[FIELDS.INVERSIONES.INGRESO] ?? "",
    ejercido: row[FIELDS.INVERSIONES.EJERCIDO] ?? "",
    estatus: getSelectId(row[FIELDS.INVERSIONES.ESTATUS]) ?? null,
    tipoId: null,
    agrupadorId: null,
    proyectoId: row[FIELDS.INVERSIONES.PROYECTO]?.[0]?.id ?? null,
  };
}

export { defaultInversionFormValues };
