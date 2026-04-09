// src/middleware.ts
import { getPrograms } from "@/services/programs.service";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    if (request.nextUrl.pathname === "/admin") {
        try {
            // Verifica se há programas cadastrados
            const programs = await getPrograms();
            if (programs.length > 0) {
                return NextResponse.redirect(
                    new URL(`/admin/${programs[0].slug}/periodos`, request.url),
                );
            }
        } catch {
            // fallback se fail
        }
        return NextResponse.redirect(new URL("/admin/programas", request.url));
    }
}

export const config = {
    matcher: "/admin",
};