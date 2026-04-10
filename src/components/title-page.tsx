export interface TitlePageProps {
    title: string;
    description?: string;
}
/**
 * Título da página.
 * @returns Componente de título e descrição (opcional) da página.
 */
export default function TitlePage({ title, description }: TitlePageProps) {
    return (
        <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{title}</h1>
            {description && <p className="text-base sm:text-lg text-muted-foreground">{description}</p>}
        </div>
    );
}
