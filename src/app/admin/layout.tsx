"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CategoryIcon from "@mui/icons-material/Category";
import BuildIcon from "@mui/icons-material/Build";
import SavingsIcon from "@mui/icons-material/Savings";
import PeopleIcon from "@mui/icons-material/People";
import MobileShell from "@/components/layout/MobileShell";

const navItems = [
  { label: "Inicio", href: "/admin/dashboard", icon: <DashboardIcon /> },
  { label: "Condos", href: "/admin/condominios", icon: <ApartmentIcon /> },
  { label: "Servicios", href: "/admin/servicios", icon: <CategoryIcon /> },
  { label: "Mant.", href: "/admin/mantenimientos/preventivos", icon: <BuildIcon /> },
  { label: "Más", href: "/admin/inversiones", icon: <SavingsIcon /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileShell title="Administración" navItems={navItems}>
      {children}
    </MobileShell>
  );
}
