"use client";

import {
  AppBar,
  Avatar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { APP_LOGO_URL, APP_NAME } from "@/lib/appBrand";
import { useApp } from "@/contexts/AppContext";
import { ThemeModeToggle } from "./ThemeModeToggle";
import UserProfileDialog from "./UserProfileDialog";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface MobileShellProps {
  title: string;
  navItems: NavItem[];
  children: ReactNode;
}

export default function MobileShell({
  title,
  navItems,
  children,
}: MobileShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);

  const homeItem = navItems[0];
  const isHomeActive = homeItem ? pathname.startsWith(homeItem.href) : false;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        mx: "auto",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar sx={{ gap: 1, minHeight: 56 }}>
          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            <Box
              component="img"
              src={APP_LOGO_URL}
              alt={APP_NAME}
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                {APP_NAME}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {title}
              </Typography>
            </Box>
          </Box>
          <ThemeModeToggle />
          <IconButton onClick={() => setProfileOpen(true)} sx={{ p: 0.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
              {user?.nombre?.charAt(0) ?? "U"}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <UserProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />

      <Box component="main" sx={{ flex: 1, px: 2, py: 2, pb: 10 }}>
        {children}
      </Box>

      {homeItem && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 480,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <BottomNavigation
            showLabels
            value={isHomeActive ? 0 : false}
            sx={{
              justifyContent: "center",
              "& .MuiBottomNavigationAction-root": {
                maxWidth: 160,
                minWidth: 120,
              },
            }}
          >
            <BottomNavigationAction
              label={homeItem.label}
              icon={homeItem.icon}
              onClick={() => router.push(homeItem.href)}
            />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
