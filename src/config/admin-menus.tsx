import { IconHome, IconUsers, IconBook, IconCalendar, IconSettings, IconChartArcs, IconFileText } from "@tabler/icons-react";
import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";

export const adminMenus: ItemMenuSidebarAdmin[] = [
    {
        group: "GERAL",
        items: [
            {
                title: "Dashboard",
                url: "/admin",
                icon: <IconHome size={20} />,
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
                icon: <IconUsers size={20} />,
                isActive: false,
                items: [
                    { title: "Listar Usuários", url: "/admin/usuarios" },
                    { title: "Adicionar Usuário", url: "/admin/usuarios/novo" },
                    { title: "Permissões", url: "/admin/usuarios/permissoes" },
                ],
            },
            {
                title: "Períodos",
                url: "/admin/periodos",
                icon: <IconCalendar size={20} />,
                isActive: false,
                items: [
                    { title: "Listar Períodos", url: "/admin/periodos" },
                    { title: "Criar Período", url: "/admin/periodos/novo" },
                ],
            },
            {
                title: "Cursos",
                url: "/admin/cursos",
                icon: <IconBook size={20} />,
                isActive: false,
                items: [
                    { title: "Listar Cursos", url: "/admin/cursos" },
                    { title: "Novo Curso", url: "/admin/cursos/novo" },
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
                icon: <IconChartArcs size={20} />,
                isActive: false,
            },
            {
                title: "Relatórios",
                url: "/admin/relatorios",
                icon: <IconFileText size={20} />,
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
                icon: <IconSettings size={20} />,
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