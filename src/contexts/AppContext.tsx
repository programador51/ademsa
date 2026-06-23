"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchRow } from "@/lib/api/data";
import { FIELDS } from "@/lib/baserow/constants";
import { Condominio, SessionUser } from "@/lib/baserow/types";

interface AppContextValue {
  user: SessionUser | null;
  condominioId: number | null;
  condominioNombre: string | null;
  setCondominioId: (id: number | null, nombre?: string | null) => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const STORAGE_ID = "condominio_seleccionado";
const STORAGE_NOMBRE = "condominio_seleccionado_nombre";

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [condominioId, setCondominioIdState] = useState<number | null>(null);
  const [condominioNombre, setCondominioNombreState] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const response = await fetch("/api/auth/me");
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_ID);
    const storedNombre = localStorage.getItem(STORAGE_NOMBRE);
    if (storedId) {
      setCondominioIdState(Number(storedId));
    }
    if (storedNombre) {
      setCondominioNombreState(storedNombre);
    }
  }, []);

  useEffect(() => {
    if (!condominioId || condominioNombre) return;

    fetchRow<Condominio>("condominios", condominioId)
      .then((row) => {
        const nombre =
          row[FIELDS.CONDOMINIOS.NOMBRE] ?? `Condominio #${condominioId}`;
        setCondominioNombreState(nombre);
        localStorage.setItem(STORAGE_NOMBRE, nombre);
      })
      .catch(() => {
        setCondominioNombreState(`Condominio #${condominioId}`);
      });
  }, [condominioId, condominioNombre]);

  const setCondominioId = useCallback(
    (id: number | null, nombre?: string | null) => {
      setCondominioIdState(id);
      if (id) {
        localStorage.setItem(STORAGE_ID, String(id));
        if (nombre) {
          setCondominioNombreState(nombre);
          localStorage.setItem(STORAGE_NOMBRE, nombre);
        }
      } else {
        localStorage.removeItem(STORAGE_ID);
        localStorage.removeItem(STORAGE_NOMBRE);
        setCondominioNombreState(null);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      condominioId,
      condominioNombre,
      setCondominioId,
      refreshUser,
      loading,
    }),
    [user, condominioId, condominioNombre, setCondominioId, refreshUser, loading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe usarse dentro de AppProvider");
  }
  return context;
}
