"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function TeacherPage() {
    const router = useRouter();

    async function handleLogout() {
        await authClient.signOut();
        router.push("/entrar");
        router.refresh();
    }

    return (
        <div className="p-6">
            <h1 className="mb-4 text-xl font-semibold">Área do Professor</h1>
            <Button variant="destructive" onClick={handleLogout}>
                Logout (temporário)
            </Button>
        </div>
    );
}
