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
  fetchTable,
  updateTableRow,
} from "@/lib/api/data";
import { showCreateSuccess } from "@/lib/ui/alerts";
import {
  FIELDS,
  REPORTE_ESTATUS,
} from "@/lib/baserow/constants";
import { Agrupador, MantenimientoCorrectivo, Proyecto, Reporte, Tipo } from "@/lib/baserow/types";
import { getLinkIds, getSelectId } from "@/lib/baserow/utils";
import {
  AdminReportesFilters,
  defaultAdminReportesFilters,
  reportMatchesAdminFilters,
  resolveReporteHierarchy,
} from "./filters";

interface AdminReportesContextValue {
  reportes: Reporte[];
  filters: AdminReportesFilters;
  setFilters: (filters: AdminReportesFilters) => void;
  tipos: ReturnType<typeof useServiciosHierarchyData>["tipos"];
  agrupadores: Agrupador[];
  proyectos: Proyecto[];
  isLoading: boolean;
  updateReporte: (input: {
    id: number;
    estatus: number;
    fechaCierre?: string | null;
    mantenimientoId?: number | null;
  }) => Promise<void>;
  createCorrectivoFromReporte: (reporte: Reporte) => Promise<void>;
  isUpdating: boolean;
  isCreatingCorrectivo: boolean;
}

const AdminReportesContext = createContext<AdminReportesContextValue | undefined>(
  undefined
);

function resolveProyectoIdForReporte(
  reporte: Reporte,
  agrupadores: Agrupador[],
  proyectos: Proyecto[],
  tipos: Tipo[]
): number | undefined {
  const hierarchy = resolveReporteHierarchy(
    reporte,
    agrupadores,
    proyectos,
    tipos
  );
  if (hierarchy.proyectoId) return hierarchy.proyectoId;

  const agrupadorId = getLinkIds(reporte[FIELDS.REPORTES.AGRUPADORES])[0];
  if (!agrupadorId) return undefined;

  const agrupador = agrupadores.find((row) => row.id === agrupadorId);
  const proyectoFromAgrupador = getLinkIds(
    agrupador?.[FIELDS.AGRUPADORES.PROYECTOS]
  )[0];
  if (proyectoFromAgrupador) return proyectoFromAgrupador;

  const proyecto = proyectos.find((row) =>
    getLinkIds(row[FIELDS.PROYECTOS.AGRUPADOR]).includes(agrupadorId)
  );
  return proyecto?.id;
}

export function AdminReportesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { condominioId } = useApp();
  const [filters, setFilters] = useState(defaultAdminReportesFilters);
  const { tipos, agrupadores, proyectos } = useServiciosHierarchyData(condominioId);

  const apiFilters = condominioId
    ? buildCondominioFilter(condominioId, FIELDS.REPORTES.CONDOMINIO)
    : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reportes", condominioId],
    queryFn: () =>
      fetchTable<Reporte>("reportes", apiFilters ? { filters: apiFilters } : undefined),
    enabled: !!condominioId,
  });

  const reportes = useMemo(() => {
    if (!condominioId) return [];
    return (data?.results ?? []).filter((row) =>
      reportMatchesAdminFilters(row, filters, agrupadores, proyectos, tipos)
    );
  }, [data, condominioId, filters, agrupadores, proyectos, tipos]);

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      estatus,
      fechaCierre,
      mantenimientoId,
    }: {
      id: number;
      estatus: number;
      fechaCierre?: string | null;
      mantenimientoId?: number | null;
    }) => {
      const fechaCierreValue =
        estatus === REPORTE_ESTATUS.CERRADA ? fechaCierre || null : null;

      await updateTableRow("reportes", id, {
        [FIELDS.REPORTES.ESTATUS]: estatus,
        [FIELDS.REPORTES.FECHA_CIERRE]: fechaCierreValue,
      });

      if (
        estatus === REPORTE_ESTATUS.CERRADA &&
        mantenimientoId &&
        fechaCierreValue
      ) {
        await updateTableRow("mant-correctivos", mantenimientoId, {
          [FIELDS.MANT_CORRECTIVOS.FECHA_CORRECCION]:
            fechaCierreValue.slice(0, 10),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reportes", condominioId] });
      queryClient.invalidateQueries({ queryKey: ["reportes", condominioId] });
      queryClient.invalidateQueries({ queryKey: ["mant-correctivos"] });
    },
  });

  const createCorrectivoMutation = useMutation({
    mutationFn: async (reporte: Reporte) => {
      const proyectoId = resolveProyectoIdForReporte(
        reporte,
        agrupadores,
        proyectos,
        tipos
      );
      const fechaReporte =
        reporte[FIELDS.REPORTES.FECHA_REPORTE]?.slice(0, 10) ??
        new Date().toISOString().slice(0, 10);

      if (!proyectoId) {
        throw new Error(
          "No se encontró un proyecto vinculado al agrupador del reporte"
        );
      }

      const created = await createTableRow<MantenimientoCorrectivo>("mant-correctivos", {
        [FIELDS.MANT_CORRECTIVOS.DESCRIPCION]: reporte[FIELDS.REPORTES.DESCRIPCION],
        [FIELDS.MANT_CORRECTIVOS.FECHA_REPORTE]: fechaReporte,
        [FIELDS.MANT_CORRECTIVOS.PROYECTO]: proyectoId,
        [FIELDS.MANT_CORRECTIVOS.REPORTES]: [reporte.id],
      });

      await updateTableRow("reportes", reporte.id, {
        [FIELDS.REPORTES.MANTENIMIENTO]: created.id,
      });
    },
    onSuccess: () => {
      showCreateSuccess("El mantenimiento correctivo");
      queryClient.invalidateQueries({ queryKey: ["mant-correctivos"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reportes", condominioId] });
      queryClient.invalidateQueries({ queryKey: ["reportes", condominioId] });
    },
  });

  const updateReporte = useCallback(
    (input: {
      id: number;
      estatus: number;
      fechaCierre?: string | null;
      mantenimientoId?: number | null;
    }) => updateMutation.mutateAsync(input).then(() => undefined),
    [updateMutation]
  );

  const createCorrectivoFromReporte = useCallback(
    (reporte: Reporte) =>
      createCorrectivoMutation.mutateAsync(reporte).then(() => undefined),
    [createCorrectivoMutation]
  );

  const value = useMemo(
    () => ({
      reportes,
      filters,
      setFilters,
      tipos,
      agrupadores,
      proyectos,
      isLoading,
      updateReporte,
      createCorrectivoFromReporte,
      isUpdating: updateMutation.isPending,
      isCreatingCorrectivo: createCorrectivoMutation.isPending,
    }),
    [
      reportes,
      filters,
      tipos,
      agrupadores,
      proyectos,
      isLoading,
      updateReporte,
      createCorrectivoFromReporte,
      updateMutation.isPending,
      createCorrectivoMutation.isPending,
    ]
  );

  return (
    <AdminReportesContext.Provider value={value}>
      {children}
    </AdminReportesContext.Provider>
  );
}

export function useAdminReportes() {
  const ctx = useContext(AdminReportesContext);
  if (!ctx) {
    throw new Error("useAdminReportes debe usarse dentro de AdminReportesProvider");
  }
  return ctx;
}

export function isReporteCerrado(reporte: Reporte): boolean {
  return getSelectId(reporte[FIELDS.REPORTES.ESTATUS]) === REPORTE_ESTATUS.CERRADA;
}
