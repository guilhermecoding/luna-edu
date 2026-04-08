import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { SideBarContentAdmin, SideBarHeaderAdmin } from "./_components/SideBarAdmin";
import { IconHome, IconUsers, IconBook, IconCalendar, IconSettings, IconChartArcs, IconFileText } from "@tabler/icons-react";
import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";

const adminMenus: ItemMenuSidebarAdmin[] = [
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

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AppSidebar sideBarHeader={<SideBarHeaderAdmin />}>
                <SideBarContentAdmin menus={adminMenus} />
            </AppSidebar>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 mt-2 data-[orientation=vertical]:h-4"
                        />
                        <span>Administrador</span>
                    </div>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
