import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";

export const adminMenus: ItemMenuSidebarAdmin[] = [
    {
        group: "GERAL",
        items: [
            {
                title: "Dashboard",
                url: "/admin",
                icon: "home",
                isActive: false,
            },
        ],
    },
    {
        group: "ACADÊMICO",
        items: [

            {
                title: "Matrizes Curriculares",
                url: "/admin/[program]/matrizes",
                icon: "blocks",
                isActive: false,
                hiddenOnPaths: ["^/admin/programas"],
                items: [
                    { title: "Nova Matriz", url: "/admin/[program]/matrizes/novo" },
                ],
            },
            {
                title: "Períodos",
                url: "/admin/[program]/periodos",
                icon: "calendar",
                isActive: false,
                hiddenOnPaths: ["^/admin/programas"],
                items: [
                    { title: "Novo Período", url: "/admin/[program]/periodos/novo" },
                ],
            },
            {
                title: "Grade de Horários",
                url: "/admin/[program]/horarios",
                icon: "clock",
                isActive: false,
                hiddenOnPaths: ["^/admin/programas"],
                items: [
                    { title: "Novo Horário", url: "/admin/[program]/horarios/novo" },
                ],
            },
            {
                title: "Programas",
                url: "/admin/programas",
                icon: "backpack",
                isActive: false,
                items: [
                    { title: "Criar Programa", url: "/admin/programas/novo" },
                ],
            },
            {
                title: "Turmas",
                url: "/admin/[program]/periodos/[period]/turmas",
                icon: "book",
                isActive: false,
                items: [
                    { title: "Nova Turma", url: "/admin/[program]/periodos/[period]/turmas/novo" },
                ],
            },
            {
                title: "Usuários",
                url: "/admin/usuarios",
                icon: "users",
                isActive: false,
                items: [
                    { title: "Listar Usuários", url: "/admin/usuarios" },
                    { title: "Adicionar Usuário", url: "/admin/usuarios/novo" },
                    { title: "Permissões", url: "/admin/usuarios/permissoes" },
                ],
            },
        ],
    },
    {
        group: "GERENCIAMENTO",
        items: [
            {
                title: "Instituições",
                url: "/admin/instituicoes",
                icon: "building-estate",
                isActive: false,
                items: [
                    { title: "Adicionar Instituição", url: "/admin/instituicoes/novo" },
                ],
            },
        ],
    },
];
