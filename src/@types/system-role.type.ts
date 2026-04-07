import { SystemRole } from "@/generated/prisma/enums";

/**
 * Tipos de papéis do sistema para controle de acesso e permissões dentro da aplicação. Cada papel tem um conjunto específico de permissões que determinam o que o usuário pode ou não fazer dentro do sistema.
 * - FULL_ACCESS: Papel com acesso total ao sistema, permitindo que o usuário execute todas as ações e acesse todas as funcionalidades.
 * - READ_ONLY: Papel com acesso limitado, permitindo que o usuário apenas visualize informações sem a capacidade de modificar ou executar ações.
 */
export const SYSTEM_ROLE: Record<SystemRole, SystemRole> = {
    FULL_ACCESS: "FULL_ACCESS",
    READ_ONLY: "READ_ONLY",
} as const;