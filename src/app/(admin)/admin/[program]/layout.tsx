import { getProgramBySlug } from "@/services/programs/programs.service";
import { adminMenus } from "../../_config/menus/admin-menus";
import SidebarAdminBase from "../_components/sidebar-admin/sidebar-admin-base";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import SidebarAndPageSkeleton from "@/components/skeletons/sidebar-and-page-skeleton";

async function ProgramLayoutContent({
    children,
    params,
}: Readonly<{
    children: React.ReactNode
    params: Promise<{ program: string }>
}>) {
    const { program: programSlug } = await params;

    const program = await getProgramBySlug(programSlug);

    if (!program) {
        return notFound();
    }

    return (
        <SidebarAdminBase menus={adminMenus}>
            {children}
        </SidebarAdminBase>
    );
}

export default function ProgramLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string }>
}>) {
    return (
        <Suspense fallback={<SidebarAndPageSkeleton />}>
            <ProgramLayoutContent params={params}>
                {children}
            </ProgramLayoutContent>
        </Suspense>
    );
}
