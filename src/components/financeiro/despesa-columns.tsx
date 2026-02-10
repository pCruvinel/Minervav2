import { ColumnDef, Row } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, AlertTriangle, Paperclip } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { RateioPopover } from "./rateio-popover"
import { Link } from "@tanstack/react-router"
import { DespesaMaster } from "@/lib/hooks/use-faturas-recorrentes"

// Tipo importado do hook
export type { DespesaMaster };

export const despesaColumns: ColumnDef<DespesaMaster>[] = [
    {
        accessorKey: "descricao",
        header: "Descrição / Favorecido",
        cell: ({ row }: { row: Row<DespesaMaster> }) => {
            const despesa = row.original
            return (
                <div className="flex flex-col min-w-[200px]">
                    <span className="font-medium truncate" title={despesa.descricao}>
                        {despesa.descricao}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                        {despesa.favorecido_tipo === 'colaborador' && despesa.favorecido_id ? (
                            // @ts-ignore - Rota dinâmica pode não estar gerada ainda no tipo
                            <Link 
                                to={`/colaboradores/${despesa.favorecido_id}`}
                                className="hover:underline flex items-center gap-1"
                            >
                                {despesa.favorecido_nome}
                            </Link>
                        ) : (
                            despesa.favorecido_nome
                        )}
                    </span>
                </div>
            )
        }
    },
    {
        accessorKey: "categoria_nome",
        header: "Categoria",
        cell: ({ row }: { row: Row<DespesaMaster> }) => {
            const categoria = row.original.categoria_nome || 'Sem categoria'
            return (
                <Badge variant="outline" className="whitespace-nowrap">
                    {categoria}
                </Badge>
            )
        }
    },
    {
        accessorKey: "cc_nome",
        header: "Centro de Custo",
        cell: ({ row }: { row: Row<DespesaMaster> }) => {
            const despesa = row.original
            
            if (despesa.rateio && despesa.rateio.length > 0) {
                return (
                    <RateioPopover rateio={despesa.rateio} />
                )
            }

            return (
                <span className="text-sm text-muted-foreground whitespace-nowrap" title={despesa.cc_nome}>
                    {despesa.cc_nome || '-'}
                </span>
            )
        }
    },
    {
        accessorKey: "vencimento",
        header: "Vencimento",
        cell: ({ row }: { row: Row<DespesaMaster> }) => {
            const vencimento = row.original.vencimento
            const isAtrasado = row.original.is_atrasado
            
            return (
                <div className={`flex items-center gap-2 whitespace-nowrap ${isAtrasado ? 'text-destructive font-bold' : ''}`}>
                    {isAtrasado && <AlertTriangle className="w-4 h-4" />}
                    <span>{formatDate(vencimento)}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "valor",
        header: () => <div className="text-right">Valor</div>,
        cell: ({ row }: { row: Row<DespesaMaster> }) => {
            return (
                <div className="text-right font-medium">
                    {formatCurrency(row.original.valor)}
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: { row: Row<DespesaMaster> }) => {
            const status = row.original.status
            
            switch (status) {
                case 'pago':
                    return <Badge className="bg-success/10 text-success hover:bg-success/20"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>
                case 'atrasado':
                    return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20"><XCircle className="w-3 h-3 mr-1" />Atrasado</Badge>
                case 'em_aberto':
                    return <Badge className="bg-warning/10 text-warning hover:bg-warning/20"><Clock className="w-3 h-3 mr-1" />Em Aberto</Badge>
                case 'cancelado':
                    return <Badge variant="secondary" className="opacity-70"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>
                default:
                    return <Badge variant="outline">{status}</Badge>
            }
        }
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }: { row: Row<DespesaMaster> }) => {
            const despesa = row.original

            return (
                <div className="flex items-center justify-end gap-2">
                    {despesa.comprovante_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" title="Ver Comprovante" asChild>
                            <a href={despesa.comprovante_url} target="_blank" rel="noopener noreferrer">
                                <Paperclip className="w-4 h-4" />
                            </a>
                        </Button>
                    )}
                </div>
            )
        }
    }
]
