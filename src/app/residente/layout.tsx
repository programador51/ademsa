"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ReportIcon from "@mui/icons-material/Report";
import PersonIcon from "@mui/icons-material/Person";
import DashboardLayout from "@/components/layout/DashboardLayout";

const navItems = [
  { label: "Dashboard", href: "/residente/dashboard", icon: <DashboardIcon /> },
  { label: "Reportes", href: "/residente/reportes", icon: <ReportIcon /> },
  { label: "Mi perfil", href: "/residente/perfil", icon: <PersonIcon /> },
];

export default function ResidenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout title="Portal Residente" navItems={navItems}>
      {children}
    </DashboardLayout>
  );
}
