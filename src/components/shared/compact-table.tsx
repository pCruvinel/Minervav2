import * as React from "react"
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    TableHead,
    TableCell,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// --- Componentes de Estilo (Primitivos) ---

interface CompactTableHeadProps extends React.ComponentProps<typeof TableHead> {
    onSort?: () => void
    sortDirection?: "asc" | "desc" | false | null
}

/**
 * TableHead compacto para cabeçalhos de tabela.
 * Aplica: h-9 py-2 px-3 text-xs font-medium
 * Suporta ordenação via props `onSort` e `sortDirection`.
 */
export const CompactTableHead = React.forwardRef<
    React.ElementRef<typeof TableHead>,
    CompactTableHeadProps
>(({ className, children, onSort, sortDirection, ...props }, ref) => {
    return (
        <TableHead
            ref={ref}
            className={cn(
                "h-9 py-2 px-3 text-xs font-medium select-none",
                onSort && "cursor-pointer hover:bg-muted/50 hover:text-foreground transition-colors",
                className
            )}
            onClick={onSort}
            {...props}
        >
            <div className={cn("flex items-center gap-1.5", props.align === "right" && "justify-end", props.align === "center" && "justify-center")}>
                {children}
                {onSort && (
                    <span className="flex items-center text-muted-foreground/50">
                        {sortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-primary" />
                        ) : sortDirection === "desc" ? (
                            <ArrowDown className="h-3 w-3 text-primary" />
                        ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </span>
                )}
            </div>
        </TableHead>
    )
})
CompactTableHead.displayName = "CompactTableHead"

/**
 * TableCell compacto para células de dados.
 * Aplica: py-1.5 px-3 text-xs
 */
export const CompactTableCell = React.forwardRef<
    React.ElementRef<typeof TableCell>,
    React.ComponentProps<typeof TableCell>
>(({ className, ...props }, ref) => (
    <TableCell
        ref={ref}
        className={cn("py-1.5 px-3 text-xs", className)}
        {...props}
    />
))
CompactTableCell.displayName = "CompactTableCell"

/**
 * TableRow compacto para linhas de dados.
 * Aplica: hover:bg-muted/30
 * Use `bg-muted/40` para a linha do cabeçalho.
 */
export const CompactTableRow = React.forwardRef<
    React.ElementRef<typeof TableRow>,
    React.ComponentProps<typeof TableRow>
>(({ className, ...props }, ref) => (
    <TableRow
        ref={ref}
        className={cn("hover:bg-muted/30", className)}
        {...props}
    />
))
CompactTableRow.displayName = "CompactTableRow"


// --- Componente Wrapper (High Level) ---

interface CompactTableWrapperProps {
    /** Título do Card (Ex: Lançamentos Bancários) */
    title?: string
    /** Texto secundário no header */
    subtitle?: string
    /** Conteúdo da Tabela (<Table>...</Table>) */
    children: React.ReactNode

    // --- Paginação ---
    /** Quantidade total de itens (para exibir "X de Y") */
    totalItems?: number
    /** Quantidade de itens sendo exibidos na página atual */
    currentCount?: number
    /** Página atual (1-based) */
    page?: number
    /** Total de páginas */
    totalPages?: number
    /** Callback ao mudar página */
    onPageChange?: (page: number) => void
    /** Itens por página */
    itemsPerPage?: number
    /** Callback ao mudar itens por página */
    onItemsPerPageChange?: (perPage: number) => void
    /** Opções de itens por página (Ex: [10, 25, 50]) */
    pageSizeOptions?: number[]

    className?: string
}

/**
 * Wrapper padronizado para Tabelas Compactas.
 * Inclui: Card, Header com Contagem, Tabela com Overflow e Footer de Paginação.
 * 
 * @example
 * <CompactTableWrapper
 *   title="Usuários"
 *   totalItems={100}
 *   page={1}
 *   totalPages={10}
 *   onPageChange={setPage}
 * >
 *   <Table>...</Table>
 * </CompactTableWrapper>
 */
export function CompactTableWrapper({
    title,
    subtitle,
    children,
    totalItems = 0,
    currentCount = 0,
    page = 1,
    totalPages = 1,
    onPageChange,
    itemsPerPage = 10,
    onItemsPerPageChange,
    pageSizeOptions = [10, 25, 50],
    className,
}: CompactTableWrapperProps) {
    return (
        <Card className={cn("shadow-sm", className)}>
            {(title || subtitle) && (
                <CardHeader className="py-3 px-4 border-b">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <div className="flex flex-col">
                            <span>
                                {title}
                                {totalItems > 0 && ` (${totalItems})`}
                            </span>
                            {subtitle && (
                                <span className="text-xs font-normal text-muted-foreground mt-0.5">
                                    {subtitle}
                                </span>
                            )}
                        </div>
                        {totalItems > 0 && (
                            <span className="text-xs text-muted-foreground font-normal">
                                Mostrando {currentCount} de {totalItems}
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
            )}

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    {children}
                </div>

                {/* Footer de Paginação */}
                {totalItems > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                        {/* Seletor de Itens por Página */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Exibir</span>
                            <Select
                                value={String(itemsPerPage)}
                                onValueChange={(v) => onItemsPerPageChange?.(Number(v))}
                                disabled={!onItemsPerPageChange}
                            >
                                <SelectTrigger className="h-7 w-16 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {pageSizeOptions.map((size) => (
                                        <SelectItem key={size} value={String(size)} className="text-xs">
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span>por página</span>
                        </div>

                        {/* Navegação */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                Página {page} de {totalPages}
                            </span>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => onPageChange?.(Math.max(1, page - 1))}
                                    disabled={page === 1 || !onPageChange}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages || !onPageChange}
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
