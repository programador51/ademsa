import type { Metadata } from "next";
import ThemeRegistry from "@/providers/ThemeRegistry";
import QueryProvider from "@/providers/QueryProvider";
import { AppProvider } from "@/contexts/AppContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Condominio Intranet",
  description: "Sistema de gestión de condominios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <ThemeRegistry>
          <QueryProvider>
            <AppProvider>{children}</AppProvider>
          </QueryProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
