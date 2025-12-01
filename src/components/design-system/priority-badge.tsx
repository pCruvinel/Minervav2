import { Badge } from "@/components/ui/badge";

export type PriorityType = 'ALTA' | 'MEDIA' | 'BAIXA';

interface PriorityBadgeProps {
    priority: PriorityType;
    children: React.ReactNode;
}

const priorityVariants = {
    ALTA: "bg-destructive/5 text-destructive border-destructive/20",
    MEDIA: "bg-warning/5 text-warning border-warning/20",
    BAIXA: "bg-success/5 text-success border-success/20"
} as const;

export const PriorityBadge = ({ priority, children }: PriorityBadgeProps) => {
    return (
        <Badge variant="outline" className={priorityVariants[priority]}>
            {children}
        </Badge>
    );
};