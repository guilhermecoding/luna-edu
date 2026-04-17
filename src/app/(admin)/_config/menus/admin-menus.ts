import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";

export const adminMenus: ItemMenuSidebarAdmin[] = [
    {
        group: "GERAL",
        items: [
            {
                title: "Dashboard",
                url: "/admin",
                icon: "home",
                isActive: true,
            },
        ],
    },
    {
        group: "ACADÊMICO",
        items: [
            {
                title: "Usuários",
                url: "/admin/usuarios",
                icon: "users",
                isActive: true,
                items: [
                    { title: "Listar Usuários", url: "/admin/usuarios" },
                    { title: "Adicionar Usuário", url: "/admin/usuarios/novo" },
                    { title: "Permissões", url: "/admin/usuarios/permissoes" },
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
                title: "Cursos",
                url: "/admin/[program]/periodos/[period]/cursos",
                icon: "book",
                isActive: false,
                items: [
                    { title: "Listar Cursos", url: "/admin/[program]/periodos/[period]/cursos" },
                    { title: "Novo Curso", url: "/admin/[program]/periodos/[period]/cursos/novo" },
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
