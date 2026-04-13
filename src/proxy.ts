import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACTIVE_PROGRAM_COOKIE_NAME = "active_program_slug";

export async function proxy(request: NextRequest) {
    if (request.nextUrl.pathname === "/admin") {
        try {
            const programs = await prisma.program.findMany({
                orderBy: { name: "asc" },
            });

            if (programs.length > 0) {
                const activeProgramSlug = request.cookies.get(ACTIVE_PROGRAM_COOKIE_NAME)?.value;
                const activeProgram = activeProgramSlug
                    ? programs.find((p) => p.slug === activeProgramSlug)
                    : undefined;

                return NextResponse.redirect(
                    new URL(`/admin/${activeProgram?.slug ?? programs[0].slug}/periodos`, request.url),
                );
            }
        } catch { }

        return NextResponse.redirect(new URL("/admin/programas", request.url));
    }
}

export const config = {
    matcher: "/admin",
};