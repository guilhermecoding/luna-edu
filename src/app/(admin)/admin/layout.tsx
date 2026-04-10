import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        template: "%s | LUNA (Admin)",
        default: "Administrador",
    },
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
        </>
    );
}
