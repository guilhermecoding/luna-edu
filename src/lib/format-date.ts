export default function formatDate(date: Date) {
    const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date);
    const month = new Intl.DateTimeFormat("pt-BR", { month: "short" })
        .format(date)
        .replace(".", "")
        .replace(/^./, (char) => char.toUpperCase());
    const year = new Intl.DateTimeFormat("pt-BR", { year: "numeric" }).format(date);

    return `${day} ${month}, ${year}`;
}