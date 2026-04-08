"use client";

import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { IconChevronRightFilled, IconHome, IconUsers, IconBook, IconCalendar, IconSettings, IconChartArcs, IconFileText } from "@tabler/icons-react";

const iconMap: { [key: string]: React.ReactNode } = {
    IconHome: <IconHome size={20} />,
    IconUsers: <IconUsers size={20} />,
    IconBook: <IconBook size={20} />,
    IconCalendar: <IconCalendar size={20} />,
    IconSettings: <IconSettings size={20} />,
    IconChartArcs: <IconChartArcs size={20} />,
    IconFileText: <IconFileText size={20} />,
};

/**
 * Renderiza o conteúdo do sidebar com base nos menus fornecidos.
 * @param menus - Array de objetos representando os grupos de menu e seus itens.
 */
export function SideBarContentMenus({
    menus,
}: {
    menus: ItemMenuSidebarAdmin[]
}) {
    return (
        <>
            {menus.map((menu) => (
                <SidebarGroup key={menu.group}>
                    <SidebarGroupLabel>{menu.group}</SidebarGroupLabel>
                    <SidebarMenu>
                        {menu.items.map((item) => (
                            <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a href={item.url}>
                                            <div className="w-5 h-5 flex items-center justify-center">
                                                {iconMap[item.icon as string]}
                                            </div>
                                            <span>{item.title}</span>
                                        </a>
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
                                                                <a href={subItem.url}>
                                                                    <span>{subItem.title}</span>
                                                                </a>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </>
                                    ) : null}
                                </SidebarMenuItem>
                            </Collapsible>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}