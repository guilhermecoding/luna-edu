import { cn } from "@/lib/utils";

/**
 * Componente de página.
 * @param children - Os filhos do componente.
 */
export default function Page({
    children,
    className,
    ...props
}: React.ComponentPropsWithoutRef<"main">) {
    return (
        <main className={cn("pt-4 pb-12 @container/main", className)} {...props}>
            {children}
        </main>
    );
}
