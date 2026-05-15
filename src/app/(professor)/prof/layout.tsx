import { Metadata } from "next";

import SidebarProfBase from "./_components/sidebar-prof/sidebar-prof-base";
import { profMenus } from "../_config/menus/prof-menus";
import { Suspense } from "react";
import SidebarAndPageSkeleton from "@/components/skeletons/sidebar-and-page-skeleton";

export const metadata: Metadata = {
    title: {
        template: "%s | LUNA EDU (Professor)",
        default: "Professor",
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function ProfLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Suspense fallback={<SidebarAndPageSkeleton />}>
            <SidebarProfBase menus={profMenus}>
                {children}
            </SidebarProfBase>
        </Suspense>
    );
}
