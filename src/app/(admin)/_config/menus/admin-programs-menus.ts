import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";

export const programMenus: ItemMenuSidebarAdmin[] = [
    {
        group: "GERENCIAMENTO",
        items: [
            {
                title: "Programas",
                url: "/admin/programas",
                icon: "backpack",
                items: [
                    {
                        title: "Criar Programa",
                        url: "/admin/programas/criar",
                    },
                ],
            },
        ],
    },
];
