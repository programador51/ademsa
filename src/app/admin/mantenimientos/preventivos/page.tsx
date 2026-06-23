"use client";

import { MantenimientosProvider } from "@/modules/mantenimientos/MantenimientosContext";
import MantenimientosView from "@/modules/mantenimientos/components/MantenimientosView";

export default function MantPreventivosPage() {
  return (
    <MantenimientosProvider tipo="preventivo">
      <MantenimientosView />
    </MantenimientosProvider>
  );
}
