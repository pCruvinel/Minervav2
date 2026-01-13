"use client";

/**
 * LeadFormEndereco - Formulário de endereço da edificação
 * 
 * Campos: CEP (com integração ViaCEP), Rua, Número, Complemento, Bairro, Cidade, Estado
 * 
 * @example
 * ```tsx
 * <LeadFormEndereco
 *   data={endereco}
 *   onChange={setEndereco}
 *   errors={errors}
 * />
 * ```
 */

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormMaskedInput, validarCEP, removeMask } from '@/components/ui/form-masked-input';
import { FormInput } from '@/components/ui/form-input';
import { Loader2 } from 'lucide-react';
import { logger } from '@/lib/utils/logger';
import type { LeadEndereco } from './types';

interface LeadFormEnderecoProps {
    /** Dados do formulário */
    data: LeadEndereco;

    /** Callback para atualizar dados */
    onChange: (data: LeadEndereco) => void;

    /** Erros de validação por campo */
    errors?: Record<string, string>;

    /** Callback quando um campo perde foco */
    onBlur?: (field: string) => void;

    /** Se está em modo somente leitura */
    readOnly?: boolean;
}

// Estados brasileiros
const ESTADOS_BR = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function LeadFormEndereco({
    data,
    onChange,
    errors = {},
    onBlur,
    readOnly = false,
}: LeadFormEnderecoProps) {
    const [buscandoCep, setBuscandoCep] = useState(false);

    const handleChange = (field: keyof LeadEndereco, value: string) => {
        onChange({ ...data, [field]: value });
    };

    // Buscar endereço via ViaCEP quando CEP estiver completo
    const buscarCep = async (cep: string) => {
        const cepLimpo = removeMask(cep);

        if (cepLimpo.length !== 8) return;

        setBuscandoCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const viaCepData = await response.json();

            if (viaCepData.erro) {
                logger.warn('⚠️ CEP não encontrado:', cepLimpo);
                return;
            }

            logger.log('✅ CEP encontrado:', viaCepData);

            // Preencher campos com dados do ViaCEP
            onChange({
                ...data,
                rua: viaCepData.logradouro || data.rua,
                bairro: viaCepData.bairro || data.bairro,
                cidade: viaCepData.localidade || data.cidade,
                estado: viaCepData.uf || data.estado,
            });
        } catch (error) {
            logger.error('❌ Erro ao buscar CEP:', error);
        } finally {
            setBuscandoCep(false);
        }
    };

    // Buscar CEP quando o valor mudar e tiver 8 dígitos
    useEffect(() => {
        const cepLimpo = removeMask(data.cep);
        if (cepLimpo.length === 8 && !buscandoCep) {
            buscarCep(data.cep);
        }
    }, [data.cep]);

    return (
        <div className="space-y-4">
            {/* CEP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cep">
                        CEP <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <FormMaskedInput
                            id="cep"
                            mask="99999-999"
                            value={data.cep}
                            onChange={(e) => handleChange('cep', e.target.value)}
                            onBlur={() => onBlur?.('cep')}
                            error={errors.cep}
                            validate={validarCEP}
                            required
                            disabled={readOnly}
                            placeholder="00000-000"
                        />
                        {buscandoCep && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>
                </div>

                {/* Estado */}
                <div className="space-y-2">
                    <Label htmlFor="estado">
                        Estado <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={data.estado}
                        onValueChange={(value) => handleChange('estado', value)}
                        disabled={readOnly || buscandoCep}
                    >
                        <SelectTrigger
                            id="estado"
                            className={errors.estado ? 'border-destructive' : ''}
                        >
                            <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                            {ESTADOS_BR.map((uf) => (
                                <SelectItem key={uf} value={uf}>
                                    {uf}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.estado && (
                        <p className="text-sm text-destructive">{errors.estado}</p>
                    )}
                </div>

                {/* Cidade */}
                <FormInput
                    id="cidade"
                    label="Cidade"
                    value={data.cidade}
                    onChange={(e) => handleChange('cidade', e.target.value)}
                    onBlur={() => onBlur?.('cidade')}
                    error={errors.cidade}
                    required
                    disabled={readOnly || buscandoCep}
                    placeholder="Ex: São Paulo"
                />
            </div>

            {/* Rua + Número */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                    <FormInput
                        id="rua"
                        label="Rua / Logradouro"
                        value={data.rua}
                        onChange={(e) => handleChange('rua', e.target.value)}
                        onBlur={() => onBlur?.('rua')}
                        error={errors.rua}
                        required
                        disabled={readOnly || buscandoCep}
                        placeholder="Ex: Av. Paulista"
                    />
                </div>

                <FormInput
                    id="numero"
                    label="Número"
                    value={data.numero}
                    onChange={(e) => handleChange('numero', e.target.value)}
                    onBlur={() => onBlur?.('numero')}
                    error={errors.numero}
                    required
                    disabled={readOnly}
                    placeholder="Ex: 1000"
                />
            </div>

            {/* Bairro + Complemento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    id="bairro"
                    label="Bairro"
                    value={data.bairro}
                    onChange={(e) => handleChange('bairro', e.target.value)}
                    onBlur={() => onBlur?.('bairro')}
                    error={errors.bairro}
                    required
                    disabled={readOnly || buscandoCep}
                    placeholder="Ex: Bela Vista"
                />

                <FormInput
                    id="complemento"
                    label="Complemento"
                    value={data.complemento}
                    onChange={(e) => handleChange('complemento', e.target.value)}
                    disabled={readOnly}
                    placeholder="Ex: Bloco A, Sala 101"
                />
            </div>
        </div>
    );
}
