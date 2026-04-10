import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";

export const programMenus: ItemMenuSidebarAdmin[] = [
    {
        group: "GERENCIAMENTO",
        items: [
            {
                title: "Programas",
                url: "/admin",
                icon: "backpack",
                isActive: true,
            },
        ],
    },
];
