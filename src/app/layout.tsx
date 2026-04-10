import type { Metadata, Viewport } from "next";
import { Poppins, Silkscreen } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/provider/providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-silkscreen",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "LUNA - Sistema de Gestão Educacional e Acompanhamento de Alunos",
  description: "Gerencie, acompanhe e otimize o desempenho dos seus alunos com o Luna, a plataforma de gestão educacional definitiva.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const darkModeDev = process.env.NEXT_PUBLIC_DARK_MODE_DEV; // Testa o modo escuro em desenvolvimento

  return (
    <html
      lang="pt-BR"
      className={cn("h-full", "antialiased", poppins.variable, silkscreen.variable, darkModeDev === "true" ? "dark" : "")}
    >
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
