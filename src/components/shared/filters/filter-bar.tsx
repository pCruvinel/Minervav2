/**
 * FilterBar - Wrapper de Barra de Filtros
 * 
 * Container padronizado para barras de filtro.
 * 
 * @example
 * ```tsx
 * <FilterBar>
 *   <SearchInput value={search} onChange={setSearch} />
 *   <FilterSelect value={status} onChange={setStatus} options={statusOptions} />
 *   <DateRangePicker startDate={start} endDate={end} onChange={setRange} />
 * </FilterBar>
 * ```
 */
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface FilterBarProps {
    /** Componentes de filtro */
    children: React.ReactNode;
    /** Classes adicionais */
    className?: string;
    /** Versão compacta sem Card (inline) */
    compact?: boolean;
    /** Callback para limpar todos os filtros */
    onClear?: () => void;
    /** Mostrar botão de limpar */
    showClearButton?: boolean;
}

export function FilterBar({
    children,
    className,
    compact = false,
    onClear,
    showClearButton = false,
}: FilterBarProps) {
    const content = (
        <div className={cn('flex flex-wrap items-center gap-3', className)}>
            {children}
            {showClearButton && onClear && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-muted-foreground"
                    onClick={onClear}
                >
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                </Button>
            )}
        </div>
    );

    if (compact) {
        return content;
    }

    return (
        <Card className="shadow-sm">
            <CardContent className="p-4">
                {content}
            </CardContent>
        </Card>
    );
}
