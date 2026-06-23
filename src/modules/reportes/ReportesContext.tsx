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
import {
  buildCondominioFilter,
  createTableRow,
  fetchTable,
  uploadFile,
} from "@/lib/api/data";
import { agrupadoresForTipos } from "@/lib/baserow/condominioFilters";
import { showCreateSuccess } from "@/lib/ui/alerts";
import { FIELDS } from "@/lib/baserow/constants";
import { Agrupador, Reporte, Tipo } from "@/lib/baserow/types";

interface ReportesContextValue {
  reportes: Reporte[];
  agrupadores: Agrupador[];
  isLoading: boolean;
  dialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  createReporte: (input: {
    descripcion: string;
    agrupadorId?: number;
    files: File[];
  }) => Promise<void>;
  isCreating: boolean;
}

const ReportesContext = createContext<ReportesContextValue | undefined>(
  undefined
);

export function ReportesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { condominioId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);

  const filters = condominioId
    ? buildCondominioFilter(condominioId, FIELDS.REPORTES.CONDOMINIO)
    : undefined;

  const tipoFilter = condominioId
    ? buildCondominioFilter(condominioId, FIELDS.TIPOS.CONDOMINIO)
    : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["reportes", condominioId],
    queryFn: () =>
      fetchTable<Reporte>("reportes", filters ? { filters } : undefined),
    enabled: !!condominioId,
  });

  const { data: tiposData } = useQuery({
    queryKey: ["tipos-reportes", condominioId],
    queryFn: () =>
      fetchTable<Tipo>("tipos", tipoFilter ? { filters: tipoFilter } : undefined),
    enabled: !!condominioId,
  });

  const { data: agrupadoresData } = useQuery({
    queryKey: ["agrupadores-reportes", condominioId],
    queryFn: () => fetchTable<Agrupador>("agrupadores"),
    enabled: !!condominioId,
  });

  const agrupadores = useMemo(() => {
    const tipos = tiposData?.results ?? [];
    const tipoIds = tipos.map((t) => t.id);
    return agrupadoresForTipos(agrupadoresData?.results ?? [], tipoIds);
  }, [tiposData, agrupadoresData]);

  const createMutation = useMutation({
    mutationFn: async ({
      descripcion,
      agrupadorId,
      files,
    }: {
      descripcion: string;
      agrupadorId?: number;
      files: File[];
    }) => {
      if (!condominioId) throw new Error("Condominio requerido");
      const uploaded = await Promise.all(files.map((file) => uploadFile(file)));
      return createTableRow<Reporte>("reportes", {
        [FIELDS.REPORTES.DESCRIPCION]: descripcion,
        [FIELDS.REPORTES.CONDOMINIO]: [condominioId],
        ...(agrupadorId
          ? { [FIELDS.REPORTES.AGRUPADORES]: [agrupadorId] }
          : {}),
        ...(uploaded.length
          ? {
              [FIELDS.REPORTES.IMAGENES]: uploaded.map((f) => ({ name: f.name })),
            }
          : {}),
      });
    },
    onSuccess: () => {
      showCreateSuccess("El reporte");
      queryClient.invalidateQueries({ queryKey: ["reportes", condominioId] });
      setDialogOpen(false);
    },
  });

  const value = useMemo(
    () => ({
      reportes: data?.results ?? [],
      agrupadores,
      isLoading,
      dialogOpen,
      openDialog: () => setDialogOpen(true),
      closeDialog: () => setDialogOpen(false),
      createReporte: (input: {
        descripcion: string;
        agrupadorId?: number;
        files: File[];
      }) => createMutation.mutateAsync(input).then(() => undefined),
      isCreating: createMutation.isPending,
    }),
    [data, agrupadores, isLoading, dialogOpen, createMutation]
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
