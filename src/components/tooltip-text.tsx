"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Componente de texto com tooltip. Envolve o conteúdo em um Tooltip e exibe o texto do tooltip quando o usuário interage com o conteúdo.
 *
 * @param children O conteúdo que acionará o tooltip.
 * @param text O texto a ser exibido no tooltip.
 */
export default function TooltipText({
    children,
    text,
}: {
    children: React.ReactNode;
    text: string;
}) {
    return (
        <Tooltip>
            <TooltipTrigger onClick={(e) => e.preventDefault()}>{children}</TooltipTrigger>
            <TooltipContent>
                <p>{text}</p>
            </TooltipContent>
        </Tooltip>
    );
}
