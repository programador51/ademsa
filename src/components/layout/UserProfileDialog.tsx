"use client";

import {
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useApp } from "@/contexts/AppContext";

interface UserProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function UserProfileDialog({
  open,
  onClose,
}: UserProfileDialogProps) {
  const { user, condominioNombre } = useApp();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pb: 1 }}>Mi cuenta</DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <List disablePadding dense>
          <ListItem sx={{ px: 0, gap: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {user?.nombre?.charAt(0) ?? "U"}
            </Avatar>
            <ListItemText
              primary={user?.nombre ?? "—"}
              secondary={user?.email ?? "—"}
              slotProps={{ primary: { sx: { fontWeight: 600 } } }}
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Condominio
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1.5 }}>
          {condominioNombre ?? "Sin seleccionar"}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Rol
        </Typography>
        <Typography variant="body1">{user?.rolLabel ?? "—"}</Typography>
      </DialogContent>
    </Dialog>
  );
}
