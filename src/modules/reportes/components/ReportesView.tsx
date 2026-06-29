"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import MobileCardList from "@/components/common/MobileCardList";
import ReportAttachmentButton from "@/components/common/ReportAttachmentButton";
import ReportesFiltersBar from "@/components/filters/ReportesFiltersBar";
import FilePondUpload from "@/components/forms/FilePondUpload";
import { ProyectoHierarchyFields } from "@/components/forms/ProyectoHierarchyFields";
import { FormTextField } from "@/components/forms/FormTextField";
import { FIELDS, REPORTE_ESTATUS_LABELS } from "@/lib/baserow/constants";
import { getDefaultHierarchyForTipo } from "@/lib/baserow/proyectoHierarchyUtils";
import { formatDateTime, formatFolio } from "@/lib/formatters";
import { getSelectId } from "@/lib/baserow/utils";
import { resolveReporteHierarchy } from "../filters";
import {
  defaultReporteFormValues,
  reporteFormSchema,
  ReporteFormValues,
} from "../schemas";
import { useReportes } from "../ReportesContext";

interface ReportesViewProps {
  quickCreateTipoId?: number | null;
}

export default function ReportesView({
  quickCreateTipoId = null,
}: ReportesViewProps) {
  const router = useRouter();
  const {
    reportes,
    filters,
    setFilters,
    tipos,
    agrupadores,
    proyectos,
    isLoading,
    dialogOpen,
    openDialog,
    closeDialog,
    createReporte,
    isCreating,
  } = useReportes();
  const [files, setFiles] = useState<File[]>([]);
  const [hierarchyLocked, setHierarchyLocked] = useState(false);
  const quickCreateHandled = useRef(false);

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<ReporteFormValues>({
      resolver: yupResolver(reporteFormSchema) as Resolver<ReporteFormValues>,
      defaultValues: defaultReporteFormValues,
    });

  useEffect(() => {
    if (
      quickCreateHandled.current ||
      !quickCreateTipoId ||
      isLoading ||
      !Number.isFinite(quickCreateTipoId)
    ) {
      return;
    }

    const tipo = tipos.find((row) => row.id === quickCreateTipoId);
    if (!tipo || tipo[FIELDS.TIPOS.ACCESO_RAPIDO] !== true) {
      router.replace("/residente/reportes");
      return;
    }

    const { agrupadorId, proyectoId } = getDefaultHierarchyForTipo(
      quickCreateTipoId,
      agrupadores,
      proyectos,
    );
    if (!agrupadorId || !proyectoId) {
      router.replace("/residente/reportes");
      return;
    }

    quickCreateHandled.current = true;
    setHierarchyLocked(true);
    reset({
      descripcion: "",
      tipoId: quickCreateTipoId,
      agrupadorId,
      proyectoId,
    });
    openDialog();
    router.replace("/residente/reportes");
  }, [
    quickCreateTipoId,
    tipos,
    agrupadores,
    proyectos,
    isLoading,
    reset,
    openDialog,
    router,
  ]);

  const handleClose = () => {
    setHierarchyLocked(false);
    reset(defaultReporteFormValues);
    setFiles([]);
    closeDialog();
  };

  const handleOpenCreate = () => {
    setHierarchyLocked(false);
    reset(defaultReporteFormValues);
    openDialog();
  };

  const onSubmit = handleSubmit(async (values) => {
    await createReporte({ ...values, files });
    setHierarchyLocked(false);
    reset(defaultReporteFormValues);
    setFiles([]);
  });

  return (
    <Stack spacing={2}>
      <ReportesFiltersBar
        filters={filters}
        onChange={setFilters}
        tipos={tipos}
        agrupadores={agrupadores}
        proyectos={proyectos}
        useTicketLabels
      />

      <MobileCardList
        title="Mis tickets"
        rows={reportes}
        loading={isLoading}
        columns={[
          {
            id: "folio",
            label: "Folio",
            render: (row) => formatFolio(row.id),
          },
          {
            id: FIELDS.REPORTES.DESCRIPCION,
            label: "Descripción",
            primary: true,
            render: (row) => row[FIELDS.REPORTES.DESCRIPCION],
          },
          {
            id: FIELDS.REPORTES.FECHA_REPORTE,
            label: "Fecha",
            render: (row) => formatDateTime(row[FIELDS.REPORTES.FECHA_REPORTE]),
          },
          {
            id: FIELDS.REPORTES.ESTATUS,
            label: "Estatus",
            render: (row) => {
              const id = getSelectId(row[FIELDS.REPORTES.ESTATUS]);
              return id ? (REPORTE_ESTATUS_LABELS[id] ?? "—") : "—";
            },
          },
          {
            id: "tipo",
            label: "Nivel 1 · Tipo",
            render: (row) =>
              resolveReporteHierarchy(row, agrupadores, proyectos, tipos)
                .tipoNombre,
          },
          {
            id: "agrupador",
            label: "Nivel 2 · Agrupador",
            render: (row) =>
              resolveReporteHierarchy(row, agrupadores, proyectos, tipos)
                .agrupadorNombre,
          },
          {
            id: "proyecto",
            label: "Nivel 3 · Proyecto",
            render: (row) =>
              resolveReporteHierarchy(row, agrupadores, proyectos, tipos)
                .proyectoNombre,
          },
          {
            id: FIELDS.REPORTES.IMAGENES,
            label: "Archivos adjuntos",
            render: (row) => {
              const imagenes = row[FIELDS.REPORTES.IMAGENES] ?? [];
              if (!imagenes.length) return "—";
              return (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: "wrap", width: "100%", mt: 0.5 }}
                >
                  {imagenes.map((image, index) => (
                    <ReportAttachmentButton
                      key={`${image.url}-${index}`}
                      image={image}
                      index={index}
                    />
                  ))}
                </Stack>
              );
            },
          },
        ]}
        headerAction={
          <Button size="small" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Nuevo
          </Button>
        }
      />

      <Dialog open={dialogOpen} onClose={handleClose} fullScreen>
        <DialogTitle>Nuevo ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <ProyectoHierarchyFields
              control={control}
              watch={watch}
              setValue={setValue}
              required
              disabled={hierarchyLocked}
            />
            <FormTextField
              name="descripcion"
              control={control}
              label="Descripción"
              multiline
              minRows={4}
              required
            />

            <FilePondUpload files={files} onChange={setFiles} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={onSubmit} disabled={isCreating}>
            Crear ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
