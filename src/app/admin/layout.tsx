"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CategoryIcon from "@mui/icons-material/Category";
import BuildIcon from "@mui/icons-material/Build";
import SavingsIcon from "@mui/icons-material/Savings";
import PeopleIcon from "@mui/icons-material/People";
import DashboardLayout from "@/components/layout/DashboardLayout";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <DashboardIcon /> },
  { label: "Condominios", href: "/admin/condominios", icon: <ApartmentIcon /> },
  { label: "Servicios", href: "/admin/servicios", icon: <CategoryIcon /> },
  { label: "Mant. preventivos", href: "/admin/mantenimientos/preventivos", icon: <BuildIcon /> },
  { label: "Mant. correctivos", href: "/admin/mantenimientos/correctivos", icon: <BuildIcon /> },
  { label: "Inversiones", href: "/admin/inversiones", icon: <SavingsIcon /> },
  { label: "Usuarios", href: "/admin/usuarios", icon: <PeopleIcon /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout title="Panel Administrador" navItems={navItems}>
      {children}
    </DashboardLayout>
  );
}
