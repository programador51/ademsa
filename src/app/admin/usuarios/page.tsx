"use client";

import { UsuariosProvider } from "@/modules/usuarios/UsuariosContext";
import UsuariosView from "@/modules/usuarios/components/UsuariosView";

export default function UsuariosPage() {
  return (
    <UsuariosProvider>
      <UsuariosView />
    </UsuariosProvider>
  );
}
