"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { fetchTable } from "@/lib/api/data";
import { FIELDS, ROLES } from "@/lib/baserow/constants";
import { Condominio } from "@/lib/baserow/types";

export default function SelectCondominioPage() {
  const router = useRouter();
  const { user, loading, setCondominioId } = useApp();

  const { data, isLoading, error } = useQuery({
    queryKey: ["condominios", user?.condominioIds],
    queryFn: async () => {
      const response = await fetchTable<Condominio>("condominios");
      return response.results.filter((c) =>
        user?.condominioIds.includes(c.id)
      );
    },
    enabled: !!user?.condominioIds.length,
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const handleSelect = (condominio: Condominio) => {
    setCondominioId(
      condominio.id,
      condominio[FIELDS.CONDOMINIOS.NOMBRE] ?? `Condominio #${condominio.id}`
    );
    router.push(
      user?.rol === ROLES.ADMINISTRADOR
        ? "/admin/dashboard"
        : "/residente/dashboard"
    );
  };

  if (loading || isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", maxWidth: 480, mx: "auto", px: 2, py: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 700, textAlign: "center" }}>
          Selecciona un condominio
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          Hola {user?.nombre}
        </Typography>

        {error && <Alert severity="error">No se pudieron cargar los condominios</Alert>}
        {!user?.condominioIds.length && (
          <Alert severity="warning">No tienes condominios asignados.</Alert>
        )}

        {data?.map((condominio) => (
          <Card key={condominio.id} variant="outlined">
            <CardActionArea onClick={() => handleSelect(condominio)}>
              <CardContent>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <ApartmentIcon color="primary" />
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {condominio[FIELDS.CONDOMINIOS.NOMBRE] ?? `#${condominio.id}`}
                    </Typography>
                    {condominio[FIELDS.CONDOMINIOS.DIRECCION] && (
                      <Typography variant="body2" color="text.secondary">
                        {condominio[FIELDS.CONDOMINIOS.DIRECCION]}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}

        <Button variant="text" onClick={() => router.push("/login")}>
          Cambiar de cuenta
        </Button>
      </Stack>
    </Box>
  );
}
