/**
 * Gera uma chave numerica no formato YYYYMMDD para uma data em um timezone especifico.
 *
 * Essa funcao e util quando a regra de negocio precisa comparar apenas o dia
 * (ignorando hora/minuto/segundo), evitando efeitos de fuso horario.
 *
 * Como usar:
 * - Compare duas datas por dia no mesmo timezone.
 * - Use a chave retornada com operadores numericos (<, >, ===).
 *
 * Exemplo:
 * const todayKey = getDayKeyInTimeZone(new Date(), "America/Sao_Paulo");
 * const endKey = getDayKeyInTimeZone(period.endDate, "America/Sao_Paulo");
 * const isLate = todayKey > endKey;
 *
 * @param date Data de referencia.
 * @param timeZone Timezone IANA (ex.: "America/Sao_Paulo", "UTC").
 * @returns Chave numerica YYYYMMDD.
 */
export default function getDayKeyInTimeZone(date: Date, timeZone: string): number {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    let year = "";
    let month = "";
    let day = "";

    for (const part of parts) {
        if (part.type === "year") {
            year = part.value;
        }

        if (part.type === "month") {
            month = part.value;
        }

        if (part.type === "day") {
            day = part.value;
        }
    }

    return Number(`${year}${month}${day}`);
}
