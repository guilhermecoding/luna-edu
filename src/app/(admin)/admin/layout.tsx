import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        template: "%s | LUNA (Admin)",
        default: "Administrador",
    },
    robots: {
        index: false,
        follow: false,
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
