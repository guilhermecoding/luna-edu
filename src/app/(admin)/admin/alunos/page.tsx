import Page from "@/components/page";
import Section from "@/components/section";
import { IconSchool } from "@tabler/icons-react";
import React from "react";

export default function StudentsPage() {
  return (
    <Page>
        <Section>
            <div className="flex flex-row items-center gap-1 mb-3">
                <IconSchool className="size-4 text-muted-foreground" />
                <p className="text-muted-foreground font-bold">Alunos</p>
            </div>
        </Section>
    </Page>
  );
}
