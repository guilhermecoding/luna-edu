"use client";

import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SheetClose } from "@/components/ui/sheet";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { IconChevronRightFilled, IconHome, IconUsers, IconBook, IconCalendar, IconSettings, IconChartArcs, IconFileText, IconBackpack } from "@tabler/icons-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";

const iconMap: Record<string, React.ReactNode> = {
    home: <IconHome size={20} />,
    users: <IconUsers size={20} />,
    book: <IconBook size={20} />,
    calendar: <IconCalendar size={20} />,
    settings: <IconSettings size={20} />,
    "chart-arcs": <IconChartArcs size={20} />,
    "file-text": <IconFileText size={20} />,
    "backpack": <IconBackpack size={20} />,
};

function getIcon(iconName: string): React.ReactNode {
    return iconMap[iconName] || null;
}

/**
 * Renderiza o conteúdo do sidebar com base nos menus fornecidos.
 * @param menus - Array de objetos representando os grupos de menu e seus itens.
 */
export function SideBarContentMenus({
    menus,
}: {
    menus: ItemMenuSidebarAdmin[]
}) {
    const { isMobile } = useSidebar();

    return (
        <>
            {menus.map((menu) => (
                <SidebarGroup key={menu.group}>
                    <SidebarGroupLabel>{menu.group}</SidebarGroupLabel>
                    <SidebarMenu>
                        {menu.items.map((item) => {

                            return (
                                <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild tooltip={item.title}>
                                            {isMobile ? (
                                                <SheetClose asChild>
                                                    <Link href={item.url}>
                                                        {getIcon(item.icon)}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                </SheetClose>
                                            ) : (
                                                <Link href={item.url}>
                                                    {getIcon(item.icon)}
                                                    <span>{item.title}</span>
                                                </Link>
                                            )}
                                        </SidebarMenuButton>
                                        {item.items?.length ? (
                                            <>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                                                        <IconChevronRightFilled />
                                                        <span className="sr-only">Toggle</span>
                                                    </SidebarMenuAction>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items?.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild>
                                                                    {isMobile ? (
                                                                        <SheetClose asChild>
                                                                            <Link href={subItem.url}>
                                                                                <span>{subItem.title}</span>
                                                                            </Link>
                                                                        </SheetClose>
                                                                    ) : (
                                                                        <Link href={subItem.url}>
                                                                            <span>{subItem.title}</span>
                                                                        </Link>
                                                                    )}
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </>
                                        ) : null}
                                    </SidebarMenuItem>
                                </Collapsible>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}