/**
 * DateRangePicker - Seletor de Período com Presets
 * 
 * Componente minimalista para seleção de intervalo de datas com:
 * - Botão compacto mostrando intervalo selecionado
 * - Popover com presets rápidos (Hoje, 7d, 30d, etc)
 * - Calendário para seleção customizada
 * 
 * @example
 * ```tsx
 * <DateRangePicker
 *   startDate={start}
 *   endDate={end}
 *   onChange={({ start, end }) => setRange({ start, end })}
 *   placeholder="Selecione o período"
 * />
 * ```
 */
'use client';

import * as React from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

// ============================================================
// TYPES
// ============================================================

export interface DateRange {
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
}

export interface DateRangePreset {
    label: string;
    getValue: () => DateRange;
}

export interface DateRangePickerProps {
    /** Data de início (YYYY-MM-DD) */
    startDate?: string;
    /** Data de fim (YYYY-MM-DD) */
    endDate?: string;
    /** Callback quando o range muda */
    onChange: (range: DateRange | null) => void;
    /** Placeholder quando nenhuma data selecionada */
    placeholder?: string;
    /** Mostrar presets (default: true) */
    showPresets?: boolean;
    /** Presets customizados (sobrescreve os padrão) */
    customPresets?: DateRangePreset[];
    /** Disabled state */
    disabled?: boolean;
    /** Classes adicionais */
    className?: string;
}

// ============================================================
// HELPERS
// ============================================================

const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseStringToDate = (str: string): Date => {
    return new Date(str + 'T00:00:00');
};

// ============================================================
// DEFAULT PRESETS
// ============================================================

const getDefaultPresets = (): DateRangePreset[] => {
    const today = new Date();

    return [
        {
            label: 'Hoje',
            getValue: () => ({
                start: formatDateToString(today),
                end: formatDateToString(today),
            }),
        },
        {
            label: 'Últimos 7 dias',
            getValue: () => ({
                start: formatDateToString(subDays(today, 6)),
                end: formatDateToString(today),
            }),
        },
        {
            label: 'Últimos 30 dias',
            getValue: () => ({
                start: formatDateToString(subDays(today, 29)),
                end: formatDateToString(today),
            }),
        },
        {
            label: 'Esta semana',
            getValue: () => ({
                start: formatDateToString(startOfWeek(today, { locale: ptBR })),
                end: formatDateToString(endOfWeek(today, { locale: ptBR })),
            }),
        },
        {
            label: 'Este mês',
            getValue: () => ({
                start: formatDateToString(startOfMonth(today)),
                end: formatDateToString(endOfMonth(today)),
            }),
        },
        {
            label: 'Mês anterior',
            getValue: () => {
                const lastMonth = subMonths(today, 1);
                return {
                    start: formatDateToString(startOfMonth(lastMonth)),
                    end: formatDateToString(endOfMonth(lastMonth)),
                };
            },
        },
    ];
};

// ============================================================
// COMPONENT
// ============================================================

export function DateRangePicker({
    startDate,
    endDate,
    onChange,
    placeholder = 'Período',
    showPresets = false,
    customPresets,
    disabled = false,
    className,
}: DateRangePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [activePreset, setActivePreset] = React.useState<string | null>(null);

    // Internal state for calendar selection
    const [tempStart, setTempStart] = React.useState<Date | undefined>(
        startDate ? parseStringToDate(startDate) : undefined
    );
    const [tempEnd, setTempEnd] = React.useState<Date | undefined>(
        endDate ? parseStringToDate(endDate) : undefined
    );

    // Sync internal state when props change
    React.useEffect(() => {
        setTempStart(startDate ? parseStringToDate(startDate) : undefined);
        setTempEnd(endDate ? parseStringToDate(endDate) : undefined);
    }, [startDate, endDate]);

    const presets = customPresets || getDefaultPresets();

    // Check which preset matches current selection
    React.useEffect(() => {
        if (!startDate || !endDate) {
            setActivePreset(null);
            return;
        }

        const matchingPreset = presets.find(preset => {
            const value = preset.getValue();
            return value.start === startDate && value.end === endDate;
        });

        setActivePreset(matchingPreset?.label || null);
    }, [startDate, endDate, presets]);

    const handlePresetClick = (preset: DateRangePreset) => {
        const value = preset.getValue();
        setTempStart(parseStringToDate(value.start));
        setTempEnd(parseStringToDate(value.end));
        onChange(value);
        setOpen(false);
    };
    const handleApply = () => {
        if (tempStart && tempEnd) {
            onChange({
                start: formatDateToString(tempStart),
                end: formatDateToString(tempEnd),
            });
        }
        setOpen(false);
    };

    const handleClear = () => {
        setTempStart(undefined);
        setTempEnd(undefined);
        onChange(null);
        setOpen(false);
    };

    // Display value
    const getDisplayValue = () => {
        if (!startDate || !endDate) return null;

        const start = parseStringToDate(startDate);
        const end = parseStringToDate(endDate);

        const formatStr = 'dd/MM';
        const startStr = format(start, formatStr, { locale: ptBR });
        const endStr = format(end, formatStr, { locale: ptBR });

        if (startStr === endStr) {
            return format(start, 'dd/MM/yyyy', { locale: ptBR });
        }

        return `${startStr} - ${endStr}`;
    };

    const displayValue = getDisplayValue();
    const hasSelection = tempStart && tempEnd;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'h-9 justify-start text-left font-normal min-w-[160px]',
                        !displayValue && 'text-muted-foreground',
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="flex-1 truncate">
                        {displayValue || placeholder}
                    </span>
                    {displayValue && (
                        <X
                            className="ml-2 h-3.5 w-3.5 opacity-50 hover:opacity-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                        />
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-auto p-0"
                align="start"
                sideOffset={4}
            >
                <div className="flex">
                    {/* Presets Sidebar */}
                    {showPresets && (
                        <div className="border-r p-2 space-y-1 min-w-[140px]">
                            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                Período
                            </p>
                            {presets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant={activePreset === preset.label ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="w-full justify-start text-sm h-8"
                                    onClick={() => handlePresetClick(preset)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Calendar */}
                    <div className="p-2">
                        <Calendar
                            mode="range"
                            selected={{
                                from: tempStart,
                                to: tempEnd,
                            }}
                            onSelect={(range) => {
                                setTempStart(range?.from);
                                setTempEnd(range?.to);
                            }}
                            numberOfMonths={1}
                            locale={ptBR}
                            initialFocus
                        />

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t pt-2 mt-2 px-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-muted-foreground"
                                onClick={handleClear}
                            >
                                Limpar
                            </Button>
                            <Button
                                size="sm"
                                className="h-8"
                                disabled={!hasSelection}
                                onClick={handleApply}
                            >
                                Aplicar
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
