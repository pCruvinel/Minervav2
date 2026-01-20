/**
 * CategoriaFinanceiraSelect
 * 
 * Componente de seleção de categorias financeiras agrupadas por plano de contas.
 * Usado para classificar lançamentos em contas_pagar e contas_receber.
 * 
 * @example
 * ```tsx
 * <CategoriaFinanceiraSelect
 *   value={categoriaId}
 *   onChange={(id, categoria) => setCategoriaId(id)}
 *   tipo="pagar"
 *   required
 * />
 * ```
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Tag, AlertCircle } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface CategoriaFinanceira {
    id: string;
    codigo: string;
    nome: string;
    tipo: 'pagar' | 'receber' | 'ambos';
    plano_conta_id: string;
    plano_contas?: {
        nome: string;
        natureza: string;
        desprezar_lucro: boolean;
        usar_custo_dia_flutuante: boolean;
        exige_nf: boolean;
        exige_cc: boolean;
    };
}

export interface CategoriaFinanceiraSelectProps {
    value?: string;
    onChange: (categoriaId: string, categoria?: CategoriaFinanceira) => void;
    tipo?: 'pagar' | 'receber' | 'ambos';
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    showFlags?: boolean; // Mostrar indicadores de regras (NF, CC)
}

// ============================================================
// HOOK
// ============================================================

export function useCategoriasFinanceiras(tipo: 'pagar' | 'receber' | 'ambos' = 'ambos') {
    return useQuery({
        queryKey: ['categorias-financeiras', tipo],
        queryFn: async (): Promise<CategoriaFinanceira[]> => {
            let query = supabase
                .from('categorias_financeiras')
                .select(`
          id, codigo, nome, tipo, plano_conta_id,
          plano_contas!inner(
            nome, natureza, desprezar_lucro, 
            usar_custo_dia_flutuante, exige_nf, exige_cc
          )
        `)
                .eq('ativo', true);

            if (tipo !== 'ambos') {
                query = query.or(`tipo.eq.${tipo},tipo.eq.ambos`);
            }

            const { data, error } = await query.order('codigo');

            if (error) throw error;
            return (data ?? []) as CategoriaFinanceira[];
        },
    });
}

// ============================================================
// COMPONENT
// ============================================================

export function CategoriaFinanceiraSelect({
    value,
    onChange,
    tipo = 'ambos',
    required,
    disabled,
    placeholder = 'Selecione a categoria',
    className,
    showFlags = false,
}: CategoriaFinanceiraSelectProps) {
    const { data: categorias, isLoading, error } = useCategoriasFinanceiras(tipo);

    // Agrupar por plano_contas.nome (conta pai)
    const grouped = useMemo(() => {
        if (!categorias) return {};

        const result: Record<string, CategoriaFinanceira[]> = {};

        for (const cat of categorias) {
            const grupo = cat.plano_contas?.nome || 'Outros';
            if (!result[grupo]) {
                result[grupo] = [];
            }
            result[grupo].push(cat);
        }

        return result;
    }, [categorias]);

    // Encontrar categoria selecionada para exibir flags
    const selectedCategoria = useMemo(() => {
        return categorias?.find(c => c.id === value);
    }, [categorias, value]);

    if (error) {
        return (
            <div className="flex items-center gap-2 text-sm text-destructive p-2 border border-destructive/30 rounded-md bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <span>Erro ao carregar categorias</span>
            </div>
        );
    }

    return (
        <div className={className}>
            <Select
                value={value}
                onValueChange={(v) => onChange(v, categorias?.find(c => c.id === v))}
                disabled={disabled || isLoading}
                required={required}
            >
                <SelectTrigger>
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-muted-foreground">Carregando...</span>
                        </div>
                    ) : (
                        <>
                            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder={placeholder} />
                        </>
                    )}
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                    {Object.entries(grouped).map(([grupo, items]) => (
                        <SelectGroup key={grupo}>
                            <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                {grupo}
                            </SelectLabel>
                            {items.map(cat => (
                                <SelectItem key={cat.id} value={cat.id} className="pl-6">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-muted-foreground">{cat.codigo}</span>
                                        <span>{cat.nome}</span>
                                        {showFlags && cat.plano_contas?.exige_nf && (
                                            <span className="text-[10px] px-1 py-0.5 rounded bg-warning/20 text-warning-foreground">NF</span>
                                        )}
                                        {showFlags && cat.plano_contas?.exige_cc && (
                                            <span className="text-[10px] px-1 py-0.5 rounded bg-primary/20 text-primary">CC</span>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    ))}
                </SelectContent>
            </Select>

            {/* Mostrar flags da categoria selecionada */}
            {showFlags && selectedCategoria?.plano_contas && (
                <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCategoria.plano_contas.exige_nf && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/20 text-warning-foreground">
                            Exige NF
                        </span>
                    )}
                    {selectedCategoria.plano_contas.exige_cc && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                            Exige CC
                        </span>
                    )}
                    {selectedCategoria.plano_contas.desprezar_lucro && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            Não contabiliza lucro
                        </span>
                    )}
                    {selectedCategoria.plano_contas.usar_custo_dia_flutuante && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-info/20 text-info">
                            Custo flutuante
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Variante compacta para uso em tabelas/modais
 */
export function CategoriaFinanceiraSelectCompact({
    value,
    onChange,
    tipo = 'ambos',
    disabled,
}: Pick<CategoriaFinanceiraSelectProps, 'value' | 'onChange' | 'tipo' | 'disabled'>) {
    const { data: categorias, isLoading } = useCategoriasFinanceiras(tipo);

    return (
        <Select
            value={value}
            onValueChange={(v) => onChange(v, categorias?.find(c => c.id === v))}
            disabled={disabled || isLoading}
        >
            <SelectTrigger className="h-8 text-xs">
                {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <SelectValue placeholder="Categoria" />
                )}
            </SelectTrigger>
            <SelectContent>
                {categorias?.map(cat => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs">
                        {cat.codigo} - {cat.nome}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
