"use client";

import { Button, Stack, Tab, Tabs, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MobileCardList from "@/components/common/MobileCardList";
import { FIELDS } from "@/lib/baserow/constants";
import { Agrupador, Proyecto, Tipo } from "@/lib/baserow/types";
import { getLinkLabel } from "@/lib/baserow/utils";
import ServicioFormDialog from "./ServicioFormDialog";
import ServiciosFiltersBar from "./ServiciosFiltersBar";
import { useServicios } from "../ServiciosContext";

export default function ServiciosView() {
  const {
    nivel,
    setNivel,
    filteredRows,
    isLoading,
    openCreate,
    openEdit,
    deleteServicio,
  } = useServicios();

  const listProps = {
    loading: isLoading,
    onDelete: (row: { id: number }) => deleteServicio(row.id),
  };

  const deleteLabelByNivel =
    nivel === 1
      ? (row: Tipo) => `el tipo "${row[FIELDS.TIPOS.NOMBRE]}"`
      : nivel === 2
        ? (row: Agrupador) => `el agrupador "${row[FIELDS.AGRUPADORES.NOMBRE]}"`
        : (row: Proyecto) => `el proyecto "${row[FIELDS.PROYECTOS.NOMBRE]}"`;

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Servicios
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={openCreate}>
          Nuevo
        </Button>
      </Stack>

      <Tabs
        value={nivel}
        onChange={(_, value) => setNivel(value)}
        variant="fullWidth"
      >
        <Tab value={1} label="Nivel 1" />
        <Tab value={2} label="Nivel 2" />
        <Tab value={3} label="Nivel 3" />
      </Tabs>

      <ServiciosFiltersBar />

      {nivel === 1 && (
        <MobileCardList<Tipo>
          title="Tipos"
          rows={filteredRows as Tipo[]}
          onEdit={openEdit}
          deleteLabel={deleteLabelByNivel as (row: Tipo) => string}
          {...listProps}
          columns={[
            {
              id: FIELDS.TIPOS.NOMBRE,
              label: "Nombre",
              primary: true,
              render: (row) => row[FIELDS.TIPOS.NOMBRE],
            },
          ]}
        />
      )}

      {nivel === 2 && (
        <MobileCardList<Agrupador>
          title="Agrupadores"
          rows={filteredRows as Agrupador[]}
          onEdit={openEdit}
          deleteLabel={deleteLabelByNivel as (row: Agrupador) => string}
          {...listProps}
          columns={[
            {
              id: FIELDS.AGRUPADORES.NOMBRE,
              label: "Nombre",
              primary: true,
              render: (row) => row[FIELDS.AGRUPADORES.NOMBRE],
            },
            {
              id: FIELDS.AGRUPADORES.TIPO,
              label: "Tipo",
              render: (row) => getLinkLabel(row[FIELDS.AGRUPADORES.TIPO]),
            },
          ]}
        />
      )}

      {nivel === 3 && (
        <MobileCardList<Proyecto>
          title="Proyectos"
          rows={filteredRows as Proyecto[]}
          onEdit={openEdit}
          deleteLabel={deleteLabelByNivel as (row: Proyecto) => string}
          {...listProps}
          columns={[
            {
              id: FIELDS.PROYECTOS.NOMBRE,
              label: "Nombre",
              primary: true,
              render: (row) => row[FIELDS.PROYECTOS.NOMBRE],
            },
            {
              id: FIELDS.PROYECTOS.DETALLES,
              label: "Detalles",
              render: (row) => row[FIELDS.PROYECTOS.DETALLES],
            },
            {
              id: FIELDS.PROYECTOS.AGRUPADOR,
              label: "Agrupador",
              render: (row) => getLinkLabel(row[FIELDS.PROYECTOS.AGRUPADOR]),
            },
          ]}
        />
      )}

      <ServicioFormDialog />
    </Stack>
  );
}
