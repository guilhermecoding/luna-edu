import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";

export const profMenus: ItemMenuSidebarAdmin[] = [
    {
        group: "ÁREA DO PROFESSOR",
        items: [
            {
                title: "Períodos",
                url: "/prof/[program]/periodos",
                icon: "calendar",
                isActive: false,
                hiddenOnPaths: ["^/prof$"],
            },
            {
                title: "Turmas",
                url: "/prof/[program]/periodos/[period]/turmas",
                icon: "book",
                isActive: false,
            },
        ],
    },
];
