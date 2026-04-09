"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

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
        <SidebarProvider>
            <TooltipProvider>
                {children}
            </TooltipProvider>
        </SidebarProvider>
    );
}
