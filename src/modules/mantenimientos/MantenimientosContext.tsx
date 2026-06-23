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
import {
  defaultProyectoHierarchyFilters,
  ProyectoHierarchyFilters,
  rowMatchesHierarchyFilters,
} from "@/lib/baserow/proyectoHierarchyUtils";
import { showCreateSuccess } from "@/lib/ui/alerts";
import { FIELDS } from "@/lib/baserow/constants";
import {
  Agrupador,
  MantenimientoCorrectivo,
  MantenimientoPreventivo,
  Proyecto,
  Tipo,
} from "@/lib/baserow/types";
import {
  defaultMantCorrectivoValues,
  defaultMantPreventivoValues,
  MantCorrectivoFormValues,
  MantenimientoTipo,
  MantPreventivoFormValues,
} from "./schemas";

interface MantenimientosContextValue {
  tipo: MantenimientoTipo;
  rows: (MantenimientoPreventivo | MantenimientoCorrectivo)[];
  hierarchyFilters: ProyectoHierarchyFilters;
  setHierarchyFilters: (filters: ProyectoHierarchyFilters) => void;
  tipos: Tipo[];
  agrupadores: Agrupador[];
  proyectos: Proyecto[];
  isLoading: boolean;
  error: string | null;
  dialogOpen: boolean;
  editingId: number | null;
  openCreate: () => void;
  openEdit: (row: MantenimientoPreventivo | MantenimientoCorrectivo) => void;
  closeDialog: () => void;
  savePreventivo: (values: MantPreventivoFormValues) => Promise<void>;
  saveCorrectivo: (values: MantCorrectivoFormValues) => Promise<void>;
  deleteRow: (row: MantenimientoPreventivo | MantenimientoCorrectivo) => Promise<void>;
  isSaving: boolean;
}

const MantenimientosContext = createContext<MantenimientosContextValue | undefined>(
  undefined
);

export function MantenimientosProvider({
  children,
  tipo,
}: {
  children: ReactNode;
  tipo: MantenimientoTipo;
}) {
  const queryClient = useQueryClient();
  const { condominioId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [hierarchyFilters, setHierarchyFilters] = useState(
    defaultProyectoHierarchyFilters
  );

  const { tipos, agrupadores, proyectos } =
    useServiciosHierarchyData(condominioId);

  const tableKey = tipo === "preventivo" ? "mant-preventivos" : "mant-correctivos";
  const queryKey = tipo === "preventivo" ? "mant-preventivos" : "mant-correctivos";

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
    queryKey: [queryKey, condominioId],
    queryFn: () =>
      fetchTable<MantenimientoPreventivo | MantenimientoCorrectivo>(tableKey),
    enabled: !!condominioId,
  });

  const rows = useMemo(() => {
    const all = data?.results ?? [];
    if (tipo === "preventivo") {
      const base = (all as MantenimientoPreventivo[]).filter((row) =>
        rowBelongsToProyectos(row[FIELDS.MANT_PREVENTIVOS.PROYECTO], proyectoIds)
      );
      return base.filter((row) =>
        rowMatchesHierarchyFilters(
          row[FIELDS.MANT_PREVENTIVOS.PROYECTO],
          hierarchyFilters,
          agrupadores,
          proyectos,
          tipos
        )
      );
    }
    return (all as MantenimientoCorrectivo[]).filter((row) =>
      rowBelongsToProyectos(row[FIELDS.MANT_CORRECTIVOS.PROYECTO], proyectoIds)
    );
  }, [
    data,
    proyectoIds,
    tipo,
    hierarchyFilters,
    agrupadores,
    proyectos,
    tipos,
  ]);

  const savePreventivoMutation = useMutation({
    mutationFn: async (values: MantPreventivoFormValues) => {
      const creating = editingId === null;
      const payload = {
        [FIELDS.MANT_PREVENTIVOS.ULTIMO]: values.ultimo || null,
        [FIELDS.MANT_PREVENTIVOS.SIGUIENTE]: values.siguiente || null,
        ...(values.proyectoId
          ? { [FIELDS.MANT_PREVENTIVOS.PROYECTO]: [values.proyectoId] }
          : {}),
      };
      if (editingId) await updateTableRow("mant-preventivos", editingId, payload);
      else await createTableRow("mant-preventivos", payload);
      return creating;
    },
    onSuccess: (creating) => {
      if (creating) showCreateSuccess("El mantenimiento preventivo");
      queryClient.invalidateQueries({ queryKey: ["mant-preventivos"] });
      setDialogOpen(false);
      setEditingId(null);
    },
  });

  const saveCorrectivoMutation = useMutation({
    mutationFn: async (values: MantCorrectivoFormValues) => {
      const creating = editingId === null;
      const payload = {
        [FIELDS.MANT_CORRECTIVOS.PRESUPUESTO]: values.presupuesto || null,
        [FIELDS.MANT_CORRECTIVOS.EJERCIDO]: values.ejercido || null,
        ...(values.proyectoId
          ? { [FIELDS.MANT_CORRECTIVOS.PROYECTO]: [values.proyectoId] }
          : {}),
      };
      if (editingId) await updateTableRow("mant-correctivos", editingId, payload);
      else await createTableRow("mant-correctivos", payload);
      return creating;
    },
    onSuccess: (creating) => {
      if (creating) showCreateSuccess("El mantenimiento correctivo");
      queryClient.invalidateQueries({ queryKey: ["mant-correctivos"] });
      setDialogOpen(false);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (row: MantenimientoPreventivo | MantenimientoCorrectivo) =>
      deleteTableRow(tableKey, row.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });

  const openCreate = useCallback(() => {
    setEditingId(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback(
    (row: MantenimientoPreventivo | MantenimientoCorrectivo) => {
      setEditingId(row.id);
      setDialogOpen(true);
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingId(null);
  }, []);

  const value = useMemo(
    () => ({
      tipo,
      rows,
      hierarchyFilters,
      setHierarchyFilters,
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
      savePreventivo: (values: MantPreventivoFormValues) =>
        savePreventivoMutation.mutateAsync(values).then(() => undefined),
      saveCorrectivo: (values: MantCorrectivoFormValues) =>
        saveCorrectivoMutation.mutateAsync(values).then(() => undefined),
      deleteRow: (row: MantenimientoPreventivo | MantenimientoCorrectivo) =>
        deleteMutation.mutateAsync(row).then(() => undefined),
      isSaving:
        savePreventivoMutation.isPending || saveCorrectivoMutation.isPending,
    }),
    [
      tipo,
      rows,
      hierarchyFilters,
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
      savePreventivoMutation,
      saveCorrectivoMutation,
      deleteMutation,
    ]
  );

  return (
    <MantenimientosContext.Provider value={value}>
      {children}
    </MantenimientosContext.Provider>
  );
}

export function useMantenimientos() {
  const ctx = useContext(MantenimientosContext);
  if (!ctx) {
    throw new Error("useMantenimientos debe usarse dentro de MantenimientosProvider");
  }
  return ctx;
}

export function getPreventivoEditValues(
  row: MantenimientoPreventivo
): MantPreventivoFormValues {
  return {
    ultimo: row[FIELDS.MANT_PREVENTIVOS.ULTIMO]?.slice(0, 10) ?? "",
    siguiente: row[FIELDS.MANT_PREVENTIVOS.SIGUIENTE]?.slice(0, 10) ?? "",
    tipoId: null,
    agrupadorId: null,
    proyectoId: row[FIELDS.MANT_PREVENTIVOS.PROYECTO]?.[0]?.id ?? null,
  };
}

export function getCorrectivoEditValues(
  row: MantenimientoCorrectivo
): MantCorrectivoFormValues {
  return {
    presupuesto: row[FIELDS.MANT_CORRECTIVOS.PRESUPUESTO] ?? "",
    ejercido: row[FIELDS.MANT_CORRECTIVOS.EJERCIDO] ?? "",
    proyectoId: row[FIELDS.MANT_CORRECTIVOS.PROYECTO]?.[0]?.id ?? null,
  };
}

export { defaultMantCorrectivoValues, defaultMantPreventivoValues };
