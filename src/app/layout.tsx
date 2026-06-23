import type { Metadata } from "next";
import ThemeRegistry from "@/providers/ThemeRegistry";
import QueryProvider from "@/providers/QueryProvider";
import DateLocalizationProvider from "@/providers/DateLocalizationProvider";
import { AppProvider } from "@/contexts/AppContext";
import { APP_LOGO_URL } from "@/lib/appBrand";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ademsa.programmer51.com"),
  icons: {
    icon: APP_LOGO_URL,
    apple: APP_LOGO_URL,
  },

  title: {
    default: "Portal de Residentes | Ademsa Monterrey",
    template: "%s | Ademsa Monterrey",
  },

  description:
    "Portal de Residentes de Ademsa Monterrey para la gestión de reportes de incidencia y proyectos de condominios.",

  applicationName: "Portal de Residentes",

  keywords: [
    "Ademsa",
    "Ademsa Monterrey",
    "condominios",
    "administración de condominios",
    "portal de residentes",
    "reportes de incidencia",
    "proyectos",
    "Monterrey",
  ],

  authors: [{ name: "Programmer51" }],

  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://ademsa.programmer51.com",
    siteName: "Portal de Residentes | Ademsa Monterrey",
    title: "Portal de Residentes | Ademsa Monterrey",
    description:
      "Gestiona reportes de incidencia y proyectos de tu condominio desde un solo lugar.",
    images: [
      {
        url: "https://i.ibb.co/n8frjKbR/Chat-GPT-Image-20-jun-2026-09-09-11-a-m.png",
        width: 1200,
        height: 630,
        alt: "Portal de Residentes - Ademsa Monterrey",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Portal de Residentes | Ademsa Monterrey",
    description:
      "Gestiona reportes de incidencia y proyectos de tu condominio.",
    images: [
      "https://i.ibb.co/n8frjKbR/Chat-GPT-Image-20-jun-2026-09-09-11-a-m.png",
    ],
  },

  robots: {
    index: false,
    follow: false,
  },
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
          <DateLocalizationProvider>
            <QueryProvider>
              <AppProvider>{children}</AppProvider>
            </QueryProvider>
          </DateLocalizationProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
