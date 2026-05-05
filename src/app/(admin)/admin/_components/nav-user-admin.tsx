"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
    IconCircleHalf2,
  IconDeviceDesktop,
  IconLogout,
  IconMoon,
  IconSelector,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import { toast } from "sonner";

import AvatarUsers from "@/components/avatar-users";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SYSTEM_ROLE } from "@/@types/system-role.type";
import type { Genre } from "@/generated/prisma/enums";
import { GENRE_VALUES } from "@/lib/genre";
import { authClient } from "@/lib/auth-client";
import type { SessionUser } from "@/@types/session-type";

function ageFromBirthDate(birthDate: string | Date | undefined | null): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(0, age);
}

function parseGenre(value: unknown): Genre | undefined {
  if (typeof value !== "string") return undefined;
  return (GENRE_VALUES as readonly string[]).includes(value)
    ? (value as Genre)
    : undefined;
}

function roleLabelFromSessionUser(user: Omit<SessionUser, "name">): string {
  const adminLike =
    Boolean(user.isAdmin) || user.systemRole === SYSTEM_ROLE.FULL_ACCESS;
  const teacher = Boolean(user.isTeacher);
  if (adminLike && teacher) return "Administrador & Professor";
  if (adminLike) return "Administrador";
  if (teacher) return "Professor";
  return "";
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: session, isPending } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error("Não foi possível sair", {
          description: error.message ?? "Tente novamente.",
        });
        return;
      }
      router.replace("/entrar");
      router.refresh();
    } catch {
      toast.error("Erro ao sair", {
        description: "Ocorreu um problema ao conectar com o servidor.",
      });
    } finally {
      setSigningOut(false);
    }
  }

  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled className="pointer-events-none">
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="grid flex-1 gap-1 text-left">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.name?.trim() || "Usuário";
  const roleLabel = roleLabelFromSessionUser(user);
  const age = ageFromBirthDate(
    "birthDate" in user ? (user as { birthDate?: string | Date }).birthDate : undefined,
  );
  const genre = parseGenre("genre" in user ? (user as { genre?: unknown }).genre : undefined);

  const summary = (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <AvatarUsers
        age={age}
        genre={genre}
        className="h-8 w-8 shrink-0 rounded-lg"
        alt={`Avatar de ${displayName}`}
      />
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{displayName}</span>
        <span className="truncate text-xs text-muted-foreground">{roleLabel}</span>
      </div>
    </div>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {summary}
              <IconSelector className="shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="px-1 py-1.5">{summary}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUser />
                Perfil
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="flex items-center gap-2 px-2 py-1.5">
              <IconCircleHalf2 className="size-3.5 ml-1" />
              <span className="text-xs font-medium">Tema</span>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger size="sm" className="h-7 w-[110px] rounded-md px-2 py-1 text-xs">
                  <SelectValue placeholder="Tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <IconSun className="size-3.5" />
                      <span>Claro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <IconMoon className="size-3.5" />
                      <span>Escuro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <IconDeviceDesktop className="size-3.5" />
                      <span>Sistema</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex cursor-pointer text-red-600 hover:bg-red-50! hover:text-red-600! data-[state=open]:bg-red-50 dark:hover:bg-red-900! dark:hover:text-red-50!"
              disabled={signingOut}
              onSelect={(e) => {
                e.preventDefault();
                void handleSignOut();
              }}
            >
              <IconLogout className="mt-0.5" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
