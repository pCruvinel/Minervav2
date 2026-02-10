import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Variantes de cor para o KPI Card Financeiro
 * Seguindo o Design System v2.1
 */
export type KPIVariant = 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'neutral';

export interface KPIFinanceiroProps {
    /** Título do KPI (ex: "Receita Prevista") */
    title: string;
    /** Valor principal formatado (ex: "R$ 128.000") */
    value: string | number;
    /** Indicador de tendência (opcional) */
    trend?: {
        value: string;
        isPositive: boolean;
    };
    /** Ícone do card (componente Lucide) */
    icon: ReactNode;
    /** Variante de cor */
    variant?: KPIVariant;
    /** Callback ao clicar (torna o card interativo) */
    onClick?: () => void;
    /** Subtítulo opcional (ex: "vs. mês anterior") */
    subtitle?: string;
    /** Se true, mostra um indicador de carregamento */
    loading?: boolean;
    /** Classes CSS adicionais */
    className?: string;
    /** Formatador customizado para o valor */
    formatter?: (value: string | number) => string;
}

const variantStyles: Record<KPIVariant, { bg: string; icon: string }> = {
    primary: {
        bg: 'bg-primary/10',
        icon: 'text-primary',
    },
    success: {
        bg: 'bg-green-100',
        icon: 'text-green-600',
    },
    warning: {
        bg: 'bg-yellow-100',
        icon: 'text-yellow-600',
    },
    destructive: {
        bg: 'bg-red-100',
        icon: 'text-red-600',
    },
    info: {
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
    },
    neutral: {
        bg: 'bg-neutral-100',
        icon: 'text-neutral-600',
    },
};

/**
 * KPICardFinanceiro - Card de KPI para o módulo financeiro
 *
 * Componente padronizado para exibir métricas financeiras com:
 * - Título e valor principal
 * - Indicador de tendência (opcional)
 * - Ícone colorido por variante
 * - Suporte a interatividade (onClick)
 *
 * @example
 * ```tsx
 * <KPICardFinanceiro
 *   title="Receita Prevista"
 *   value="R$ 128.000"
 *   trend={{ value: "+12.5%", isPositive: true }}
 *   icon={<TrendingUp className="w-6 h-6" />}
 *   variant="success"
 *   onClick={() => navigate('/financeiro/receitas')}
 * />
 * ```
 */
export function KPICardFinanceiro({
    title,
    value,
    trend,
    icon,
    variant = 'primary',
    onClick,
    subtitle,
    loading = false,
    className,
    formatter,
}: KPIFinanceiroProps) {
    const styles = variantStyles[variant];

    return (
        <Card
            className={cn(
                'transition-all duration-200',
                onClick && 'cursor-pointer hover:shadow-card-hover hover:border-primary/30',
                className
            )}
            onClick={onClick}
        >
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-600 truncate">{title}</p>

                        {loading ? (
                            <div className="h-8 w-24 bg-neutral-200 rounded animate-pulse mt-1" />
                        ) : (
                            <p className="text-2xl font-bold text-neutral-900 mt-1 truncate">
                                {formatter 
                                    ? formatter(value) 
                                    : (typeof value === 'number' ? formatCurrency(value) : value)
                                }
                            </p>
                        )}

                        {trend && !loading && (
                            <p
                                className={cn(
                                    'text-sm mt-1 flex items-center gap-1',
                                    trend.isPositive ? 'text-success' : 'text-destructive'
                                )}
                            >
                                {trend.isPositive ? (
                                    <ArrowUp className="w-3 h-3" />
                                ) : (
                                    <ArrowDown className="w-3 h-3" />
                                )}
                                <span>{trend.value}</span>
                            </p>
                        )}

                        {subtitle && !loading && (
                            <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
                        )}
                    </div>

                    <div
                        className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ml-4',
                            styles.bg
                        )}
                    >
                        <span className={styles.icon}>{icon}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Formata um número como moeda brasileira
 */
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Grid de KPIs Financeiros
 * 
 * Wrapper para organizar múltiplos KPICardFinanceiro em grid responsivo
 * 
 * @example
 * ```tsx
 * <KPIFinanceiroGrid>
 *   <KPICardFinanceiro {...props1} />
 *   <KPICardFinanceiro {...props2} />
 *   <KPICardFinanceiro {...props3} />
 * </KPIFinanceiroGrid>
 * ```
 */
export function KPIFinanceiroGrid({
    children,
    columns = 4,
    className,
}: {
    children: ReactNode;
    columns?: 2 | 3 | 4 | 5 | 6;
    className?: string;
}) {
    const colsClass = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-4',
        5: 'md:grid-cols-3 lg:grid-cols-5',
        6: 'md:grid-cols-3 lg:grid-cols-6',
    }[columns];

    return (
        <div className={cn('grid grid-cols-1 gap-4', colsClass, className)}>
            {children}
        </div>
    );
}
