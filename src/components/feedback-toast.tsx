"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function FeedBackToast() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const toastType = searchParams.get("toast");
        const message = searchParams.get("message");

        if (!toastType || !message) {
            return;
        }

        if (toastType === "success") {
            toast.success(message);
        } else {
            toast.error(message);
        }

        const params = new URLSearchParams(searchParams.toString());
        params.delete("toast");
        params.delete("message");

        const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(nextUrl, { scroll: false });
    }, [pathname, router, searchParams]);

    return null;
}
