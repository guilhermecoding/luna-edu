"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { IconUser } from "@tabler/icons-react";

type TeacherOption = {
    id: string;
    name: string;
};

export default function TeacherFilter({
    teachers,
    currentTeacherId,
}: {
    teachers: TeacherOption[];
    currentTeacherId?: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleTeacherChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set("teacherId", value);
        } else {
            params.delete("teacherId");
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <IconUser className="size-4 text-muted-foreground" />
            <Select value={currentTeacherId || "all"} onValueChange={handleTeacherChange}>
                <SelectTrigger className="w-[240px] bg-surface border-surface-border rounded-xl">
                    <SelectValue placeholder="Filtrar por Professor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Professores</SelectItem>
                    {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
