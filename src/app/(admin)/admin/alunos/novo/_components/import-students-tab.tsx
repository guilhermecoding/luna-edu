"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { importStudentsAction, type ImportResult } from "../../actions";
import { toast } from "sonner";
import {
    IconUpload,
    IconFileTypeCsv,
    IconX,
    IconLoader2,
    IconCheck,
    IconAlertTriangle,
    IconUserPlus,
    IconRefresh,
    IconDownload,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

type ImportState = "idle" | "uploading" | "done";

export default function ImportStudentsTab({ periodId }: { periodId?: string } = {}) {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [state, setState] = useState<ImportState>("idle");
    const [result, setResult] = useState<ImportResult | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Resetar estado ao desmontar ou trocar de aba
    useEffect(() => {
        return () => {
            setFile(null);
            setResult(null);
            setState("idle");
            toast.dismiss();
        };
    }, []);

    const handleFile = (f: File) => {
        if (!f.name.endsWith(".csv")) {
            toast.error("Formato inválido. Selecione um arquivo .csv");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            toast.error("Arquivo muito grande. O limite é 5MB.");
            return;
        }
        setFile(f);
        setResult(null);
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFile(droppedFile);
    }, []);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) handleFile(selected);
    };

    const handleImport = async () => {
        if (!file) return;

        setState("uploading");
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            if (periodId) {
                formData.append("periodId", periodId);
            }

            const res = await importStudentsAction(formData);
            setResult(res);

            if (res.success) {
                toast.success(`Importação concluída! ${res.created} criados, ${res.updated} atualizados.`);
            } else {
                toast.error(res.error);
            }
        } catch {
            toast.error("Erro inesperado na importação.");
        } finally {
            setState("done");
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
        setState("idle");
        if (inputRef.current) inputRef.current.value = "";
    };

    const downloadTemplate = () => {
        const header = "nome,email,cpf,data_nascimento,genero,celular_aluno,celular_responsavel,escola_origem";
        const example = "João da Silva,joao@email.com,12345678900,15/03/2010,Masculino,11999990000,11888880000,Escola Estadual SP";
        const csvContent = `${header}\n${example}`;
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "modelo_importacao_alunos.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header com botão de template */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Importar Alunos via CSV</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Arraste um arquivo .csv ou clique para selecionar. Alunos com CPF já cadastrado terão seus dados atualizados.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="shrink-0 w-full sm:w-auto"
                >
                    <IconDownload className="size-4 mr-1.5" />
                    Baixar Modelo CSV
                </Button>
            </div>

            {/* Drag & Drop Zone */}
            {state === "idle" && (
                <>
                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => inputRef.current?.click()}
                        className={`
                            relative cursor-pointer p-12 flex flex-col items-center justify-center gap-4
                            border-2 border-dashed rounded-2xl bg-background/50 text-center
                            transition-all duration-200
                            ${isDragging
                                ? "border-primary bg-primary/5 scale-[1.01]"
                                : file
                                    ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/50"
                                    : "border-surface-border hover:border-primary/50 hover:bg-primary/5"
                            }
                        `}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".csv"
                            onChange={onFileChange}
                            className="hidden"
                        />

                        {file ? (
                            <>
                                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
                                    <IconFileTypeCsv className="size-8" />
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-foreground">{file.name}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleReset();
                                    }}
                                    className="text-muted-foreground hover:text-red-500"
                                >
                                    <IconX className="size-4 mr-1" />
                                    Remover
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="p-4 bg-primary/10 text-primary rounded-full">
                                    <IconUpload className="size-8" />
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-foreground">
                                        Arraste seu arquivo CSV aqui
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        ou clique para selecionar. Máximo 5MB.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {file && (
                        <div className="flex justify-end">
                            <Button type="button" onClick={handleImport} className="h-11">
                                <IconUserPlus className="size-4 mr-2" />
                                Importar Alunos
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Uploading State */}
            {state === "uploading" && (
                <div className="p-12 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-primary/50 rounded-2xl bg-primary/5 text-center">
                    <div className="p-4 bg-primary/10 text-primary rounded-full animate-pulse">
                        <IconLoader2 className="size-8 animate-spin" />
                    </div>
                    <div>
                        <p className="text-base font-semibold text-foreground">Processando importação...</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Isso pode levar alguns segundos dependendo da quantidade de alunos.
                        </p>
                    </div>
                </div>
            )}

            {/* Result State */}
            {state === "done" && result && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {result.success ? (
                        <div className="space-y-4">
                            {/* Dashboard de Estatísticas */}
                            <div className="bg-background border border-surface-border rounded-3xl overflow-hidden">
                                <div className="p-6 border-b border-surface-border bg-emerald-50/30 flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                                        <IconCheck className="size-5" />
                                    </div>
                                    <h4 className="text-lg font-bold text-foreground">Importação Finalizada</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-x divide-surface-border">
                                    <div className="p-6 text-center">
                                        <p className="text-3xl font-bold text-emerald-600">{result.created}</p>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Criados</p>
                                    </div>
                                    <div className="p-6 text-center">
                                        <p className="text-3xl font-bold text-blue-600">{result.updated}</p>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Atualizados</p>
                                    </div>
                                    <div className="p-6 text-center">
                                        <p className="text-3xl font-bold text-foreground">{result.total}</p>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Total</p>
                                    </div>
                                </div>
                            </div>

                            {/* Logs de Problemas (se houver) */}
                            {(result.skipped.length > 0 || result.dbErrors.length > 0) && (
                                <div className="border border-surface-border rounded-2xl overflow-hidden">
                                    <div className="px-4 py-3 bg-muted/50 border-b border-surface-border flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <IconAlertTriangle className="size-4 text-amber-500" />
                                            <span className="text-sm font-semibold">Informativo de Processamento</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {result.skipped.length + result.dbErrors.length} itens requerem sua atenção
                                        </span>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto divide-y divide-surface-border bg-background">
                                        {result.skipped.map((item, idx) => (
                                            <div key={`skip-${idx}`} className="p-3 flex gap-3 items-start hover:bg-muted/30 transition-colors">
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase mt-0.5">Atenção</span>
                                                <div className="text-sm">
                                                    <span className="font-semibold text-foreground">Linha {item.row}:</span>{" "}
                                                    <span className="text-muted-foreground">{item.errors.join(", ")}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {result.dbErrors.map((item, idx) => (
                                            <div key={`err-${idx}`} className="p-3 flex gap-3 items-start hover:bg-muted/30 transition-colors">
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase mt-0.5">Falha</span>
                                                <div className="text-sm">
                                                    <span className="font-semibold text-foreground">Linha {item.row}:</span>{" "}
                                                    <span className="text-muted-foreground">{item.error}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 rounded-3xl border border-red-200 bg-red-50/50 flex items-center gap-4">
                            <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                                <IconAlertTriangle className="size-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-red-900">Não foi possível importar</h4>
                                <p className="text-sm text-red-700 mt-1">{result.error}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-surface-border mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11"
                            onClick={handleReset}
                        >
                            <IconRefresh className="size-4 mr-2" />
                            Nova Importação
                        </Button>
                        <Button
                            type="button"
                            className="h-11 px-8"
                            onClick={() => router.push("/admin/alunos")}
                        >
                            Concluído
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
