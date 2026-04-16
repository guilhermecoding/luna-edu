import { getDegreesByProgramId } from "@/services/degrees/degrees.service";
import { IconBook, IconEdit, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";

export default async function ListDegrees({ programId, programSlug }: { programId: string, programSlug: string }) {
    const degrees = await getDegreesByProgramId(programId);

    if (degrees.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-background shadow-sm">
                <IconBook className="size-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">Nenhuma matriz curricular</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                    Você ainda não adicionou nenhuma matriz curricular para este programa. Comece criando a primeira.
                </p>
                <ButtonLink href={`/admin/${programSlug}/matrizes/novo`}>
                    Criar Primeira Matriz
                </ButtonLink>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {degrees.map((degree) => (
                <div key={degree.id} className="border rounded-xl p-6 bg-background shadow-sm flex flex-col items-start hover:border-primary/50 transition-colors">
                    <div className="flex bg-primary/10 p-3 rounded-lg mb-4 text-primary">
                        <IconBook className="size-6" />
                    </div>
                    <div className="flex-1 w-full">
                        <h4 className="text-lg font-semibold line-clamp-1" title={degree.name}>{degree.name}</h4>
                        <div className="flex gap-2 text-xs text-muted-foreground mt-1 mb-3">
                            <span className="bg-secondary px-2 py-0.5 rounded-full">{degree.slug}</span>
                            {degree.totalHours && <span className="bg-secondary px-2 py-0.5 rounded-full">{degree.totalHours}h</span>}
                        </div>
                        {degree.description && (
                            <p className="text-sm text-balance text-muted-foreground line-clamp-2 mt-2">
                                {degree.description}
                            </p>
                        )}
                    </div>
                    
                    <div className="w-full flex items-center justify-between mt-6 pt-4 border-t">
                        <Link 
                            href={`/admin/${programSlug}/matrizes/${degree.slug}/editar`}
                            className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
                        >
                            <IconEdit className="size-4" />
                            Editar
                        </Link>
                        
                        <Link 
                            href={`/admin/${programSlug}/matrizes/${degree.slug}`}
                            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                            Ver Disciplinas
                            <IconChevronRight className="size-4" />
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
