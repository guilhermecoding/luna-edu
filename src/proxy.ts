import { NextResponse, type NextRequest } from "next/server";

type Session = {
    user: {
        isAdmin: boolean;
        isTeacher: boolean;
        systemRole: string;
    };
};

export async function proxy(request: NextRequest) {
    const sessionUrl = new URL("/api/auth/get-session", request.url);
    sessionUrl.searchParams.set("disableCookieCache", "true");

    const sessionResponse = await fetch(sessionUrl, {
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

    // Área /admin: exclusiva de quem tem vínculo administrativo.
    if (isAdminRoute && !user.isAdmin) {
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
