"use client";

import { CondominiosProvider } from "@/modules/condominios/CondominiosContext";
import CondominiosView from "@/modules/condominios/components/CondominiosView";

export default function CondominiosPage() {
  return (
    <CondominiosProvider>
      <CondominiosView />
    </CondominiosProvider>
  );
}
