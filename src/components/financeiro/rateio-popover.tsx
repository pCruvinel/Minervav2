import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface RateioItem {
    cc_id: string;
    cc_nome?: string;
    percentual: number;
    valor: number;
}

interface RateioPopoverProps {
    rateio: RateioItem[];
}

export function RateioPopover({ rateio }: RateioPopoverProps) {
    if (!rateio || rateio.length === 0) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/20 transition-colors">
                    Múltiplos CCs ({rateio.length})
                </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
                <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-medium text-sm">Rateio entre Centros de Custo</h4>
                        <Badge variant="outline" className="text-xs">{rateio.length} itens</Badge>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {rateio.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm py-1 border-b border-border/50 last:border-0 hover:bg-muted/50 rounded px-1">
                                <span className="text-muted-foreground truncate max-w-[160px]" title={item.cc_nome || item.cc_id}>
                                    {item.cc_nome || `CC-${item.cc_id.slice(0, 8)}`}
                                </span>
                                <div className="flex flex-col items-end">
                                    <span className="font-medium">{formatCurrency(item.valor)}</span>
                                    <span className="text-xs text-muted-foreground">{item.percentual.toFixed(2)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
