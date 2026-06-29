"use client";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { resolveProyectoHierarchy } from "@/lib/baserow/proyectoHierarchyUtils";
import { FIELDS } from "@/lib/baserow/constants";
import {
  Agrupador,
  MantenimientoPreventivo,
  Proyecto,
  Tipo,
} from "@/lib/baserow/types";
import { formatDateTime, formatFolio } from "@/lib/formatters";
import {
  getPreventivoAnteriorId,
  getPreventivoSiguienteId,
} from "../MantenimientosContext";

interface PreventivoSeguimientoDialogProps {
  open: boolean;
  rowId: number | null;
  onClose: () => void;
  preventivosById: Map<number, MantenimientoPreventivo>;
  tipos: Tipo[];
  agrupadores: Agrupador[];
  proyectos: Proyecto[];
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

export default function PreventivoSeguimientoDialog({
  open,
  rowId,
  onClose,
  preventivosById,
  tipos,
  agrupadores,
  proyectos,
}: PreventivoSeguimientoDialogProps) {
  const [viewingId, setViewingId] = useState<number | null>(null);

  useEffect(() => {
    if (open) setViewingId(rowId);
    else setViewingId(null);
  }, [open, rowId]);

  const row = viewingId != null ? preventivosById.get(viewingId) : undefined;
  const anteriorId = row ? getPreventivoAnteriorId(row) : null;
  const anteriorRow =
    anteriorId != null ? preventivosById.get(anteriorId) : undefined;
  const siguienteId =
    viewingId != null
      ? getPreventivoSiguienteId(viewingId, preventivosById)
      : null;
  const siguienteRow =
    siguienteId != null ? preventivosById.get(siguienteId) : undefined;

  const hierarchy = row
    ? resolveProyectoHierarchy(
        row[FIELDS.MANT_PREVENTIVOS.PROYECTO],
        agrupadores,
        proyectos,
        tipos
      )
    : null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Consultar seguimiento</DialogTitle>
      <DialogContent>
        {!row ? (
          <Alert severity="warning" sx={{ mt: 1 }}>
            No se encontró el registro seleccionado.
          </Alert>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DetailField
              label="Folio"
              value={formatFolio(row[FIELDS.MANT_PREVENTIVOS.FOLIO])}
            />
            <DetailField
              label="Estado"
              value={row[FIELDS.MANT_PREVENTIVOS.ESTADO] ?? "—"}
            />
            <DetailField
              label="Nivel 1 · Tipo"
              value={hierarchy?.tipoNombre ?? "—"}
            />
            <DetailField
              label="Nivel 2 · Agrupador"
              value={hierarchy?.agrupadorNombre ?? "—"}
            />
            <DetailField
              label="Nivel 3 · Proyecto"
              value={hierarchy?.proyectoNombre ?? "—"}
            />
            <DetailField
              label="Último"
              value={formatDateTime(row[FIELDS.MANT_PREVENTIVOS.ULTIMO])}
            />
            <DetailField
              label="Siguiente"
              value={formatDateTime(row[FIELDS.MANT_PREVENTIVOS.SIGUIENTE])}
            />
            <DetailField
              label="Aplicado el"
              value={formatDateTime(row[FIELDS.MANT_PREVENTIVOS.APLICADO_EL])}
            />
            {anteriorId != null && !anteriorRow && (
              <Alert severity="warning">
                El mantenimiento anterior vinculado no está disponible.
              </Alert>
            )}
            {siguienteId != null && !siguienteRow && (
              <Alert severity="warning">
                El mantenimiento siguiente vinculado no está disponible.
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap", gap: 1, px: 3, pb: 2 }}>
        <Button
          disabled={!anteriorRow}
          onClick={() => anteriorRow && setViewingId(anteriorRow.id)}
        >
          Anterior
        </Button>
        <Button
          disabled={!siguienteRow}
          onClick={() => siguienteRow && setViewingId(siguienteRow.id)}
        >
          Siguiente
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
