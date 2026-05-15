"use client";

function timeGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
}

export function Greeting({ userName }: { userName: string }) {
    const greeting = timeGreeting();

    // O split(' ')[0] pega apenas o primeiro nome para ser mais pessoal
    const firstName = userName.split(" ")[0];

    return (
        <h1 className="text-3xl font-black text-foreground mb-2">
            {greeting}, {firstName}!
        </h1>
    );
}
