"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
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
import { Agrupador, Proyecto, Reporte } from "@/lib/baserow/types";
import { getLinkIds, getSelectId } from "@/lib/baserow/utils";

interface AdminReportesContextValue {
  reportes: Reporte[];
  isLoading: boolean;
  updateReporte: (input: {
    id: number;
    estatus: number;
    fechaCierre?: string | null;
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
  proyectos: Proyecto[]
): number | undefined {
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
  const { agrupadores, proyectos } = useServiciosHierarchyData(condominioId);

  const filters = condominioId
    ? buildCondominioFilter(condominioId, FIELDS.REPORTES.CONDOMINIO)
    : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reportes", condominioId],
    queryFn: () =>
      fetchTable<Reporte>("reportes", filters ? { filters } : undefined),
    enabled: !!condominioId,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      estatus,
      fechaCierre,
    }: {
      id: number;
      estatus: number;
      fechaCierre?: string | null;
    }) => {
      await updateTableRow("reportes", id, {
        [FIELDS.REPORTES.ESTATUS]: estatus,
        [FIELDS.REPORTES.FECHA_CIERRE]:
          estatus === REPORTE_ESTATUS.CERRADA ? fechaCierre || null : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reportes", condominioId] });
      queryClient.invalidateQueries({ queryKey: ["reportes", condominioId] });
    },
  });

  const createCorrectivoMutation = useMutation({
    mutationFn: async (reporte: Reporte) => {
      const proyectoId = resolveProyectoIdForReporte(
        reporte,
        agrupadores,
        proyectos
      );
      const fechaReporte =
        reporte[FIELDS.REPORTES.FECHA_REPORTE]?.slice(0, 10) ??
        new Date().toISOString().slice(0, 10);

      if (!proyectoId) {
        throw new Error(
          "No se encontró un proyecto vinculado al agrupador del reporte"
        );
      }

      await createTableRow("mant-correctivos", {
        [FIELDS.MANT_CORRECTIVOS.DESCRIPCION]: reporte[FIELDS.REPORTES.DESCRIPCION],
        [FIELDS.MANT_CORRECTIVOS.FECHA_REPORTE]: fechaReporte,
        [FIELDS.MANT_CORRECTIVOS.PROYECTO]: proyectoId,
      });
    },
    onSuccess: () => {
      showCreateSuccess("El mantenimiento correctivo");
      queryClient.invalidateQueries({ queryKey: ["mant-correctivos"] });
    },
  });

  const updateReporte = useCallback(
    (input: { id: number; estatus: number; fechaCierre?: string | null }) =>
      updateMutation.mutateAsync(input).then(() => undefined),
    [updateMutation]
  );

  const createCorrectivoFromReporte = useCallback(
    (reporte: Reporte) =>
      createCorrectivoMutation.mutateAsync(reporte).then(() => undefined),
    [createCorrectivoMutation]
  );

  const value = useMemo(
    () => ({
      reportes: data?.results ?? [],
      isLoading,
      updateReporte,
      createCorrectivoFromReporte,
      isUpdating: updateMutation.isPending,
      isCreatingCorrectivo: createCorrectivoMutation.isPending,
    }),
    [
      data,
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
