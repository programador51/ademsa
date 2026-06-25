"use client";

import {
  createContext,
  ReactNode,
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
  uploadFile,
} from "@/lib/api/data";
import { showCreateSuccess } from "@/lib/ui/alerts";
import { FIELDS } from "@/lib/baserow/constants";
import { Reporte } from "@/lib/baserow/types";
import { getLinkIds } from "@/lib/baserow/utils";
import {
  AdminReportesFilters,
  defaultAdminReportesFilters,
  reportMatchesAdminFilters,
} from "./filters";
import { ReporteFormValues } from "./schemas";

interface ReportesContextValue {
  reportes: Reporte[];
  filters: AdminReportesFilters;
  setFilters: (filters: AdminReportesFilters) => void;
  tipos: ReturnType<typeof useServiciosHierarchyData>["tipos"];
  agrupadores: ReturnType<typeof useServiciosHierarchyData>["agrupadores"];
  proyectos: ReturnType<typeof useServiciosHierarchyData>["proyectos"];
  isLoading: boolean;
  dialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  createReporte: (input: ReporteFormValues & { files: File[] }) => Promise<void>;
  isCreating: boolean;
}

const ReportesContext = createContext<ReportesContextValue | undefined>(
  undefined
);

export function ReportesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { condominioId, user } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState(defaultAdminReportesFilters);

  const apiFilters = condominioId
    ? buildCondominioFilter(condominioId, FIELDS.REPORTES.CONDOMINIO)
    : undefined;

  const { tipos, agrupadores, proyectos } = useServiciosHierarchyData(condominioId);

  const { data, isLoading } = useQuery({
    queryKey: ["reportes", condominioId],
    queryFn: () =>
      fetchTable<Reporte>("reportes", apiFilters ? { filters: apiFilters } : undefined),
    enabled: !!condominioId,
  });

  const reportes = useMemo(() => {
    const all = data?.results ?? [];
    if (!condominioId) return [];
    return all
      .filter((row) => {
        if (user?.id) {
          const reportadoPor = getLinkIds(row[FIELDS.REPORTES.REPORTADO_POR])[0];
          if (reportadoPor !== Number(user.id)) return false;
        }
        return reportMatchesAdminFilters(
          row,
          filters,
          agrupadores,
          proyectos,
          tipos
        );
      });
  }, [data, condominioId, user?.id, filters, agrupadores, proyectos, tipos]);

  const createMutation = useMutation({
    mutationFn: async ({
      descripcion,
      agrupadorId,
      proyectoId,
      files,
    }: ReporteFormValues & { files: File[] }) => {
      if (!condominioId) throw new Error("Condominio requerido");
      const proyecto = proyectos.find((row) => row.id === proyectoId);
      const proyectoAgrupadorId = proyecto
        ? getLinkIds(proyecto[FIELDS.PROYECTOS.AGRUPADOR])[0]
        : null;
      if (proyectoAgrupadorId && proyectoAgrupadorId !== agrupadorId) {
        throw new Error("El proyecto seleccionado no corresponde al agrupador");
      }
      const uploaded = await Promise.all(files.map((file) => uploadFile(file)));
      return createTableRow<Reporte>("reportes", {
        [FIELDS.REPORTES.DESCRIPCION]: descripcion,
        [FIELDS.REPORTES.CONDOMINIO]: [condominioId],
        ...(user?.id ? { [FIELDS.REPORTES.REPORTADO_POR]: user.id } : {}),
        [FIELDS.REPORTES.AGRUPADORES]: agrupadorId,
        ...(uploaded.length
          ? {
              [FIELDS.REPORTES.IMAGENES]: uploaded.map((f) => ({ name: f.name })),
            }
          : {}),
      });
    },
    onSuccess: () => {
      showCreateSuccess("El ticket");
      queryClient.invalidateQueries({ queryKey: ["reportes", condominioId] });
      queryClient.invalidateQueries({ queryKey: ["admin-reportes", condominioId] });
      setDialogOpen(false);
    },
  });

  const value = useMemo(
    () => ({
      reportes,
      filters,
      setFilters,
      tipos,
      agrupadores,
      proyectos,
      isLoading,
      dialogOpen,
      openDialog: () => setDialogOpen(true),
      closeDialog: () => setDialogOpen(false),
      createReporte: (input: ReporteFormValues & { files: File[] }) =>
        createMutation.mutateAsync(input).then(() => undefined),
      isCreating: createMutation.isPending,
    }),
    [reportes, filters, tipos, agrupadores, proyectos, isLoading, dialogOpen, createMutation]
  );

  return (
    <ReportesContext.Provider value={value}>{children}</ReportesContext.Provider>
  );
}

export function useReportes() {
  const ctx = useContext(ReportesContext);
  if (!ctx) {
    throw new Error("useReportes debe usarse dentro de ReportesProvider");
  }
  return ctx;
}

