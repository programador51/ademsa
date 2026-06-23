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
import {
  agrupadoresForTipos,
  proyectosForAgrupadores,
  tiposForCondominio,
} from "@/lib/baserow/condominioFilters";
import { showCreateSuccess } from "@/lib/ui/alerts";
import { FIELDS } from "@/lib/baserow/constants";
import { Agrupador, Proyecto, Tipo } from "@/lib/baserow/types";
import { getLinkIds } from "@/lib/baserow/utils";
import {
  agrupadoresByTipo,
  filterAgrupadores,
  filterProyectos,
  filterTipos,
} from "./filters";
import {
  defaultServicioFormValues,
  defaultServiciosFilters,
  ServicioFormValues,
  ServicioNivel,
  ServiciosFilters,
} from "./schemas";

interface ServiciosContextValue {
  nivel: ServicioNivel;
  setNivel: (nivel: ServicioNivel) => void;
  filters: ServiciosFilters;
  setFilters: (filters: ServiciosFilters) => void;
  filteredRows: (Tipo | Agrupador | Proyecto)[];
  tipos: Tipo[];
  agrupadores: Agrupador[];
  agrupadoresFiltrados: Agrupador[];
  isLoading: boolean;
  dialogOpen: boolean;
  editingId: number | null;
  openCreate: () => void;
  openEdit: (row: Tipo | Agrupador | Proyecto) => void;
  closeDialog: () => void;
  saveServicio: (values: ServicioFormValues) => Promise<void>;
  deleteServicio: (id: number) => Promise<void>;
  isSaving: boolean;
}

const ServiciosContext = createContext<ServiciosContextValue | undefined>(
  undefined
);

export function ServiciosProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { condominioId } = useApp();
  const [nivel, setNivel] = useState<ServicioNivel>(1);
  const [filters, setFilters] = useState<ServiciosFilters>(
    defaultServiciosFilters
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const tipoFilter = condominioId
    ? buildCondominioFilter(condominioId, FIELDS.TIPOS.CONDOMINIO)
    : undefined;

  const { data: tiposData, isLoading: loadingTipos } = useQuery({
    queryKey: ["tipos", condominioId],
    queryFn: () =>
      fetchTable<Tipo>("tipos", tipoFilter ? { filters: tipoFilter } : undefined),
    enabled: !!condominioId,
  });

  const { data: agrupadoresData, isLoading: loadingAgrupadores } = useQuery({
    queryKey: ["agrupadores-servicios", condominioId],
    queryFn: () => fetchTable<Agrupador>("agrupadores"),
    enabled: !!condominioId,
  });

  const { data: proyectosData, isLoading: loadingProyectos } = useQuery({
    queryKey: ["proyectos", condominioId],
    queryFn: () => fetchTable<Proyecto>("proyectos"),
    enabled: !!condominioId,
  });

  const tipos = useMemo(() => {
    if (!condominioId) return [];
    const fromApi = tiposData?.results ?? [];
    return tiposForCondominio(fromApi, condominioId);
  }, [tiposData, condominioId]);

  const tipoIds = useMemo(() => tipos.map((t) => t.id), [tipos]);

  const agrupadores = useMemo(
    () => agrupadoresForTipos(agrupadoresData?.results ?? [], tipoIds),
    [agrupadoresData, tipoIds]
  );

  const proyectos = useMemo(
    () => proyectosForAgrupadores(proyectosData?.results ?? [], agrupadores),
    [proyectosData, agrupadores]
  );

  const agrupadoresFiltrados = useMemo(
    () => agrupadoresByTipo(agrupadores, filters.tipoId),
    [agrupadores, filters.tipoId]
  );

  const filteredRows = useMemo(() => {
    if (nivel === 1) return filterTipos(tipos, filters);
    if (nivel === 2) return filterAgrupadores(agrupadores, filters);
    return filterProyectos(proyectos, filters, agrupadores);
  }, [nivel, filters, tipos, agrupadores, proyectos]);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["tipos", condominioId] });
    queryClient.invalidateQueries({ queryKey: ["agrupadores-servicios"] });
    queryClient.invalidateQueries({ queryKey: ["proyectos", condominioId] });
  }, [queryClient, condominioId]);

  const saveMutation = useMutation({
    mutationFn: async (values: ServicioFormValues) => {
      if (!condominioId) throw new Error("Condominio requerido");
      const creating = editingId === null;

      if (values.nivel === 1) {
        const payload = {
          [FIELDS.TIPOS.NOMBRE]: values.nombre,
          [FIELDS.TIPOS.CONDOMINIO]: condominioId,
        };
        if (editingId) await updateTableRow("tipos", editingId, payload);
        else await createTableRow("tipos", payload);
        return { creating, label: "El tipo" };
      }

      if (values.nivel === 2) {
        const payload = {
          [FIELDS.AGRUPADORES.NOMBRE]: values.nombre,
          [FIELDS.AGRUPADORES.TIPO]: [values.tipoId],
        };
        if (editingId) await updateTableRow("agrupadores", editingId, payload);
        else await createTableRow("agrupadores", payload);
        return { creating, label: "El agrupador" };
      }

      const payload = {
        [FIELDS.PROYECTOS.NOMBRE]: values.nombre,
        [FIELDS.PROYECTOS.DETALLES]: values.detalles ?? "",
        [FIELDS.PROYECTOS.CONDOMINIO]: [condominioId],
        [FIELDS.PROYECTOS.AGRUPADOR]: [values.agrupadorId],
      };
      if (editingId) await updateTableRow("proyectos", editingId, payload);
      else await createTableRow("proyectos", payload);
      return { creating, label: "El proyecto" };
    },
    onSuccess: (result) => {
      if (result?.creating) showCreateSuccess(result.label);
      invalidateAll();
      setDialogOpen(false);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const table =
        nivel === 1 ? "tipos" : nivel === 2 ? "agrupadores" : "proyectos";
      await deleteTableRow(table, id);
    },
    onSuccess: invalidateAll,
  });

  const openCreate = useCallback(() => {
    setEditingId(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback(
    (row: Tipo | Agrupador | Proyecto) => {
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
      nivel,
      setNivel: (next: ServicioNivel) => {
        setNivel(next);
        setFilters(defaultServiciosFilters);
      },
      filters,
      setFilters,
      filteredRows,
      tipos,
      agrupadores,
      agrupadoresFiltrados,
      isLoading: loadingTipos || loadingAgrupadores || loadingProyectos,
      dialogOpen,
      editingId,
      openCreate,
      openEdit,
      closeDialog,
      saveServicio: (values: ServicioFormValues) =>
        saveMutation.mutateAsync(values).then(() => undefined),
      deleteServicio: (id: number) =>
        deleteMutation.mutateAsync(id).then(() => undefined),
      isSaving: saveMutation.isPending,
    }),
    [
      nivel,
      filters,
      filteredRows,
      tipos,
      agrupadores,
      agrupadoresFiltrados,
      loadingTipos,
      loadingAgrupadores,
      loadingProyectos,
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
    <ServiciosContext.Provider value={value}>
      {children}
    </ServiciosContext.Provider>
  );
}

export function useServicios() {
  const ctx = useContext(ServiciosContext);
  if (!ctx) {
    throw new Error("useServicios debe usarse dentro de ServiciosProvider");
  }
  return ctx;
}

export function getEditFormValues(
  nivel: ServicioNivel,
  row: Tipo | Agrupador | Proyecto
): ServicioFormValues {
  if (nivel === 1) {
    const tipo = row as Tipo;
    return {
      ...defaultServicioFormValues,
      nivel: 1,
      nombre: tipo[FIELDS.TIPOS.NOMBRE],
    };
  }
  if (nivel === 2) {
    const agrupador = row as Agrupador;
    return {
      ...defaultServicioFormValues,
      nivel: 2,
      nombre: agrupador[FIELDS.AGRUPADORES.NOMBRE],
      tipoId: getLinkIds(agrupador[FIELDS.AGRUPADORES.TIPO])[0],
    };
  }
  const proyecto = row as Proyecto;
  return {
    ...defaultServicioFormValues,
    nivel: 3,
    nombre: proyecto[FIELDS.PROYECTOS.NOMBRE],
    detalles: proyecto[FIELDS.PROYECTOS.DETALLES],
    agrupadorId: getLinkIds(proyecto[FIELDS.PROYECTOS.AGRUPADOR])[0],
    tipoId: undefined,
  };
}
