export default function formatDate(date: Date) {
    const timeZone = "UTC";
    const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone }).format(date);
    const month = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone })
        .format(date)
        .replace(".", "")
        .replace(/^./, (char) => char.toUpperCase());
    const year = new Intl.DateTimeFormat("pt-BR", { year: "numeric", timeZone }).format(date);

    return `${day} ${month}, ${year}`;
}