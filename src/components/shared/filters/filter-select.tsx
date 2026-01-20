/**
 * FilterSelect - Select Genérico para Filtros
 * 
 * Wrapper padronizado do Select para uso em barras de filtro.
 * 
 * @example
 * ```tsx
 * <FilterSelect
 *   value={setor}
 *   onChange={setSetor}
 *   options={[
 *     { value: 'todos', label: 'Todos' },
 *     { value: 'obras', label: 'Obras' },
 *   ]}
 *   placeholder="Setor"
 *   icon={<Building className="h-4 w-4" />}
 * />
 * ```
 */
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface FilterOption<T extends string = string> {
    value: T;
    label: string;
    disabled?: boolean;
}

export interface FilterSelectProps<T extends string = string> {
    /** Valor selecionado */
    value: T;
    /** Callback quando o valor muda */
    onChange: (value: T) => void;
    /** Opções disponíveis */
    options: FilterOption<T>[];
    /** Placeholder quando nenhum valor selecionado */
    placeholder?: string;
    /** Ícone opcional no trigger */
    icon?: React.ReactNode;
    /** Classes adicionais */
    className?: string;
    /** Largura fixa (default: 180px) */
    width?: string;
    /** Disabled state */
    disabled?: boolean;
}

export function FilterSelect<T extends string = string>({
    value,
    onChange,
    options,
    placeholder = 'Selecione',
    icon,
    className,
    width = 'w-[180px]',
    disabled = false,
}: FilterSelectProps<T>) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as T)} disabled={disabled}>
            <SelectTrigger className={cn('h-9', width, className)}>
                {icon && <span className="mr-2">{icon}</span>}
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
