"use client";

/**
 * LeadFormIdentificacao - Formulário de identificação do lead
 * 
 * Campos: Nome, CPF/CNPJ, Tipo (PF/PJ), Email, Telefone, Responsável
 * 
 * @example
 * ```tsx
 * <LeadFormIdentificacao
 *   data={identificacao}
 *   onChange={setIdentificacao}
 *   errors={errors}
 *   onBlur={handleBlur}
 * />
 * ```
 */

import { Label } from '@/components/ui/label';
// Removed unused Input import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormMaskedInput, validarCPF, validarCNPJ, validarTelefone } from '@/components/ui/form-masked-input';
import { FormInput } from '@/components/ui/form-input';
import type { LeadIdentificacao, TipoCliente, TipoEmpresa } from './types';

interface LeadFormIdentificacaoProps {
    /** Dados do formulário */
    data: LeadIdentificacao;

    /** Callback para atualizar dados */
    onChange: (data: LeadIdentificacao) => void;

    /** Erros de validação por campo */
    errors?: Record<string, string>;

    /** Callback quando um campo perde foco */
    onBlur?: (field: string) => void;

    /** Se está em modo somente leitura */
    readOnly?: boolean;
}

export function LeadFormIdentificacao({
    data,
    onChange,
    errors = {},
    onBlur,
    readOnly = false,
}: LeadFormIdentificacaoProps) {
    const isJuridica = data.tipo === 'juridica';

    const handleChange = (field: keyof LeadIdentificacao, value: any) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-4">
            {/* Tipo de Cliente */}
            <div className="space-y-2">
                <Label htmlFor="tipo">
                    Tipo de Cliente <span className="text-destructive">*</span>
                </Label>
                <Select
                    value={data.tipo}
                    onValueChange={(value: TipoCliente) => handleChange('tipo', value)}
                    disabled={readOnly}
                >
                    <SelectTrigger id="tipo" className={errors.tipo ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="fisica">Pessoa Física</SelectItem>
                        <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                </Select>
                {errors.tipo && (
                    <p className="text-sm text-destructive">{errors.tipo}</p>
                )}
            </div>

            {/* Tipo de Empresa (apenas PJ) */}
            {isJuridica && (
                <div className="space-y-2">
                    <Label htmlFor="tipoEmpresa">
                        Tipo de Empresa <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={data.tipoEmpresa || ''}
                        onValueChange={(value: TipoEmpresa) => handleChange('tipoEmpresa', value)}
                        disabled={readOnly}
                    >
                        <SelectTrigger id="tipoEmpresa" className={errors.tipoEmpresa ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Selecione o tipo de empresa" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="condominio">Condomínio</SelectItem>
                            <SelectItem value="empresa_privada">Empresa Privada</SelectItem>
                            <SelectItem value="orgao_publico">Órgão Público</SelectItem>
                            <SelectItem value="associacao">Associação</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.tipoEmpresa && (
                        <p className="text-sm text-destructive">{errors.tipoEmpresa}</p>
                    )}
                </div>
            )}

            {/* Nome / Razão Social */}
            <FormInput
                id="nome"
                label={isJuridica ? "Razão Social" : "Nome Completo"}
                value={data.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                onBlur={() => onBlur?.('nome')}
                error={errors.nome}
                required
                disabled={readOnly}
                placeholder={isJuridica ? "Ex: Condomínio Edifício Solar" : "Ex: João da Silva"}
            />

            {/* Apelido (Opcional) */}
            <FormInput
                id="apelido"
                label="Apelido / Nome Fantasia (Opcional)"
                value={data.apelido || ''}
                onChange={(e) => handleChange('apelido', e.target.value)}
                onBlur={() => onBlur?.('apelido')}
                error={errors.apelido}
                disabled={readOnly}
                placeholder={isJuridica ? "Ex: Edifício Solar" : "Ex: Apelido"}
            />

            {/* CPF ou CNPJ */}
            <FormMaskedInput
                id="cpfCnpj"
                label={isJuridica ? "CNPJ" : "CPF"}
                mask={isJuridica ? "99.999.999/9999-99" : "999.999.999-99"}
                value={data.cpfCnpj}
                onChange={(e) => handleChange('cpfCnpj', e.target.value)}
                onBlur={() => onBlur?.('cpfCnpj')}
                error={errors.cpfCnpj}
                validate={isJuridica ? validarCNPJ : validarCPF}
                required
                disabled={readOnly}
                placeholder={isJuridica ? "00.000.000/0001-00" : "000.000.000-00"}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Telefone */}
                <FormMaskedInput
                    id="telefone"
                    label="Telefone"
                    mask="(99) 99999-9999"
                    value={data.telefone}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    onBlur={() => onBlur?.('telefone')}
                    error={errors.telefone}
                    validate={validarTelefone}
                    required
                    disabled={readOnly}
                    placeholder="(00) 00000-0000"
                />

                {/* Email */}
                <FormInput
                    id="email"
                    label="Email"
                    type="email"
                    value={data.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => onBlur?.('email')}
                    error={errors.email}
                    required
                    disabled={readOnly}
                    placeholder="email@exemplo.com"
                />
            </div>

            {/* Nome do Responsável (apenas PJ) */}
            {isJuridica && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        id="nomeResponsavel"
                        label="Nome do Responsável"
                        value={data.nomeResponsavel}
                        onChange={(e) => handleChange('nomeResponsavel', e.target.value)}
                        onBlur={() => onBlur?.('nomeResponsavel')}
                        error={errors.nomeResponsavel}
                        disabled={readOnly}
                        placeholder="Ex: João da Silva"
                    />

                    <FormInput
                        id="cargoResponsavel"
                        label="Cargo do Responsável"
                        value={data.cargoResponsavel}
                        onChange={(e) => handleChange('cargoResponsavel', e.target.value)}
                        onBlur={() => onBlur?.('cargoResponsavel')}
                        error={errors.cargoResponsavel}
                        disabled={readOnly}
                        placeholder="Ex: Síndico, Administrador"
                    />
                </div>
            )}
        </div>
    );
}
