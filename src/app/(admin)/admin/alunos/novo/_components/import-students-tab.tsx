"use client";

import { useCallback, useRef, useState } from "react";
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

type ImportState = "idle" | "uploading" | "done";

export default function ImportStudentsTab() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [state, setState] = useState<ImportState>("idle");
    const [result, setResult] = useState<ImportResult | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
                    className="shrink-0"
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
                                    ? "border-emerald-400 bg-emerald-50/50"
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
                            <Button type="button" onClick={handleImport}>
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
                <div className="flex flex-col gap-4">
                    {result.success ? (
                        <>
                            {/* Resumo de sucesso */}
                            <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                                        <IconCheck className="size-5" />
                                    </div>
                                    <h4 className="text-lg font-bold text-emerald-900">Importação Concluída</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 bg-white/80 rounded-xl border border-emerald-100">
                                        <p className="text-2xl font-bold text-emerald-700">{result.created}</p>
                                        <p className="text-sm text-emerald-600">Novos alunos</p>
                                    </div>
                                    <div className="p-4 bg-white/80 rounded-xl border border-emerald-100">
                                        <p className="text-2xl font-bold text-blue-700">{result.updated}</p>
                                        <p className="text-sm text-blue-600">Atualizados</p>
                                    </div>
                                    <div className="p-4 bg-white/80 rounded-xl border border-emerald-100">
                                        <p className="text-2xl font-bold text-foreground">{result.total}</p>
                                        <p className="text-sm text-muted-foreground">Total processados</p>
                                    </div>
                                </div>
                            </div>

                            {/* Linhas puladas */}
                            {result.skipped.length > 0 && (
                                <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <IconAlertTriangle className="size-5 text-amber-600" />
                                        <h4 className="font-semibold text-amber-900">
                                            {result.skipped.length} linha(s) ignorada(s)
                                        </h4>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto space-y-2">
                                        {result.skipped.map((item) => (
                                            <div key={item.row} className="text-sm text-amber-800 bg-white/60 p-2 rounded-lg">
                                                <span className="font-mono font-semibold">Linha {item.row}:</span>{" "}
                                                {item.errors.join(", ")}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Erros de banco */}
                            {result.dbErrors.length > 0 && (
                                <div className="p-5 rounded-2xl border border-red-200 bg-red-50/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <IconAlertTriangle className="size-5 text-red-600" />
                                        <h4 className="font-semibold text-red-900">
                                            {result.dbErrors.length} erro(s) no banco de dados
                                        </h4>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto space-y-2">
                                        {result.dbErrors.map((item) => (
                                            <div key={item.row} className="text-sm text-red-800 bg-white/60 p-2 rounded-lg">
                                                <span className="font-mono font-semibold">Linha {item.row} (CPF: {item.cpf}):</span>{" "}
                                                {item.error}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-6 rounded-2xl border border-red-200 bg-red-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 text-red-600 rounded-full">
                                    <IconAlertTriangle className="size-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-900">Falha na Importação</h4>
                                    <p className="text-sm text-red-700 mt-1">{result.error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button type="button" variant="outline" onClick={handleReset}>
                            <IconRefresh className="size-4 mr-2" />
                            Nova Importação
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
