import { ReactNode } from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency as formatarMoeda } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface KPIFinanceiroGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

export function KPIFinanceiroGrid({ children, columns = 3 }: KPIFinanceiroGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "md:grid-cols-2",
      columns === 3 && "md:grid-cols-3",
      columns === 4 && "md:grid-cols-2 lg:grid-cols-4"
    )}>
      {children}
    </div>
  );
}

interface KPICardFinanceiroProps {
  title: string;
  value: number | string;
  previsto?: number | null;
  icon: LucideIcon;
  variant?: "default" | "success" | "danger" | "warning" | "neutral";
  trend?: number; // Porcentagem (ex: 10 para +10%, -5 para -5%)
  trendLabel?: string;
  className?: string;
  formatter?: (value: number | string) => string;
}

export function KPICardFinanceiro({
  title,
  value,
  previsto,
  icon: Icon,
  variant = "default",
  trend,
  trendLabel,
  className,
  formatter = (v) => typeof v === 'number' ? formatarMoeda(v) : String(v)
}: KPICardFinanceiroProps) {
  
  const formattedValue = formatter(value);
  
  // Cores baseadas na variante
  const variantStyles = {
    default: "text-foreground",
    success: "text-success",
    danger: "text-destructive",
    warning: "text-warning",
    neutral: "text-muted-foreground",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    success: "text-success bg-success/10",
    danger: "text-destructive bg-destructive/10",
    warning: "text-warning bg-warning/10",
    neutral: "text-muted-foreground bg-muted",
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-full", iconStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", variantStyles[variant])}>
          {formattedValue}
        </div>
        
        <div className="flex flex-col gap-1 mt-1">
          {/* Linha de Tendência */}
          {trend !== undefined && (
            <p className="text-xs flex items-center gap-1">
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500" /> // Custo subindo é ruim geralmente, mas depende do KPI
              ) : trend < 0 ? (
                <TrendingDown className="h-3 w-3 text-green-500" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={cn(
                trend > 0 ? "text-red-500" : trend < 0 ? "text-green-500" : "text-muted-foreground"
              )}>
                {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">
                {trendLabel || "vs mês anterior"}
              </span>
            </p>
          )}

          {/* Valor Previsto */}
          {previsto !== undefined && previsto !== null && (
            <p className="text-xs text-muted-foreground">
              Previsto: {formatarMoeda(previsto)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
