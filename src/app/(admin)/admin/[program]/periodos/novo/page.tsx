import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import SkeletonForm from "../../../../../../components/skeletons/skeleton-form";

export default function NewPeriodPage() {
    return (
        <Page>
            <Section>
                <BaseForm
                    title="Novo Período"
                    description="Adicione um novo período letivo ao sistema"
                >
                    <div className="mt-6">
                        <SkeletonForm />
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}
