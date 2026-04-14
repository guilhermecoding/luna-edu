/**
 * Gera um slug automaticamente a partir do nome do programa, removendo acentos, caracteres especiais e substituindo espaços por hífens.
 * @param name O nome do programa a ser convertido em slug.
 * @returns O slug gerado a partir do nome do programa.
 */
export default function autoSlug(name: string) {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}