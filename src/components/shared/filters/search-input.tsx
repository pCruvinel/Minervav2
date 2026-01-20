/**
 * SearchInput - Input de Busca Padronizado
 * 
 * Input com ícone de busca e debounce integrado.
 * 
 * @example
 * ```tsx
 * <SearchInput
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Buscar por cliente, código..."
 * />
 * ```
 */
'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface SearchInputProps {
    /** Valor atual da busca */
    value: string;
    /** Callback quando o valor muda */
    onChange: (value: string) => void;
    /** Placeholder do input */
    placeholder?: string;
    /** Tempo de debounce em ms (0 = desabilitado) */
    debounceMs?: number;
    /** Classes adicionais */
    className?: string;
    /** Disabled state */
    disabled?: boolean;
}

export function SearchInput({
    value,
    onChange,
    placeholder = 'Buscar...',
    debounceMs = 300,
    className,
    disabled = false,
}: SearchInputProps) {
    const [internalValue, setInternalValue] = React.useState(value);
    const debounceRef = React.useRef<NodeJS.Timeout>();

    // Sync internal value when prop changes externally
    React.useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInternalValue(newValue);

        if (debounceMs > 0) {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                onChange(newValue);
            }, debounceMs);
        } else {
            onChange(newValue);
        }
    };

    const handleClear = () => {
        setInternalValue('');
        onChange('');
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
    };

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div className={cn('relative flex-1 min-w-[200px]', className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
                type="text"
                value={internalValue}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                className="pl-9 pr-8 h-9"
            />
            {internalValue && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={handleClear}
                    disabled={disabled}
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            )}
        </div>
    );
}
