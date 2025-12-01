import { Badge } from "@/components/ui/badge";

export type StatusType = 'em_andamento' | 'em_triagem' | 'concluido' | 'cancelado';

interface StatusBadgeProps {
    status: StatusType;
    children: React.ReactNode;
}

const statusVariants = {
    em_andamento: "bg-info/10 text-info border-info/20",
    em_triagem: "bg-warning/10 text-warning border-warning/20",
    concluido: "bg-success/10 text-success border-success/20",
    cancelado: "bg-destructive/10 text-destructive border-destructive/20"
} as const;

export const StatusBadge = ({ status, children }: StatusBadgeProps) => {
    return (
        <Badge variant="outline" className={statusVariants[status]}>
            {children}
        </Badge>
    );
};