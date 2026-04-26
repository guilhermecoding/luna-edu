"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { IconSearch } from "@tabler/icons-react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    title?: React.ReactNode;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    title,
}: DataTableProps<TData, TValue>) {

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table + React Compiler
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const searchParams = useSearchParams();
    const router = useRouter();
    const [query, setQuery] = useState(searchParams.get("q") || "");

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (query !== (searchParams.get("q") || "")) {
                if (query) {
                    params.set("q", query);
                } else {
                    params.delete("q");
                }
                router.replace(`?${params.toString()}`, { scroll: false });
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [query, router, searchParams]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {title && (
                    <div className="flex-1 w-full">
                        {title}
                    </div>
                )}
                <div className="w-full sm:max-w-sm flex flex-row items-center gap-2 px-5 py-1 rounded-full border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 ml-auto">
                    <IconSearch className="size-4 shrink-0" />
                    <Input
                        placeholder="Pesquisar por nome..."
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="border-none bg-transparent shadow-none outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
            </div>
            <div className="rounded-md border border-surface-border overflow-hidden bg-background">
                <Table>
                    <TableHeader className="bg-surface">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-surface-border">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="font-semibold text-muted-foreground">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-surface-border"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Nenhum usuário encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
