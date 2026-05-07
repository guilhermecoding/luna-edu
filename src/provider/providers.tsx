"use client";

import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

/**
 * Componente de Providers para fornecer contextos globais.
 * @param children - Os componentes filhos que terão acesso aos contextos fornecidos.
 */
export default function Providers({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
                <TooltipProvider>
                    {children}
                </TooltipProvider>
                <Toaster richColors position="top-right" />
            </SidebarProvider>
        </ThemeProvider>
    );
}
