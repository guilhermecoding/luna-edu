import { cn } from "@/lib/utils";

/**
 * Variantes visuais disponíveis para o indicador.
 */
type Variant = "success" | "error" | "warning";

/**
 * Propriedades do componente de status com animação de pulso.
 */
interface PulsingStatusIndicatorProps {
    /**
     * Define a cor/estado do indicador.
     * @default "success"
     */
    variant?: Variant;
    /**
     * Classes CSS extras para o container.
     */
    className?: string;
    /**
     * Tamanho do ponto em unidades utilitárias do Tailwind (ex.: 3 => w-3 h-3).
     * @default 3
     */
    size?: number;
    /**
     * Texto exibido ao lado do indicador.
     */
    text: string;
}

/**
 * Exibe um indicador de status com ponto pulsante e texto.
 */
export default function PulsingStatusIndicator({
    variant = "success",
    className,
    size = 3,
    text,
}: PulsingStatusIndicatorProps) {
    return (
        <div className={cn("flex flex-row items-center font-bold gap-2 text-base", className)}>
            <div className="relative flex items-center justify-center">
                <span className={cn("absolute inline-flex rounded-full opacity-75 animate-ping", {
                    "bg-green-400": variant === "success",
                    "bg-red-400": variant === "error",
                    "bg-yellow-400": variant === "warning",
                }, `w-${size} h-${size}`,
                )}></span>
                <span className={cn("relative inline-flex rounded-full", {
                    "bg-green-500": variant === "success",
                    "bg-red-500": variant === "error",
                    "bg-yellow-500": variant === "warning",
                }, `w-${size} h-${size}`,
                )}></span>
            </div>
            <span className={cn({
                "text-green-500": variant === "success",
                "text-red-500": variant === "error",
                "text-yellow-500": variant === "warning",
            })}>
                {text}
            </span>
        </div>
    );
}
