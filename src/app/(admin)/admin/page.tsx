import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { Suspense } from "react";

const ACTIVE_PROGRAM_COOKIE_NAME = "active_program_slug";

async function fetchPrograms() {
    return prisma.program.findMany({
        orderBy: { name: "asc" },
    });
}

async function AdminRedirect() {
    const programs = await fetchPrograms();

    if (programs.length === 0) {
        redirect("/admin/programas");
    }

    const cookieStore = await cookies();
    const activeSlug = cookieStore.get(ACTIVE_PROGRAM_COOKIE_NAME)?.value;

    const activeProgram = programs.find((p) => p.slug === activeSlug);

    redirect(`/admin/${activeProgram?.slug ?? programs[0].slug}/periodos`);

    return null;
}

export default function AdminPage() {
    return (
        <Suspense fallback={null}>
            <AdminRedirect />
        </Suspense>
    );
}