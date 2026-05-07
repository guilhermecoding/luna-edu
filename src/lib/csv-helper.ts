/**
 * Helper para parsing de arquivos CSV sem dependências externas.
 * Suporta delimitadores "," e ";" e diferentes formatos de data.
 */

export type CsvRow = Record<string, string>;

/**
 * Converte o conteúdo de um CSV em um array de objetos.
 * A primeira linha é tratada como cabeçalho.
 */
export function parseCsv(content: string): CsvRow[] {
    const lines = content
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .filter((line) => line.trim() !== "");

    if (lines.length < 2) return [];

    // Detectar delimitador: se a primeira linha tem mais ";" que ",", usar ";"
    const firstLine = lines[0];
    const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";

    const headers = parseCsvLine(firstLine, delimiter).map((h) => normalizeHeader(h));
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i], delimiter);
        if (values.length === 0 || values.every((v) => v.trim() === "")) continue;

        const row: CsvRow = {};
        for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = (values[j] ?? "").trim();
        }
        rows.push(row);
    }

    return rows;
}

/**
 * Faz o parse de uma linha CSV respeitando aspas.
 */
function parseCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === "\"") {
            if (inQuotes && line[i + 1] === "\"") {
                current += "\"";
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

/**
 * Normaliza nomes de cabeçalho para snake_case simples.
 * Ex: "Nome Completo" -> "nome_completo", "E-mail" -> "email"
 */
function normalizeHeader(header: string): string {
    return header
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/-/g, "_")
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
}

/**
 * Converte uma string de data nos formatos DD/MM/YYYY ou YYYY-MM-DD para Date.
 */
export function parseDateString(value: string): Date | null {
    if (!value) return null;

    // DD/MM/YYYY
    const brMatch = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (brMatch) {
        const [, day, month, year] = brMatch;
        const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
        if (!isNaN(date.getTime())) return date;
    }

    // YYYY-MM-DD
    const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
        const date = new Date(`${value}T00:00:00`);
        if (!isNaN(date.getTime())) return date;
    }

    return null;
}

/**
 * Mapeia valores de gênero do CSV para os enums do sistema.
 */
export function parseGenre(value: string): "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_TO_SAY" {
    const normalized = value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (["m", "masculino", "male"].includes(normalized)) return "MALE";
    if (["f", "feminino", "female"].includes(normalized)) return "FEMALE";
    if (["nb", "nao_binario", "nao-binario", "non_binary", "non-binary"].includes(normalized)) return "NON_BINARY";
    return "PREFER_NOT_TO_SAY";
}
