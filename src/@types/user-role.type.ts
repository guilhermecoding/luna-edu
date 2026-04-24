/**
 * Tipos de usuário para controle de acesso e permissões dentro do sistema. Cada função tem um conjunto específico de permissões que determinam o que o usuário pode ou não fazer dentro da aplicação.
 * - ADMIN: Usuário com acesso total ao sistema, podendo gerenciar usuários, configurar o sistema e acessar todas as funcionalidades.
 * - TEACHER: Usuário com acesso limitado, geralmente voltado para professores, permitindo acesso a funcionalidades relacionadas ao ensino e gerenciamento de turmas.
 */
export type UserRole = "ADMIN" | "TEACHER";

/**
 * Tipos de usuário para controle de acesso e permissões dentro do sistema. Cada função tem um conjunto específico de permissões que determinam o que o usuário pode ou não fazer dentro da aplicação.
 * - ADMIN: Usuário com acesso total ao sistema, podendo gerenciar usuários, configurar o sistema e acessar todas as funcionalidades.
 * - TEACHER: Usuário com acesso limitado, geralmente voltado para professores, permitindo acesso a funcionalidades relacionadas ao ensino e gerenciamento de turmas.
 */
export const USER_ROLE: Record<UserRole, UserRole> = {
    ADMIN: "ADMIN",
    TEACHER: "TEACHER",
} as const;