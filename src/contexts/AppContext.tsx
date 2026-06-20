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
import { SessionUser } from "@/lib/baserow/types";

interface AppContextValue {
  user: SessionUser | null;
  condominioId: number | null;
  setCondominioId: (id: number | null) => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [condominioId, setCondominioIdState] = useState<number | null>(null);
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
    const stored = localStorage.getItem("condominio_seleccionado");
    if (stored) {
      setCondominioIdState(Number(stored));
    }
  }, []);

  const setCondominioId = useCallback((id: number | null) => {
    setCondominioIdState(id);
    if (id) {
      localStorage.setItem("condominio_seleccionado", String(id));
    } else {
      localStorage.removeItem("condominio_seleccionado");
    }
  }, []);

  const value = useMemo(
    () => ({ user, condominioId, setCondominioId, refreshUser, loading }),
    [user, condominioId, setCondominioId, refreshUser, loading]
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
