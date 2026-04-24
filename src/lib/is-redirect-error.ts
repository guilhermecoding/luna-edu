
/**
 * Verifica se o erro recebido é o erro interno de redirecionamento do Next.js
 * (`NEXT_REDIRECT`), lançado durante `redirect()` em Server Actions.
 *
 * @param error Erro desconhecido capturado em blocos `catch`.
 * @returns `true` quando o erro representa um redirect do Next.js; caso contrário, `false`.
 */
export function isRedirectError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "digest" in error &&
        typeof error.digest === "string" &&
        error.digest.startsWith("NEXT_REDIRECT")
    );
}