"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconUserPlus } from "@tabler/icons-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CreateStudentForm from "@/app/(admin)/admin/alunos/novo/_components/create-student-form";

export default function AddStudentPeriodButton({ periodId }: { periodId: string }) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="w-full sm:w-auto h-11" variant="default">
                    <IconUserPlus className="size-5 mr-2" />
                    Adicionar Aluno
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader className="px-0 pb-6">
                    <SheetTitle>Adicionar Aluno ao Período</SheetTitle>
                </SheetHeader>
                <div className="pt-2">
                    <CreateStudentForm 
                        periodId={periodId} 
                        redirectPath="none" 
                        onCancel={() => setOpen(false)} 
                        onSuccess={() => setOpen(false)} 
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
