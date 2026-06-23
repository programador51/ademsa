"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import MobileShell from "@/components/layout/MobileShell";

const navItems = [
  { label: "Inicio", href: "/admin/dashboard", icon: <DashboardIcon /> },
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
