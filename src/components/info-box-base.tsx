/**
 * Propriedades para o componente InfoBoxBase.
 */
interface InfoBoxBaseProps {
    /** O título a ser exibido na caixa de informações. */
    title: string;
    /** O ícone a ser exibido ao lado do título. */
    icon: React.ReactNode;
    /** O conteúdo interno da caixa de informações. */
    children: React.ReactNode;
}

/**
 * Componente base para criar caixas de informações (InfoBox) padronizadas.
 * Exibe um título com ícone e envolve o conteúdo fornecido através de `children`.
 *
 * @param {InfoBoxBaseProps} props - As propriedades do componente.
 * @param {string} props.title - O título do InfoBox.
 * @param {React.ReactNode} props.icon - O ícone renderizado ao lado do título.
 * @param {React.ReactNode} props.children - O conteúdo a ser renderizado dentro do InfoBox.
 * @returns {JSX.Element} O componente InfoBoxBase renderizado.
 */
export default function InfoBoxBase({ title, icon, children }: InfoBoxBaseProps) {
    return (
        <div className="w-full bg-surface p-8 border border-muted-foreground rounded-4xl">
            {/* Titulo e icone */}
            <div className="flex flex-row items-center gap-2">
                {icon}
                <h1 className="text-4xl font-bold">
                    {title}
                </h1>
            </div>
            {/* Children */}
            <div className="w-full mt-4">
                {children}
            </div>
        </div>
    );
}
