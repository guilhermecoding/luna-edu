import { IconUsers } from "@tabler/icons-react";
import Page from "luna-edu/src/components/page";
import Section from "luna-edu/src/components/section";
import TitlePage from "@/components/title-page";
import React from "react";

export default function UsersPage() {
    return (
        <Page>
            <Section>
            <div className="flex flex-row items-center gap-1 mb-3">
                    <IconUsers className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Usuários</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">    
                        <TitlePage
                            title="Usuários do Sistema"
                            description="Gerencie todos os usuários da sua instituição."
                        />
                    </div>
                </div>
            </Section>
        </Page>
    );
}
