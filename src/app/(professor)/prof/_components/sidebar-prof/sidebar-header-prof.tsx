import { SidebarHeaderProfContent } from "./sidebar-header-prof-content";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getProgramsForTeacher } from "@/services/programs/programs.service";

export async function SidebarHeaderProf() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    const programs = await getProgramsForTeacher(session.user.id);
    return <SidebarHeaderProfContent programs={programs} />;
}
