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
  rowMatchesHierarchyFilters,
} from "@/lib/baserow/proyectoHierarchyUtils";
import { showCreateSuccess } from "@/lib/ui/alerts";
import { FIELDS, REPORTE_ESTATUS } from "@/lib/baserow/constants";
import { matchesFolioSearch } from "@/lib/formatters";
import {
  Agrupador,
  MantenimientoCorrectivo,
  MantenimientoPreventivo,
  Proyecto,
  Reporte,
  Tipo,
} from "@/lib/baserow/types";
import { getLinkIds } from "@/lib/baserow/utils";
import {
  defaultMantCorrectivoFilters,
  defaultMantPreventivoFilters,
  MantCorrectivoFilters,
  MantPreventivoFilters,
} from "./filters";
import {
  defaultMantCorrectivoValues,
  defaultMantPreventivoValues,
  MantCorrectivoFormValues,
  MantenimientoTipo,
  MantPreventivoFollowUpFormValues,
  MantPreventivoFormValues,
} from "./schemas";

interface MantenimientosContextValue {
  tipo: MantenimientoTipo;
  rows: (MantenimientoPreventivo | MantenimientoCorrectivo)[];
  hierarchyFilters: MantPreventivoFilters;
  setHierarchyFilters: (filters: MantPreventivoFilters) => void;
  correctivoFilters: MantCorrectivoFilters;
  setCorrectivoFilters: (filters: MantCorrectivoFilters) => void;
  tipos: Tipo[];
  agrupadores: Agrupador[];
  proyectos: Proyecto[];
  isLoading: boolean;
  error: string | null;
  dialogOpen: boolean;
  editingId: number | null;
  followUpParentId: number | null;
  reportesById: Map<number, Reporte>;
  preventivosById: Map<number, MantenimientoPreventivo>;
  openCreate: () => void;
  openEdit: (row: MantenimientoPreventivo | MantenimientoCorrectivo) => void;
  openFollowUp: (row: MantenimientoPreventivo) => void;
  closeDialog: () => void;
  savePreventivo: (values: MantPreventivoFormValues) => Promise<void>;
  savePreventivoFollowUp: (values: MantPreventivoFollowUpFormValues) => Promise<void>;
  saveCorrectivo: (values: MantCorrectivoFormValues) => Promise<void>;
  closeCorrectivoTicket: (row: MantenimientoCorrectivo) => Promise<void>;
  deleteRow: (row: MantenimientoPreventivo | MantenimientoCorrectivo) => Promise<void>;
  isSaving: boolean;
  isClosingCorrectivo: boolean;
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
  const [followUpParentId, setFollowUpParentId] = useState<number | null>(null);
  const [hierarchyFilters, setHierarchyFilters] = useState(
    defaultMantPreventivoFilters
  );
  const [correctivoFilters, setCorrectivoFilters] = useState(
    defaultMantCorrectivoFilters
  );

  const { tipos, agrupadores, proyectos } =
    useServiciosHierarchyData(condominioId);

  const proyectoIds = useMemo(
    () => proyectoIdsForCondominio(proyectos),
    [proyectos]
  );

  const tableKey = tipo === "preventivo" ? "mant-preventivos" : "mant-correctivos";
  const queryKey = tipo === "preventivo" ? "mant-preventivos" : "mant-correctivos";

  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey, condominioId],
    queryFn: () =>
      fetchTable<MantenimientoPreventivo | MantenimientoCorrectivo>(tableKey),
    enabled: !!condominioId,
  });

  const reportesFilter = condominioId
    ? buildCondominioFilter(condominioId, FIELDS.REPORTES.CONDOMINIO)
    : undefined;

  const { data: reportesData } = useQuery({
    queryKey: ["reportes-mant", condominioId],
    queryFn: () =>
      fetchTable<Reporte>(
        "reportes",
        reportesFilter ? { filters: reportesFilter } : undefined
      ),
    enabled: !!condominioId && tipo === "correctivo",
  });

  const reportesById = useMemo(() => {
    const map = new Map<number, Reporte>();
    for (const row of reportesData?.results ?? []) {
      map.set(row.id, row);
    }
    return map;
  }, [reportesData]);

  const preventivosById = useMemo(() => {
    const map = new Map<number, MantenimientoPreventivo>();
    if (tipo !== "preventivo") return map;
    for (const row of data?.results ?? []) {
      map.set(row.id, row as MantenimientoPreventivo);
    }
    return map;
  }, [data, tipo]);

  const rows = useMemo(() => {
    const all = data?.results ?? [];
    if (tipo === "preventivo") {
      const base = (all as MantenimientoPreventivo[]).filter((row) =>
        rowBelongsToProyectos(row[FIELDS.MANT_PREVENTIVOS.PROYECTO], proyectoIds)
      );
      return base.filter((row) => {
        if (
          !matchesFolioSearch(row[FIELDS.MANT_PREVENTIVOS.FOLIO], hierarchyFilters.folio)
        ) {
          return false;
        }
        return rowMatchesHierarchyFilters(
          row[FIELDS.MANT_PREVENTIVOS.PROYECTO],
          hierarchyFilters,
          agrupadores,
          proyectos,
          tipos
        );
      });
    }
    return (all as MantenimientoCorrectivo[])
      .filter((row) =>
        rowBelongsToProyectos(row[FIELDS.MANT_CORRECTIVOS.PROYECTO], proyectoIds)
      )
      .filter((row) => {
        const estatus = row[FIELDS.MANT_CORRECTIVOS.ESTATUS] ?? "";
        if (correctivoFilters.estatus && estatus !== correctivoFilters.estatus) {
          return false;
        }
        if (
          !matchesFolioSearch(row[FIELDS.MANT_CORRECTIVOS.FOLIO], correctivoFilters.folio)
        ) {
          return false;
        }
        return rowMatchesHierarchyFilters(
          row[FIELDS.MANT_CORRECTIVOS.PROYECTO],
          correctivoFilters,
          agrupadores,
          proyectos,
          tipos
        );
      });
  }, [
    data,
    proyectoIds,
    tipo,
    hierarchyFilters,
    correctivoFilters,
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
          ? { [FIELDS.MANT_PREVENTIVOS.PROYECTO]: values.proyectoId }
          : {}),
        ...(editingId
          ? {
              [FIELDS.MANT_PREVENTIVOS.APLICADO_EL]: values.aplicadoEl || null,
            }
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
      setFollowUpParentId(null);
    },
  });

  const savePreventivoFollowUpMutation = useMutation({
    mutationFn: async (values: MantPreventivoFollowUpFormValues) => {
      if (!followUpParentId) throw new Error("Registro padre no encontrado");
      const parent = (data?.results ?? []).find(
        (row) => row.id === followUpParentId
      ) as MantenimientoPreventivo | undefined;
      if (!parent) throw new Error("Registro padre no encontrado");

      const fechaAplicada =
        parent[FIELDS.MANT_PREVENTIVOS.SIGUIENTE]?.slice(0, 10) ?? null;
      const proyectoId = getLinkIds(parent[FIELDS.MANT_PREVENTIVOS.PROYECTO])[0];

      await createTableRow("mant-preventivos", {
        [FIELDS.MANT_PREVENTIVOS.ULTIMO]: fechaAplicada,
        [FIELDS.MANT_PREVENTIVOS.SIGUIENTE]: values.siguiente || null,
        [FIELDS.MANT_PREVENTIVOS.MANTENIMIENTO_ANTERIOR]: parent.id,
        ...(proyectoId ? { [FIELDS.MANT_PREVENTIVOS.PROYECTO]: proyectoId } : {}),
      });
    },
    onSuccess: () => {
      showCreateSuccess("El seguimiento de mantenimiento preventivo");
      queryClient.invalidateQueries({ queryKey: ["mant-preventivos"] });
      setDialogOpen(false);
      setFollowUpParentId(null);
    },
  });

  const saveCorrectivoMutation = useMutation({
    mutationFn: async (values: MantCorrectivoFormValues) => {
      const creating = editingId === null;
      const payload = {
        [FIELDS.MANT_CORRECTIVOS.PRESUPUESTO]: values.presupuesto || null,
        [FIELDS.MANT_CORRECTIVOS.EJERCIDO]: values.ejercido || null,
        [FIELDS.MANT_CORRECTIVOS.FECHA_REPORTE]: values.fechaReporte || null,
        [FIELDS.MANT_CORRECTIVOS.FECHA_CORRECCION]: values.fechaCorreccion || null,
        [FIELDS.MANT_CORRECTIVOS.DESCRIPCION]: values.descripcion || null,
        [FIELDS.MANT_CORRECTIVOS.NOTAS]: values.notas || null,
        ...(values.proyectoId
          ? { [FIELDS.MANT_CORRECTIVOS.PROYECTO]: values.proyectoId }
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

  const closeCorrectivoMutation = useMutation({
    mutationFn: async (row: MantenimientoCorrectivo) => {
      const today = new Date().toISOString().slice(0, 10);
      const fechaCierreReporte = new Date().toISOString();

      await updateTableRow("mant-correctivos", row.id, {
        [FIELDS.MANT_CORRECTIVOS.FECHA_CORRECCION]: today,
      });

      const reporteIds = getLinkIds(row[FIELDS.MANT_CORRECTIVOS.REPORTES]);
      if (reporteIds.length > 0) {
        await Promise.all(
          reporteIds.map((reporteId) =>
            updateTableRow("reportes", reporteId, {
              [FIELDS.REPORTES.ESTATUS]: REPORTE_ESTATUS.CERRADA,
              [FIELDS.REPORTES.FECHA_CIERRE]: fechaCierreReporte,
            })
          )
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mant-correctivos"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reportes"] });
      queryClient.invalidateQueries({ queryKey: ["reportes"] });
      queryClient.invalidateQueries({ queryKey: ["reportes-mant", condominioId] });
    },
  });

  const openCreate = useCallback(() => {
    setEditingId(null);
    setFollowUpParentId(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback(
    (row: MantenimientoPreventivo | MantenimientoCorrectivo) => {
      setEditingId(row.id);
      setFollowUpParentId(null);
      setDialogOpen(true);
    },
    []
  );

  const openFollowUp = useCallback((row: MantenimientoPreventivo) => {
    setEditingId(null);
    setFollowUpParentId(row.id);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingId(null);
    setFollowUpParentId(null);
  }, []);

  const value = useMemo(
    () => ({
      tipo,
      rows,
      hierarchyFilters,
      setHierarchyFilters,
      correctivoFilters,
      setCorrectivoFilters,
      tipos,
      agrupadores,
      proyectos,
      isLoading,
      error: error ? "Error al cargar datos" : null,
      dialogOpen,
      editingId,
      followUpParentId,
      reportesById,
      preventivosById,
      openCreate,
      openEdit,
      openFollowUp,
      closeDialog,
      savePreventivo: (values: MantPreventivoFormValues) =>
        savePreventivoMutation.mutateAsync(values).then(() => undefined),
      savePreventivoFollowUp: (values: MantPreventivoFollowUpFormValues) =>
        savePreventivoFollowUpMutation.mutateAsync(values).then(() => undefined),
      saveCorrectivo: (values: MantCorrectivoFormValues) =>
        saveCorrectivoMutation.mutateAsync(values).then(() => undefined),
      closeCorrectivoTicket: (row: MantenimientoCorrectivo) =>
        closeCorrectivoMutation.mutateAsync(row).then(() => undefined),
      deleteRow: (row: MantenimientoPreventivo | MantenimientoCorrectivo) =>
        deleteMutation.mutateAsync(row).then(() => undefined),
      isSaving:
        savePreventivoMutation.isPending || saveCorrectivoMutation.isPending,
      isClosingCorrectivo: closeCorrectivoMutation.isPending,
    }),
    [
      tipo,
      rows,
      hierarchyFilters,
      correctivoFilters,
      tipos,
      agrupadores,
      proyectos,
      isLoading,
      error,
      dialogOpen,
      editingId,
      followUpParentId,
      reportesById,
      preventivosById,
      openCreate,
      openEdit,
      openFollowUp,
      closeDialog,
      savePreventivoMutation,
      savePreventivoFollowUpMutation,
      saveCorrectivoMutation,
      closeCorrectivoMutation,
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

export function getPreventivoAnteriorId(
  row: MantenimientoPreventivo
): number | null {
  const ids = getLinkIds(row[FIELDS.MANT_PREVENTIVOS.MANTENIMIENTO_ANTERIOR]);
  return ids[0] ?? null;
}

export function hasPreventivoAnterior(row: MantenimientoPreventivo): boolean {
  return getPreventivoAnteriorId(row) != null;
}

export function getPreventivoEditValues(
  row: MantenimientoPreventivo
): MantPreventivoFormValues {
  return {
    ultimo: row[FIELDS.MANT_PREVENTIVOS.ULTIMO]?.slice(0, 10) ?? "",
    siguiente: row[FIELDS.MANT_PREVENTIVOS.SIGUIENTE]?.slice(0, 10) ?? "",
    aplicadoEl: row[FIELDS.MANT_PREVENTIVOS.APLICADO_EL]?.slice(0, 10) ?? "",
    tipoId: null,
    agrupadorId: null,
    proyectoId: getLinkIds(row[FIELDS.MANT_PREVENTIVOS.PROYECTO])[0] ?? null,
  };
}

export function getCorrectivoEditValues(
  row: MantenimientoCorrectivo
): MantCorrectivoFormValues {
  return {
    presupuesto: row[FIELDS.MANT_CORRECTIVOS.PRESUPUESTO] ?? "",
    ejercido: row[FIELDS.MANT_CORRECTIVOS.EJERCIDO] ?? "",
    fechaReporte: row[FIELDS.MANT_CORRECTIVOS.FECHA_REPORTE]?.slice(0, 10) ?? "",
    fechaCorreccion:
      row[FIELDS.MANT_CORRECTIVOS.FECHA_CORRECCION]?.slice(0, 10) ?? "",
    descripcion: row[FIELDS.MANT_CORRECTIVOS.DESCRIPCION] ?? "",
    notas: row[FIELDS.MANT_CORRECTIVOS.NOTAS] ?? "",
    tipoId: null,
    agrupadorId: null,
    proyectoId: getLinkIds(row[FIELDS.MANT_CORRECTIVOS.PROYECTO])[0] ?? null,
  };
}

export function getCorrectivoDisplayDescription(
  row: MantenimientoCorrectivo,
  reportesById: Map<number, Reporte>
): string {
  const reporteIds = getLinkIds(row[FIELDS.MANT_CORRECTIVOS.REPORTES]);
  for (const reporteId of reporteIds) {
    const reporte = reportesById.get(reporteId);
    const descripcion = reporte?.[FIELDS.REPORTES.DESCRIPCION]?.trim();
    if (descripcion) return descripcion;
  }
  return row[FIELDS.MANT_CORRECTIVOS.DESCRIPCION]?.trim() || "—";
}

export function isCorrectivoCerrado(row: MantenimientoCorrectivo): boolean {
  return !!row[FIELDS.MANT_CORRECTIVOS.FECHA_CORRECCION];
}

export { defaultMantCorrectivoValues, defaultMantPreventivoValues };
