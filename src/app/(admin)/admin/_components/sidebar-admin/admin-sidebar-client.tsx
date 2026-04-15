"use client";

import { SideBarContentMenus } from "@/components/sidebar-content";
import { NavUser } from "@/app/(admin)/admin/_components/nav-user-admin";
import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";

import { usePathname } from "next/navigation";

const user = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/gibby-normal-icon.svg",
};

export function AdminSidebarContent({ menus }: { menus: ItemMenuSidebarAdmin[] }) {
    const pathname = usePathname();

    const filteredMenus = menus.map(group => {
        const groupItems = group.items.filter(item => {
            if (item.hiddenOnPaths?.some(p => new RegExp(p).test(pathname))) return false;
            if (item.visibleOnPaths && !item.visibleOnPaths.some(p => new RegExp(p).test(pathname))) return false;
            return true;
        }).map(item => {
            if (!item.items) return item;
            
            const subItems = item.items.filter(subItem => {
                if (subItem.hiddenOnPaths?.some(p => new RegExp(p).test(pathname))) return false;
                if (subItem.visibleOnPaths && !subItem.visibleOnPaths.some(p => new RegExp(p).test(pathname))) return false;
                return true;
            });
            
            return { ...item, items: subItems };
        });
        
        return { ...group, items: groupItems };
    }).filter(group => {
        if (group.hiddenOnPaths?.some(p => new RegExp(p).test(pathname))) return false;
        if (group.visibleOnPaths && !group.visibleOnPaths.some(p => new RegExp(p).test(pathname))) return false;
        return group.items.length > 0;
    });

    return <SideBarContentMenus menus={filteredMenus} />;
}

export function AdminSidebarFooter() {
    return <NavUser user={user} />;
}
