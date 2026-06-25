"use client";

import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { ReactNode } from "react";
import { confirmDelete } from "@/lib/ui/alerts";

export interface MobileListColumn<T> {
  id: string;
  label: string;
  render?: (row: T) => ReactNode;
  primary?: boolean;
}

interface MobileCardListProps<T extends { id: number }> {
  title: string;
  rows: T[];
  columns: MobileListColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  deleteLabel?: string | ((row: T) => string);
  headerAction?: ReactNode;
  renderRowActions?: (row: T) => ReactNode;
}

export default function MobileCardList<T extends { id: number }>({
  title,
  rows,
  columns,
  loading,
  emptyMessage = "Sin registros",
  onEdit,
  onDelete,
  deleteLabel,
  headerAction,
  renderRowActions,
}: MobileCardListProps<T>) {
  const primaryCol = columns.find((c) => c.primary) ?? columns[0];

  const handleDelete = async (row: T) => {
    if (!onDelete) return;
    const label =
      typeof deleteLabel === "function"
        ? deleteLabel(row)
        : deleteLabel ?? "este registro";
    const confirmed = await confirmDelete(label);
    if (confirmed) onDelete(row);
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {headerAction}
      </Box>

      {loading ? (
        <Typography color="text.secondary">Cargando...</Typography>
      ) : rows.length === 0 ? (
        <Typography color="text.secondary">{emptyMessage}</Typography>
      ) : (
        rows.map((row) => (
          <Card key={row.id} variant="outlined">
            <CardContent sx={{ "&:last-child": { pb: 2 } }}>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {primaryCol.render
                      ? primaryCol.render(row)
                      : String((row as Record<string, unknown>)[primaryCol.id] ?? "—")}
                  </Typography>
                  <Box>
                    {onEdit && (
                      <IconButton size="small" onClick={() => onEdit(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton size="small" color="error" onClick={() => void handleDelete(row)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                {columns
                  .filter((c) => c.id !== primaryCol.id)
                  .map((col) => (
                    <Box key={col.id}>
                      <Typography variant="caption" color="text.secondary">
                        {col.label}
                      </Typography>
                      <Typography variant="body2">
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.id] ?? "—")}
                      </Typography>
                    </Box>
                  ))}
                {renderRowActions?.(row)}
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );
}
