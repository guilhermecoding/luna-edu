"use client";

import { SideBarContentMenus } from "@/components/sidebar-content";
import { NavUser } from "@/app/(admin)/admin/_components/nav-user-admin";
import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";

const user = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
};

export function AdminSidebarContent({ menus }: { menus: ItemMenuSidebarAdmin[] }) {
    return <SideBarContentMenus menus={menus} />;
}

export function AdminSidebarFooter() {
    return <NavUser user={user} />;
}
