import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProgramsForTeacher } from "@/services/programs/programs.service";
import { IconBook } from "@tabler/icons-react";

const ACTIVE_PROGRAM_COOKIE_NAME = "active_program_slug";

async function ProfRedirect() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/entrar");
    }

    const programs = await getProgramsForTeacher(session.user.id);

    if (programs.length === 0) {
        return (
            <div className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-10 mx-auto max-w-7xl">
                <div className="p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-surface-border rounded-2xl bg-surface/30 gap-3 max-w-lg">
                    <IconBook className="size-10 text-muted-foreground/40" />
                    <p className="text-muted-foreground font-medium">
                        Você não está alocado(a) em nenhum programa no momento.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Se acha que isso é um erro, contate a coordenação ou a administração.
                    </p>
                </div>
            </div>
        );
    }

    const cookieStore = await cookies();
    const activeSlug = cookieStore.get(ACTIVE_PROGRAM_COOKIE_NAME)?.value;

    const activeProgram = programs.find((p) => p.slug === activeSlug);

    redirect(`/prof/${activeProgram?.slug ?? programs[0].slug}/periodos`);
}

export default function ProfPage() {
    return (
        <Suspense fallback={null}>
            <ProfRedirect />
        </Suspense>
    );
}
