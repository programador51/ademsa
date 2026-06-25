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
import { useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import MobileCardList from "@/components/common/MobileCardList";
import ReportesFiltersBar from "@/components/filters/ReportesFiltersBar";
import FilePondUpload from "@/components/forms/FilePondUpload";
import { ProyectoHierarchyFields } from "@/components/forms/ProyectoHierarchyFields";
import { FormTextField } from "@/components/forms/FormTextField";
import { useApp } from "@/contexts/AppContext";
import { FIELDS, REPORTE_ESTATUS_LABELS } from "@/lib/baserow/constants";
import { formatDateTime } from "@/lib/formatters";
import { getSelectId } from "@/lib/baserow/utils";
import { resolveReporteHierarchy } from "../filters";
import {
  defaultReporteFormValues,
  reporteFormSchema,
  ReporteFormValues,
} from "../schemas";
import { useReportes } from "../ReportesContext";

export default function ReportesView() {
  const { condominioId } = useApp();
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

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<ReporteFormValues>({
      resolver: yupResolver(reporteFormSchema) as Resolver<ReporteFormValues>,
      defaultValues: defaultReporteFormValues,
    });

  const handleClose = () => {
    reset(defaultReporteFormValues);
    setFiles([]);
    closeDialog();
  };

  const onSubmit = handleSubmit(async (values) => {
    await createReporte({ ...values, files });
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
      />

      <MobileCardList
        title="Mis reportes"
        rows={reportes}
        loading={isLoading}
        columns={[
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
              resolveReporteHierarchy(row, agrupadores, proyectos, tipos).tipoNombre,
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
        ]}
        headerAction={
          <Button size="small" startIcon={<AddIcon />} onClick={openDialog}>
            Nuevo
          </Button>
        }
      />

      <Dialog open={dialogOpen} onClose={handleClose} fullScreen>
        <DialogTitle>Nuevo reporte</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormTextField
              name="descripcion"
              control={control}
              label="Descripción"
              multiline
              minRows={4}
              required
            />
            <ProyectoHierarchyFields
              control={control}
              watch={watch}
              setValue={setValue}
              required
            />
            <FilePondUpload files={files} onChange={setFiles} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={onSubmit} disabled={isCreating}>
            Crear reporte
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
