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
import * as yup from "yup";
import MobileCardList from "@/components/common/MobileCardList";
import FilePondUpload from "@/components/forms/FilePondUpload";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextField } from "@/components/forms/FormTextField";
import { FIELDS } from "@/lib/baserow/constants";
import { formatDateTime } from "@/lib/formatters";
import { getLinkLabel } from "@/lib/baserow/utils";
import { useReportes } from "../ReportesContext";

const reporteSchema = yup.object({
  descripcion: yup.string().trim().required("La descripción es requerida"),
  agrupadorId: yup.number().optional(),
});

export type ReporteFormValues = {
  descripcion: string;
  agrupadorId?: number;
};

export default function ReportesView() {
  const {
    reportes,
    agrupadores,
    isLoading,
    dialogOpen,
    openDialog,
    closeDialog,
    createReporte,
    isCreating,
  } = useReportes();
  const [files, setFiles] = useState<File[]>([]);

  const { control, handleSubmit, reset } = useForm<ReporteFormValues>({
    resolver: yupResolver(reporteSchema) as Resolver<ReporteFormValues>,
    defaultValues: { descripcion: "", agrupadorId: undefined },
  });

  const handleClose = () => {
    reset();
    setFiles([]);
    closeDialog();
  };

  const onSubmit = handleSubmit(async (values) => {
    await createReporte({
      descripcion: values.descripcion,
      agrupadorId: values.agrupadorId,
      files,
    });
    reset();
    setFiles([]);
  });

  return (
    <Stack spacing={2}>
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
            id: FIELDS.REPORTES.AGRUPADORES,
            label: "Agrupador",
            render: (row) => getLinkLabel(row[FIELDS.REPORTES.AGRUPADORES]),
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
            />
            <FormSelect
              name="agrupadorId"
              control={control}
              label="Agrupador (opcional)"
              emptyOption="Sin agrupador"
              options={agrupadores.map((item) => ({
                value: item.id,
                label: item[FIELDS.AGRUPADORES.NOMBRE],
              }))}
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
