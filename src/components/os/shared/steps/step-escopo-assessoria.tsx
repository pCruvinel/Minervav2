/**
 * Step de Escopo para Assessoria (OS 5-6)
 *
 * Componente específico para capturar dados de escopo de assessoria:
 * - Objetivo da contratação (dinâmico)
 * - Especificações Técnicas (tabela ITEM | DESCRIÇÃO)
 * - Metodologia (editável, com texto padrão)
 * - Prazo:
 *   - OS-06 (Pontual): Dias úteis (5 campos)
 *   - OS-05 (Anual): Horário de funcionamento + suporte emergencial
 * - Garantia (editável, com texto padrão)
 */

import { forwardRef, useImperativeHandle, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, AlertCircle, RotateCcw, Clock } from 'lucide-react';
import { FormTextarea } from '@/components/ui/form-textarea';

// ============================================================================
// INTERFACES
// ============================================================================

export interface EspecificacaoTecnica {
    descricao: string;
}

// Prazo para OS-06 (Pontual) - em dias úteis
export interface DadosPrazoPontual {
    planejamentoInicial: string;
    logisticaTransporte: string;
    levantamentoCampo: string;
    composicaoLaudo: string;
    apresentacaoCliente: string;
}

// Prazo para OS-05 (Anual) - horário de funcionamento
export interface DadosPrazoAnual {
    horarioInicio: string;        // Ex: "08:00"
    horarioFim: string;           // Ex: "18:00"
    diasSemana: string;           // Ex: "Segunda a sexta"
    suporteEmergencial: string;   // Ex: "Suporte técnico emergencial - atuação máxima de 2h"
}

// Tipo union para prazo (compatível com ambos)
export type DadosPrazoAssessoria = DadosPrazoPontual & Partial<DadosPrazoAnual>;

export interface StepEscopoAssessoriaData {
    objetivo: string;
    especificacoesTecnicas: EspecificacaoTecnica[];
    metodologia: string;
    prazo: DadosPrazoAssessoria;
    garantia: string;
}

interface StepEscopoAssessoriaProps {
    data: Partial<StepEscopoAssessoriaData>;
    onDataChange: (data: StepEscopoAssessoriaData) => void;
    readOnly?: boolean;
    /** Tipo de OS: 'OS-05' (anual) ou 'OS-06' (pontual) */
    tipoOS?: 'OS-05' | 'OS-06';
}

export interface StepEscopoAssessoriaHandle {
    validate: () => boolean;
    isFormValid: () => boolean;
}

// ============================================================================
// TEXTOS PADRÃO (podem ser editados pelo usuário)
// ============================================================================

export const METODOLOGIA_PADRAO = `• Acompanhamento semanal in loco
• Relatório mensal de acompanhamento de plano de manutenção
• Mais de 35 equipamentos de diagnóstico`;

export const GARANTIA_PADRAO = `A qualidade do serviço prestado é garantida integralmente na responsabilidade técnica de empresa habilitada para exercício da função, com corpo técnico formado por engenheiros especialistas na área, devidamente registrados no órgão da classe CREA-MA.`;

// ============================================================================
// COMPONENTE
// ============================================================================

export const StepEscopoAssessoria = forwardRef<StepEscopoAssessoriaHandle, StepEscopoAssessoriaProps>(
    function StepEscopoAssessoria({ data, onDataChange, readOnly = false, tipoOS = 'OS-06' }, ref) {
        // Estado local para erros de validação
        const [errors, setErrors] = useState<Record<string, string>>({});
        const [touched, setTouched] = useState<Record<string, boolean>>({});

        // Verificar se é OS Anual (OS-05) ou Pontual (OS-06)
        const isAnual = tipoOS === 'OS-05';

        // Garantir valores padrão baseado no tipo de OS
        const safeData: StepEscopoAssessoriaData = {
            objetivo: data.objetivo || '',
            especificacoesTecnicas: data.especificacoesTecnicas || [],
            metodologia: data.metodologia || METODOLOGIA_PADRAO,
            prazo: {
                // Campos para OS-06 (Pontual)
                planejamentoInicial: data.prazo?.planejamentoInicial || '',
                logisticaTransporte: data.prazo?.logisticaTransporte || '',
                levantamentoCampo: data.prazo?.levantamentoCampo || '',
                composicaoLaudo: data.prazo?.composicaoLaudo || '',
                apresentacaoCliente: data.prazo?.apresentacaoCliente || '',
                // Campos para OS-05 (Anual)
                horarioInicio: data.prazo?.horarioInicio || '08:00',
                horarioFim: data.prazo?.horarioFim || '18:00',
                diasSemana: data.prazo?.diasSemana || 'Segunda a sexta',
                suporteEmergencial: data.prazo?.suporteEmergencial || 'Suporte técnico emergencial - atuação máxima de 2h',
            },
            garantia: data.garantia || GARANTIA_PADRAO,
        };

        // Validação
        const validateData = (): boolean => {
            const newErrors: Record<string, string> = {};

            // Objetivo é obrigatório (mínimo 10 caracteres)
            if (!safeData.objetivo || safeData.objetivo.trim().length < 10) {
                newErrors.objetivo = 'Objetivo deve ter pelo menos 10 caracteres';
            }

            // Pelo menos uma especificação técnica
            if (safeData.especificacoesTecnicas.length === 0) {
                newErrors.especificacoes = 'Adicione pelo menos uma especificação técnica';
            } else {
                // Verificar se alguma está vazia
                const hasEmpty = safeData.especificacoesTecnicas.some(e => !e.descricao.trim());
                if (hasEmpty) {
                    newErrors.especificacoes = 'Preencha todas as especificações técnicas';
                }
            }

            // Prazo - pelo menos um campo preenchido
            const prazoPreenchido = Object.values(safeData.prazo).some(v => v && parseInt(v) > 0);
            if (!prazoPreenchido) {
                newErrors.prazo = 'Preencha pelo menos um campo de prazo';
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        // Expor métodos via ref
        useImperativeHandle(ref, () => ({
            validate: () => {
                setTouched({
                    objetivo: true,
                    especificacoes: true,
                    prazo: true,
                });
                return validateData();
            },
            isFormValid: () => {
                return validateData();
            },
        }), [safeData]);

        // Handlers de especificações técnicas
        const handleAdicionarEspecificacao = () => {
            const novasEspecificacoes = [...safeData.especificacoesTecnicas, { descricao: '' }];
            onDataChange({ ...safeData, especificacoesTecnicas: novasEspecificacoes });
        };

        const handleRemoverEspecificacao = (index: number) => {
            const novasEspecificacoes = safeData.especificacoesTecnicas.filter((_, i) => i !== index);
            onDataChange({ ...safeData, especificacoesTecnicas: novasEspecificacoes });
        };

        const handleAtualizarEspecificacao = (index: number, descricao: string) => {
            const novasEspecificacoes = [...safeData.especificacoesTecnicas];
            novasEspecificacoes[index] = { descricao };
            onDataChange({ ...safeData, especificacoesTecnicas: novasEspecificacoes });
        };

        // Handler de prazo
        const handlePrazoChange = (field: keyof DadosPrazoAssessoria, value: string) => {
            onDataChange({
                ...safeData,
                prazo: { ...safeData.prazo, [field]: value },
            });
        };

        // Calcular prazo total
        const calcularPrazoTotal = (): number => {
            return Object.values(safeData.prazo).reduce((total, valor) => {
                return total + (parseInt(valor) || 0);
            }, 0);
        };

        // Restaurar texto padrão
        const handleRestaurarMetodologia = () => {
            onDataChange({ ...safeData, metodologia: METODOLOGIA_PADRAO });
        };

        const handleRestaurarGarantia = () => {
            onDataChange({ ...safeData, garantia: GARANTIA_PADRAO });
        };

        return (
            <div className="space-y-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Preencha o escopo técnico da proposta de assessoria. Os campos de Metodologia e Garantia possuem textos padrão que podem ser editados se necessário.
                    </AlertDescription>
                </Alert>

                {/* 1. OBJETIVO */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center text-sm font-bold text-primary">1</span>
                            Objetivo da Contratação
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormTextarea
                            id="objetivo"
                            required
                            rows={4}
                            maxLength={1000}
                            showCharCount
                            value={safeData.objetivo}
                            onChange={(e) => {
                                if (!readOnly) {
                                    onDataChange({ ...safeData, objetivo: e.target.value });
                                }
                            }}
                            onBlur={() => setTouched(prev => ({ ...prev, objetivo: true }))}
                            error={touched.objetivo ? errors.objetivo : undefined}
                            success={touched.objetivo && !errors.objetivo && safeData.objetivo.length >= 10}
                            helperText="Descreva o objetivo principal da contratação do serviço"
                            placeholder="Ex: Consultoria, inspeção e vistoria técnica especializada disponível; Aumentar confiabilidade e diminuir indisponibilidade de equipamentos..."
                            disabled={readOnly}
                        />
                    </CardContent>
                </Card>

                {/* 2. ESPECIFICAÇÕES TÉCNICAS */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <span className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center text-sm font-bold text-primary">2</span>
                                Especificações Técnicas
                            </CardTitle>
                            <PrimaryButton
                                variant="secondary"
                                size="sm"
                                onClick={handleAdicionarEspecificacao}
                                disabled={readOnly}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Item
                            </PrimaryButton>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {safeData.especificacoesTecnicas.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground text-sm">
                                    Nenhuma especificação adicionada.
                                </p>
                                <p className="text-muted-foreground text-xs mt-1">
                                    Clique em "Adicionar Item" para começar.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Cabeçalho da tabela */}
                                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
                                    <div className="col-span-1">ITEM</div>
                                    <div className="col-span-10">DESCRIÇÃO</div>
                                    <div className="col-span-1"></div>
                                </div>

                                {/* Linhas da tabela */}
                                {safeData.especificacoesTecnicas.map((especificacao, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-1">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="col-span-10">
                                            <Input
                                                value={especificacao.descricao}
                                                onChange={(e) => !readOnly && handleAtualizarEspecificacao(index, e.target.value)}
                                                placeholder="Descrição da especificação técnica..."
                                                disabled={readOnly}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoverEspecificacao(index)}
                                                disabled={readOnly}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {touched.especificacoes && errors.especificacoes && (
                            <p className="text-xs text-destructive mt-2">❌ {errors.especificacoes}</p>
                        )}
                    </CardContent>
                </Card>

                {/* METODOLOGIA (Editável com texto padrão) */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-sm font-bold text-blue-600">M</span>
                                Metodologia
                            </CardTitle>
                            {safeData.metodologia !== METODOLOGIA_PADRAO && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRestaurarMetodologia}
                                    disabled={readOnly}
                                    className="text-muted-foreground hover:text-primary"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Restaurar Padrão
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={safeData.metodologia}
                            onChange={(e) => {
                                if (!readOnly) {
                                    onDataChange({ ...safeData, metodologia: e.target.value });
                                }
                            }}
                            rows={5}
                            placeholder="Descreva a metodologia de trabalho..."
                            disabled={readOnly}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Texto padrão pré-preenchido. Edite conforme necessário.
                        </p>
                    </CardContent>
                </Card>

                {/* 3. PRAZO - Renderização condicional por tipo de OS */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center text-sm font-bold text-primary">3</span>
                            {isAnual ? 'Prazo (Horário de Funcionamento)' : 'Prazo (Dias Úteis)'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isAnual ? (
                            /* ============== CAMPOS PARA OS-05 (ANUAL) - Horário de Funcionamento ============== */
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="diasSemana" className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Dias da Semana
                                        </Label>
                                        <Input
                                            id="diasSemana"
                                            type="text"
                                            value={safeData.prazo.diasSemana || ''}
                                            onChange={(e) => handlePrazoChange('diasSemana', e.target.value)}
                                            placeholder="Ex: Segunda a sexta"
                                            disabled={readOnly}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="horarioInicio">Horário Início</Label>
                                            <Input
                                                id="horarioInicio"
                                                type="time"
                                                value={safeData.prazo.horarioInicio || '08:00'}
                                                onChange={(e) => handlePrazoChange('horarioInicio', e.target.value)}
                                                disabled={readOnly}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="horarioFim">Horário Fim</Label>
                                            <Input
                                                id="horarioFim"
                                                type="time"
                                                value={safeData.prazo.horarioFim || '18:00'}
                                                onChange={(e) => handlePrazoChange('horarioFim', e.target.value)}
                                                disabled={readOnly}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="suporteEmergencial">Suporte Emergencial</Label>
                                    <Input
                                        id="suporteEmergencial"
                                        type="text"
                                        value={safeData.prazo.suporteEmergencial || ''}
                                        onChange={(e) => handlePrazoChange('suporteEmergencial', e.target.value)}
                                        placeholder="Ex: Suporte técnico emergencial - atuação máxima de 2h"
                                        disabled={readOnly}
                                    />
                                </div>

                                {/* Resumo do Horário */}
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Horário de Atendimento:</span>
                                            <span className="text-lg font-bold text-primary">
                                                {safeData.prazo.diasSemana} de {safeData.prazo.horarioInicio} às {safeData.prazo.horarioFim}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            /* ============== CAMPOS PARA OS-06 (PONTUAL) - Dias Úteis ============== */
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="planejamentoInicial">Planejamento inicial</Label>
                                        <Input
                                            id="planejamentoInicial"
                                            type="number"
                                            min="0"
                                            value={safeData.prazo.planejamentoInicial}
                                            onChange={(e) => handlePrazoChange('planejamentoInicial', e.target.value)}
                                            placeholder="0"
                                            disabled={readOnly}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="logisticaTransporte">Logística e transporte de materiais</Label>
                                        <Input
                                            id="logisticaTransporte"
                                            type="number"
                                            min="0"
                                            value={safeData.prazo.logisticaTransporte}
                                            onChange={(e) => handlePrazoChange('logisticaTransporte', e.target.value)}
                                            placeholder="0"
                                            disabled={readOnly}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="levantamentoCampo">Levantamento em campo</Label>
                                        <Input
                                            id="levantamentoCampo"
                                            type="number"
                                            min="0"
                                            value={safeData.prazo.levantamentoCampo}
                                            onChange={(e) => handlePrazoChange('levantamentoCampo', e.target.value)}
                                            placeholder="0"
                                            disabled={readOnly}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="composicaoLaudo">Composição de laudo técnico</Label>
                                        <Input
                                            id="composicaoLaudo"
                                            type="number"
                                            min="0"
                                            value={safeData.prazo.composicaoLaudo}
                                            onChange={(e) => handlePrazoChange('composicaoLaudo', e.target.value)}
                                            placeholder="0"
                                            disabled={readOnly}
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="apresentacaoCliente">Apresentação de laudo técnico para cliente</Label>
                                        <Input
                                            id="apresentacaoCliente"
                                            type="number"
                                            min="0"
                                            value={safeData.prazo.apresentacaoCliente}
                                            onChange={(e) => handlePrazoChange('apresentacaoCliente', e.target.value)}
                                            placeholder="0"
                                            disabled={readOnly}
                                        />
                                    </div>
                                </div>

                                {/* Resumo do Prazo Total */}
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Prazo Total:</span>
                                            <span className="text-lg font-bold text-primary">
                                                {calcularPrazoTotal()} dias úteis
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {touched.prazo && errors.prazo && (
                            <p className="text-xs text-destructive">❌ {errors.prazo}</p>
                        )}
                    </CardContent>
                </Card>

                {/* 4. GARANTIA (Editável com texto padrão) */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <span className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center text-sm font-bold text-amber-600">4</span>
                                Garantia
                            </CardTitle>
                            {safeData.garantia !== GARANTIA_PADRAO && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRestaurarGarantia}
                                    disabled={readOnly}
                                    className="text-muted-foreground hover:text-primary"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Restaurar Padrão
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={safeData.garantia}
                            onChange={(e) => {
                                if (!readOnly) {
                                    onDataChange({ ...safeData, garantia: e.target.value });
                                }
                            }}
                            rows={4}
                            placeholder="Descreva as garantias oferecidas..."
                            disabled={readOnly}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Texto padrão pré-preenchido. Edite conforme necessário.
                        </p>
                    </CardContent>
                </Card>

                <Separator />

                {/* Resumo */}
                <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-primary">
                                    {safeData.objetivo.length > 0 ? '✓' : '—'}
                                </p>
                                <p className="text-xs text-muted-foreground">Objetivo</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary">
                                    {safeData.especificacoesTecnicas.length}
                                </p>
                                <p className="text-xs text-muted-foreground">Especificações</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary">
                                    {calcularPrazoTotal()}
                                </p>
                                <p className="text-xs text-muted-foreground">Dias Úteis</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
);
