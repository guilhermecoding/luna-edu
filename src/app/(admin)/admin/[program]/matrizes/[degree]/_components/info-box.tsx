
interface InfoBoxProps {
    label: string;
    value: number | string;
    color?: string;
}

export default function InfoBox({ label, value, color = "indigo" }: InfoBoxProps) {
    return (
        <div className="relative overflow-hidden top-0 left-0 bg-surface w-full border border-surface-border text-center flex flex-col justify-center items-center gap-2 py-7 px-5 rounded-4xl">
            <span className="text-xl font-medium text-muted-foreground z-10">
                {label}
            </span>
            <span
                className={`text-4xl font-bold z-10 text-${color}-500 truncate w-full block`}
                title={value.toString()}
            >
                {value}
            </span>

            {/* Ciruclo */}
            <div className={`bg-${color}-500 size-48 rounded-full absolute -top-28 -right-28 opacity-10`}></div>
        </div>
    );
}
