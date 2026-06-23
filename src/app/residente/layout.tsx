"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ReportIcon from "@mui/icons-material/Report";
import PersonIcon from "@mui/icons-material/Person";
import MobileShell from "@/components/layout/MobileShell";

const navItems = [
  { label: "Inicio", href: "/residente/dashboard", icon: <DashboardIcon /> },
  { label: "Reportes", href: "/residente/reportes", icon: <ReportIcon /> },
  { label: "Perfil", href: "/residente/perfil", icon: <PersonIcon /> },
];

export default function ResidenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileShell title="Portal Residente" navItems={navItems}>
      {children}
    </MobileShell>
  );
}
