import InfoBoxBase from "@/components/info-box-base";
import { IconBackpack, IconCalendarFilled, IconCirclesRelation, IconCodeAsterisk, IconEdit, IconGrid3x3, IconProgress, IconSchool, IconUsers } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function InfoBoxPeriodItem({
    label,
    value,
    icon,
    labelClassName,
    valueClassName,
}: {
    label: string,
    value: string,
    icon?: React.ReactNode,
    labelClassName?: string,
    valueClassName?: string,
}) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center gap-1">
                {icon && (
                    <span className="text-muted-foreground">
                        {icon}
                    </span>
                )}
                <span className={cn("text-base text-muted-foreground font-medium", labelClassName)}>
                    {label}
                </span>
            </div>
            <p className={cn("text-2xl font-semibold", valueClassName)}>{value}</p>
        </div>
    );
}

export default function InfoBoxPeriod() {
    return (
        <InfoBoxBase
            title="2° Ciclo de 2026"
            icon={<IconCalendarFilled className="size-9.5 -mt-1" />}
        >
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Coluna 1 */}
                    <div className="flex flex-col gap-3">
                        <InfoBoxPeriodItem
                            icon={<IconGrid3x3 className="size-4" />}
                            label="Slug do Período"
                            value="2c26"
                        />
                        <InfoBoxPeriodItem
                            icon={<IconCodeAsterisk className="size-4" />}
                            label="Código Canônico"
                            value="2026.2"
                        />
                        <InfoBoxPeriodItem
                            icon={<IconProgress className="size-4" />}
                            label="Status"
                            value="Ativo"
                        />
                        <InfoBoxPeriodItem
                            icon={<IconCirclesRelation className="size-4" />}
                            label="Condição"
                            value="Em Andamento"
                        />
                    </div>

                    {/* Coluna 2 */}
                    <div className="flex flex-col gap-3">
                        <InfoBoxPeriodItem
                            icon={<IconSchool className="size-4.5" />}
                            label="Alunos Matriculados"
                            value="105"
                        />
                        <InfoBoxPeriodItem
                            icon={<IconUsers className="size-4.5" />}
                            label="Total de Alunos"
                            value="120"
                        />
                        <InfoBoxPeriodItem
                            icon={<IconBackpack className="size-4" />}
                            label="Disciplinas"
                            value="12"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-border">
                    <Button variant="outline" className="gap-2">
                        <IconEdit className="size-4" />
                        Editar Conteúdo
                    </Button>
                </div>
            </div>
        </InfoBoxBase>
    );
}
