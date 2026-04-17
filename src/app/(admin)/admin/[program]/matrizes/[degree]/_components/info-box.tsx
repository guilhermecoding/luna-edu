
interface InfoBoxProps {
    label: string;
    value: number | string;
    color?: string;
}

const colorMap: Record<string, { text: string; bg: string }> = {
    indigo: { text: "text-indigo-500", bg: "bg-indigo-500" },
    green: { text: "text-green-500", bg: "bg-green-500" },
    rose: { text: "text-rose-500", bg: "bg-rose-500" },
    emerald: { text: "text-emerald-500", bg: "bg-emerald-500" },
    purple: { text: "text-purple-500", bg: "bg-purple-500" },
    amber: { text: "text-amber-500", bg: "bg-amber-500" },
};

export default function InfoBox({ label, value, color = "indigo" }: InfoBoxProps) {
    const colors = colorMap[color] || colorMap.indigo;

    return (
        <div className="relative overflow-hidden top-0 left-0 bg-surface w-full border border-surface-border text-center flex flex-col justify-center items-center gap-2 py-7 px-5 rounded-4xl">
            <span className="text-xl md:text-2xl font-medium text-muted-foreground z-10">
                {label}
            </span>
            <span
                className={`text-3xl md:text-4xl font-bold z-10 ${colors.text} truncate w-full block`}
                title={value.toString()}
            >
                {value}
            </span>

            {/* Ciruclo */}
            <div className={`${colors.bg} size-48 rounded-full absolute -top-28 -right-28 opacity-10`}></div>
        </div>
    );
}
