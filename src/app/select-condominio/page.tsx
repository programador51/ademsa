"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { fetchTable } from "@/lib/api/data";
import { Condominio } from "@/lib/baserow/types";
import { FIELDS, ROLES } from "@/lib/baserow/constants";

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
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleSelect = (condominio: Condominio) => {
    setCondominioId(condominio.id);
    if (user?.rol === ROLES.ADMINISTRADOR) {
      router.push("/admin/dashboard");
    } else {
      router.push("/residente/dashboard");
    }
  };

  if (loading || isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", py: 6, px: 2 }}>
      <Stack spacing={3} sx={{ maxWidth: 960, mx: "auto" }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Selecciona un condominio
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Hola {user?.nombre}, elige el condominio con el que deseas trabajar.
          </Typography>
        </Box>

        {error && <Alert severity="error">No se pudieron cargar los condominios</Alert>}

        {!user?.condominioIds.length && (
          <Alert severity="warning">
            Tu usuario no tiene condominios asignados. Contacta al administrador.
          </Alert>
        )}

        <Grid container spacing={2}>
          {data?.map((condominio) => (
            <Grid key={condominio.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
                <CardActionArea onClick={() => handleSelect(condominio)}>
                  <CardContent>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                      <ApartmentIcon color="primary" />
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          {condominio[FIELDS.CONDOMINIOS.NOMBRE] ?? `Condominio #${condominio.id}`}
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
            </Grid>
          ))}
        </Grid>

        {user?.condominioIds.length ? (
          <Box sx={{ textAlign: "center" }}>
            <Button variant="text" onClick={() => router.push("/login")}>
              Cambiar de cuenta
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}
