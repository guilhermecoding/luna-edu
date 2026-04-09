"use client";

import * as React from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    sideBarHeader?: React.ReactNode;
    sideBarContent?: React.ReactNode;
    sideBarFooter?: React.ReactNode;
}

export function AppSidebar({ sideBarHeader, sideBarContent, sideBarFooter, ...props }: AppSidebarProps) {
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <Link href="/" className="flex justify-center items-center gap-2">
                    <Image
                        src="/gibby-normal-icon.svg"
                        alt="Logo"
                        width={32}
                        height={32}
                        className="pointer-events-none w-10 h-10"
                    />
                    <span className="font-silkscreen text-primary-theme text-4xl">
                        LUNA
                    </span>
                </Link>
                {sideBarHeader}
            </SidebarHeader>
            <SidebarContent>
                {sideBarContent}
            </SidebarContent>
            <SidebarFooter>
                {sideBarFooter}
            </SidebarFooter>
        </Sidebar>
    );
}
