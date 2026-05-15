import { redirect } from "next/navigation";

export default async function LessonsPage({ params }: { params: Promise<{ program: string; period: string; classGroup: string; course: string }> }) {
    const { program, period, classGroup, course } = await params;
    redirect(`/admin/${program}/periodos/${period}/turmas/${classGroup}/disciplinas/${course}`);
    return null;
}
