import { NextResponse, type NextRequest } from "next/server";

type Session = {
    user: {
        isAdmin: boolean;
        isTeacher: boolean;
        systemRole: string;
    };
};

export async function proxy(request: NextRequest) {
    const sessionResponse = await fetch(new URL("/api/auth/get-session", request.url), {
        headers: {
            cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
    });

    const session: Session | null = sessionResponse.ok ? await sessionResponse.json() : null;

    if (!session) {
        return NextResponse.redirect(new URL("/entrar", request.url));
    }

    const { user } = session;
    const path = request.nextUrl.pathname;

    const isAdminRoute = path.startsWith("/admin");
    const isTeacherRoute = path.startsWith("/prof");

    // Proteção para rotas de admin
    if (isAdminRoute && !user.isAdmin && user.systemRole !== "FULL_ACCESS") {
        return NextResponse.redirect(new URL("/entrar", request.url));
    }

    // Área /prof: exclusiva de quem tem vínculo de professor (isTeacher). Admin ou FULL_ACCESS sem docência não entra.
    if (isTeacherRoute && !user.isTeacher) {
        return NextResponse.redirect(new URL("/entrar", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/prof/:path*"],
};
