/**
 * KPICardComparativo - Card de KPI com comparação entre setores
 * 
 * Exibe um KPI principal com breakdown por setor (ASS/OBRAS/ADM).
 * 
 * @example
 * ```tsx
 * <KPICardComparativo
 *   title="Lucro"
 *   total={150000}
 *   ass={80000}
 *   obras={70000}
 *   variant="success"
 * />
 * ```
 */

import { type ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

type KPIVariant = 'default' | 'success' | 'warning' | 'danger' | 'primary';

interface KPICardComparativoProps {
  title: string;
  icon?: LucideIcon;
  total: number;
  ass?: number;
  obras?: number;
  adm?: number;
  variant?: KPIVariant;
  loading?: boolean;
  showPercentage?: boolean;
  previousValue?: number; // Para mostrar variação
  format?: 'currency' | 'number' | 'percentage';
  className?: string;
}

// ============================================================
// HELPERS
// ============================================================

const variantStyles: Record<KPIVariant, string> = {
  default: 'bg-card',
  success: 'bg-success/5 border-success/20',
  warning: 'bg-warning/5 border-warning/20',
  danger: 'bg-destructive/5 border-destructive/20',
  primary: 'bg-primary/5 border-primary/20',
};

const variantTextStyles: Record<KPIVariant, string> = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
  primary: 'text-primary',
};

function formatValue(value: number, format: 'currency' | 'number' | 'percentage' = 'currency'): string {
  if (format === 'percentage') {
    return `${value.toFixed(1)}%`;
  }
  
  if (format === 'number') {
    return new Intl.NumberFormat('pt-BR').format(value);
  }
  
  // Currency
  if (Math.abs(value) >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatValueCompact(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat('pt-BR', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ============================================================
// COMPONENT
// ============================================================

export function KPICardComparativo({
  title,
  icon: Icon,
  total,
  ass,
  obras,
  adm,
  variant = 'default',
  loading = false,
  showPercentage = false,
  previousValue,
  format = 'currency',
  className,
}: KPICardComparativoProps) {
  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasBreakdown = ass !== undefined || obras !== undefined;
  const variation = previousValue !== undefined ? ((total - previousValue) / Math.abs(previousValue)) * 100 : null;

  return (
    <Card className={cn('overflow-hidden', variantStyles[variant], className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Valor Principal */}
        <div className="flex items-baseline gap-2">
          <span className={cn('text-2xl font-bold', variantTextStyles[variant])}>
            {formatValue(total, format)}
          </span>
          
          {variation !== null && (
            <span className={cn(
              'text-sm font-medium flex items-center gap-0.5',
              variation > 0 ? 'text-success' : variation < 0 ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {variation > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : variation < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {Math.abs(variation).toFixed(1)}%
            </span>
          )}
        </div>

        {/* Breakdown por Setor */}
        {hasBreakdown && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {ass !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ASS</span>
                  <span className="font-medium">
                    {format === 'currency' ? `R$ ${formatValueCompact(ass)}` : formatValue(ass, format)}
                  </span>
                </div>
              )}
              {obras !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">OBRAS</span>
                  <span className="font-medium">
                    {format === 'currency' ? `R$ ${formatValueCompact(obras)}` : formatValue(obras, format)}
                  </span>
                </div>
              )}
              {adm !== undefined && adm > 0 && (
                <div className="flex justify-between items-center col-span-2">
                  <span className="text-muted-foreground">ADM</span>
                  <span className="font-medium">
                    {format === 'currency' ? `R$ ${formatValueCompact(adm)}` : formatValue(adm, format)}
                  </span>
                </div>
              )}
            </div>
            
            {showPercentage && total > 0 && (
              <div className="flex gap-2 mt-2">
                {ass !== undefined && (
                  <div className="flex-1 bg-primary/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${(ass / total) * 100}%` }}
                    />
                  </div>
                )}
                {obras !== undefined && (
                  <div className="flex-1 bg-success/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-success h-full rounded-full"
                      style={{ width: `${(obras / total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// KPI Grid Container
interface KPIGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function KPIGrid({ children, columns = 4, className }: KPIGridProps) {
  const colsClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', colsClass[columns], className)}>
      {children}
    </div>
  );
}
