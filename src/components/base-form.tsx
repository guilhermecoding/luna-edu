import React from "react";
import TitlePage, { TitlePageProps } from "./title-page";

interface BaseFormProps extends TitlePageProps {
    children?: React.ReactNode;
}

/**
 * Base reutilizável dos formulários.
 */
export default function BaseForm({ title, description, children }: BaseFormProps) {
    return (
        <div className="border border-muted-foreground/30 bg-muted/60 p-5 rounded-3xl">
            <TitlePage title={title} description={description} />
            {children}
        </div>
    );
}
