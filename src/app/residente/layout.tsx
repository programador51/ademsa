"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import MobileShell from "@/components/layout/MobileShell";

const navItems = [
  { label: "Inicio", href: "/residente/dashboard", icon: <DashboardIcon /> },
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
