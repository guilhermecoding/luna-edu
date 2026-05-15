import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";

export const profMenus: ItemMenuSidebarAdmin[] = [
    {
        group: "ÁREA DO PROFESSOR",
        items: [
            {
                title: "Início",
                url: "/prof",
                icon: "home",
                isActive: true,
            },
            {
                title: "Minhas Turmas",
                url: "/prof/[program]/periodos/[period]/turmas",
                icon: "book",
                isActive: false,
            },
        ],
    },
];
