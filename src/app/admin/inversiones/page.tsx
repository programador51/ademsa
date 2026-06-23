"use client";

import { InversionesProvider } from "@/modules/inversiones/InversionesContext";
import InversionesView from "@/modules/inversiones/components/InversionesView";

export default function InversionesPage() {
  return (
    <InversionesProvider>
      <InversionesView />
    </InversionesProvider>
  );
}
