"use client";

/**
 * LeadFormEdificacao - Formulário de dados da edificação
 * 
 * Campos: Tipo de Edificação, Unidades, Blocos, Pavimentos, Telhado, Elevador, Piscina
 * 
 * @example
 * ```tsx
 * <LeadFormEdificacao
 *   data={edificacao}
 *   onChange={setEdificacao}
 *   errors={errors}
 * />
 * ```
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { LeadEdificacao, TipoEdificacao, TipoTelhado } from './types';

interface LeadFormEdificacaoProps {
    /** Dados do formulário */
    data: LeadEdificacao;

    /** Callback para atualizar dados */
    onChange: (data: LeadEdificacao) => void;

    /** Erros de validação por campo */
    errors?: Record<string, string>;

    /** Se está em modo somente leitura */
    readOnly?: boolean;
}

// Constantes para os selects
const TIPOS_EDIFICACAO: TipoEdificacao[] = [
    'Condomínio Comercial',
    'Condomínio Residencial - Casas',
    'Condomínio Residencial - Apartamentos',
    'Hotel',
    'Shopping',
    'Hospital',
    'Indústria',
    'Igreja',
    'Outro',
];

const TIPOS_TELHADO: TipoTelhado[] = [
    'Laje impermeabilizada',
    'Telhado cerâmico',
    'Telhado fibrocimento',
    'Telhado metálico',
    'Não se aplica',
    'Outros',
];

export function LeadFormEdificacao({
    data,
    onChange,
    errors = {},
    readOnly = false,
}: LeadFormEdificacaoProps) {
    const handleChange = (field: keyof LeadEdificacao, value: any) => {
        onChange({ ...data, [field]: value });
    };

    // Determinar campos condicionais
    const isCondominio = data.tipoEdificacao?.includes('Condomínio');
    const isApartamentos = data.tipoEdificacao === 'Condomínio Residencial - Apartamentos';

    return (
        <div className="space-y-4">
            {/* Tipo de Edificação */}
            <div className="space-y-2">
                <Label htmlFor="tipoEdificacao">
                    Tipo de Edificação <span className="text-destructive">*</span>
                </Label>
                <Select
                    value={data.tipoEdificacao}
                    onValueChange={(value) => handleChange('tipoEdificacao', value)}
                    disabled={readOnly}
                >
                    <SelectTrigger
                        id="tipoEdificacao"
                        className={errors.tipoEdificacao ? 'border-destructive' : ''}
                    >
                        <SelectValue placeholder="Selecione a categoria que melhor descreve o imóvel" />
                    </SelectTrigger>
                    <SelectContent>
                        {TIPOS_EDIFICACAO.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                                {tipo}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    Selecione a categoria que melhor descreve o imóvel.
                </p>
                {errors.tipoEdificacao && (
                    <p className="text-sm text-destructive">{errors.tipoEdificacao}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Qtd. Unidades (apenas para condomínios) */}
                {isCondominio && (
                    <div className="space-y-2">
                        <Label htmlFor="qtdUnidades">
                            Quantidade de Unidades <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="qtdUnidades"
                            type="number"
                            value={data.qtdUnidades}
                            onChange={(e) => handleChange('qtdUnidades', e.target.value)}
                            placeholder="Ex: 48"
                            disabled={readOnly}
                            className={errors.qtdUnidades ? 'border-destructive' : ''}
                        />
                        <p className="text-xs text-muted-foreground">
                            Número total de unidades independentes.
                        </p>
                        {errors.qtdUnidades && (
                            <p className="text-sm text-destructive">{errors.qtdUnidades}</p>
                        )}
                    </div>
                )}

                {/* Qtd. Blocos (apenas para apartamentos) */}
                {isApartamentos && (
                    <div className="space-y-2">
                        <Label htmlFor="qtdBlocos">
                            Quantidade de Blocos <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="qtdBlocos"
                            type="number"
                            value={data.qtdBlocos}
                            onChange={(e) => handleChange('qtdBlocos', e.target.value)}
                            placeholder="Ex: 2"
                            disabled={readOnly}
                            className={errors.qtdBlocos ? 'border-destructive' : ''}
                        />
                        <p className="text-xs text-muted-foreground">
                            Número de torres ou blocos do condomínio.
                        </p>
                        {errors.qtdBlocos && (
                            <p className="text-sm text-destructive">{errors.qtdBlocos}</p>
                        )}
                    </div>
                )}

                {/* Qtd. Pavimentos */}
                <div className="space-y-2">
                    <Label htmlFor="qtdPavimentos">Quantidade de Pavimentos</Label>
                    <Input
                        id="qtdPavimentos"
                        type="number"
                        value={data.qtdPavimentos}
                        onChange={(e) => handleChange('qtdPavimentos', e.target.value)}
                        placeholder="Ex: 8"
                        disabled={readOnly}
                    />
                </div>

                {/* Tipo de Telhado */}
                <div className="space-y-2">
                    <Label htmlFor="tipoTelhado">
                        Tipo de Telhado <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={data.tipoTelhado}
                        onValueChange={(value) => handleChange('tipoTelhado', value)}
                        disabled={readOnly}
                    >
                        <SelectTrigger
                            id="tipoTelhado"
                            className={errors.tipoTelhado ? 'border-destructive' : ''}
                        >
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {TIPOS_TELHADO.map((tipo) => (
                                <SelectItem key={tipo} value={tipo}>
                                    {tipo}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.tipoTelhado && (
                        <p className="text-sm text-destructive">{errors.tipoTelhado}</p>
                    )}
                </div>
            </div>

            {/* Switches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="possuiElevador"
                        checked={data.possuiElevador}
                        onCheckedChange={(checked) => handleChange('possuiElevador', checked)}
                        disabled={readOnly}
                    />
                    <Label htmlFor="possuiElevador" className="cursor-pointer">
                        Possui Elevador?
                    </Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="possuiPiscina"
                        checked={data.possuiPiscina}
                        onCheckedChange={(checked) => handleChange('possuiPiscina', checked)}
                        disabled={readOnly}
                    />
                    <Label htmlFor="possuiPiscina" className="cursor-pointer">
                        Possui Piscina?
                    </Label>
                </div>
            </div>
        </div>
    );
}
