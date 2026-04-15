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
        group: "GERENCIAMENTO",
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
                url: "/admin/periodos",
                icon: "calendar",
                isActive: false,
                hiddenOnPaths: ["^/admin/programas"],
                items: [
                    { title: "Listar Períodos", url: "/admin/periodos" },
                    { title: "Criar Período", url: "/admin/periodos/novo" },
                ],
            },
            {
                title: "Cursos",
                url: "/admin/cursos",
                icon: "book",
                isActive: false,
                hiddenOnPaths: ["^/admin/programas"],
                items: [
                    { title: "Listar Cursos", url: "/admin/cursos" },
                    { title: "Novo Curso", url: "/admin/cursos/novo" },
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
        group: "RELATÓRIOS",
        items: [
            {
                title: "Estatísticas",
                url: "/admin/estatisticas",
                icon: "chart-arcs",
                isActive: false,
            },
            {
                title: "Relatórios",
                url: "/admin/relatorios",
                icon: "file-text",
                isActive: false,
            },
        ],
    },
    {
        group: "SISTEMA",
        items: [
            {
                title: "Configurações",
                url: "/admin/configuracoes",
                icon: "settings",
                isActive: false,
                items: [
                    { title: "Geral", url: "/admin/configuracoes" },
                    { title: "Segurança", url: "/admin/configuracoes/seguranca" },
                    { title: "Email", url: "/admin/configuracoes/email" },
                ],
            },
        ],
    },
];
