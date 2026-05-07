
export const AVATAR_COLORS = [
    "bg-green-200 text-green-800 border-green-300",
    "bg-blue-200 text-blue-800 border-blue-300",
    "bg-yellow-200 text-yellow-800 border-yellow-300",
    "bg-teal-200 text-teal-800 border-teal-300",
    "bg-cyan-200 text-cyan-800 border-cyan-300",
    "bg-indigo-200 text-indigo-800 border-indigo-300",
    "bg-rose-200 text-rose-800 border-rose-300",
    "bg-purple-200 text-purple-800 border-purple-300",
    "bg-pink-200 text-pink-800 border-pink-300",
    "bg-red-200 text-red-800 border-red-300",
];

/**
 * Gera um hash numérico determinístico a partir de uma string.
 */
export function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

/**
 * Retorna uma classe de cor de fundo e texto baseada no hash do nome.
 */
export function getAvatarColor(name: string) {
    return AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
}

/**
 * Extrai as iniciais de um nome (até 3 letras).
 */
export function getInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length > 1) {
        return (words[0][0] + words[0][1] + words[1][0]).toUpperCase();
    }
    return words[0].slice(0, 2).toUpperCase();
}
