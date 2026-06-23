"use client";

import { MantenimientosProvider } from "@/modules/mantenimientos/MantenimientosContext";
import MantenimientosView from "@/modules/mantenimientos/components/MantenimientosView";

export default function MantCorrectivosPage() {
  return (
    <MantenimientosProvider tipo="correctivo">
      <MantenimientosView />
    </MantenimientosProvider>
  );
}
