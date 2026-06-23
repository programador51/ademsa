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
import LogoutIcon from "@mui/icons-material/Logout";
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

  const activeIndex = navItems.findIndex((item) => pathname.startsWith(item.href));

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/login");
  };

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
          value={activeIndex >= 0 ? activeIndex : false}
          onChange={(_, index) => {
            if (index === navItems.length) {
              handleLogout();
              return;
            }
            router.push(navItems[index].href);
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.href}
              label={item.label}
              icon={item.icon}
            />
          ))}
          <BottomNavigationAction label="Salir" icon={<LogoutIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
