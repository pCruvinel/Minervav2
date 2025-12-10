/**
 * Step Follow-up 1 específico para OS-05 (Assessoria Anual)
 * 
 * Campos:
 * 1. Idade da Edificação (Select - manter estrutura existente)
 * 2. Motivo do Contato (Textarea)
 * 3. Tempo do Ocorrido (Textarea)
 * 4. Histórico de Ações (Textarea)
 * 5. Previsão Orçamentária (Textarea)
 * 6. Agendamento de Proposta (Textarea)
 * 7. Anexos (Upload - manter estrutura existente)
 */

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { FormTextarea } from '@/components/ui/form-textarea';
import { FormSelect } from '@/components/ui/form-select';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ArquivoComComentario {
    id: string;
    name: string;
    url: string;
    path: string;
    size: number;
    type: string;
    uploadedAt: string;
    comentario: string;
}

export interface StepFollowup1OS5Data {
    // Tipo flexível para compatibilidade com FileUploadUnificado
    anexos?: Array<Record<string, unknown>>;
    idadeEdificacao?: string;
    motivo_contato?: string;
    historico_tempo?: string;
    acoes_realizadas?: string;
    previsao_orcamentaria?: string;
    agendamento_proposta?: string;
}

interface StepFollowup1OS5Props {
    data: StepFollowup1OS5Data;
    onDataChange: (data: StepFollowup1OS5Data) => void;
    readOnly?: boolean;
    osId?: string;
}

export interface StepFollowup1OS5Handle {
    validate: () => boolean;
    isFormValid: () => boolean;
}

export const StepFollowup1OS5 = forwardRef<StepFollowup1OS5Handle, StepFollowup1OS5Props>(
    function StepFollowup1OS5({ data, onDataChange, readOnly = false, osId }, ref) {

        // Estado para controlar campos tocados
        const [touched, setTouched] = useState<Record<string, boolean>>({});

        // Garantir valores padrão
        const safeData: StepFollowup1OS5Data = {
            anexos: data.anexos || [],
            idadeEdificacao: data.idadeEdificacao || '',
            motivo_contato: data.motivo_contato || '',
            historico_tempo: data.historico_tempo || '',
            acoes_realizadas: data.acoes_realizadas || '',
            previsao_orcamentaria: data.previsao_orcamentaria || '',
            agendamento_proposta: data.agendamento_proposta || '',
        };

        // Marcar campo como tocado
        const markTouched = (field: string) => {
            setTouched(prev => ({ ...prev, [field]: true }));
        };

        // Validação: apenas idadeEdificacao é obrigatório
        const isValid = (): boolean => {
            return !!safeData.idadeEdificacao && safeData.idadeEdificacao.length > 0;
        };

        // Expor métodos via ref
        useImperativeHandle(ref, () => ({
            validate: () => {
                // Marcar todos como tocados
                setTouched({
                    idadeEdificacao: true,
                    motivo_contato: true,
                    historico_tempo: true,
                    acoes_realizadas: true,
                    previsao_orcamentaria: true,
                    agendamento_proposta: true,
                });

                const valid = isValid();
                console.log('[StepFollowup1OS5] Validação:', { valid, idadeEdificacao: safeData.idadeEdificacao });

                if (!valid) {
                    const element = document.getElementById('idadeEdificacao');
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.focus();
                    }
                }

                return valid;
            },
            isFormValid: () => isValid(),
        }), [safeData.idadeEdificacao]);

        // Handler genérico para atualizar campos
        const handleFieldChange = (field: keyof StepFollowup1OS5Data, value: string) => {
            if (!readOnly) {
                onDataChange({ ...safeData, [field]: value });
            }
        };

        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center text-sm font-bold text-primary">1</span>
                            Entrevista Inicial - Assessoria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {/* 1. Idade da Edificação - MANTER ESTRUTURA EXISTENTE */}
                        <FormSelect
                            id="idadeEdificacao"
                            label="Qual idade da edificação?"
                            required
                            value={safeData.idadeEdificacao}
                            onValueChange={(value) => {
                                handleFieldChange('idadeEdificacao', value);
                                markTouched('idadeEdificacao');
                            }}
                            error={touched.idadeEdificacao && !safeData.idadeEdificacao ? 'Campo obrigatório' : undefined}
                            success={touched.idadeEdificacao && !!safeData.idadeEdificacao}
                            helperText="Selecione a idade aproximada da edificação"
                            placeholder="Selecione"
                            disabled={readOnly}
                            options={[
                                { value: "Ainda não foi entregue", label: "Ainda não foi entregue" },
                                { value: "0 a 3 anos", label: "0 a 3 anos" },
                                { value: "3 a 5 anos", label: "3 a 5 anos" },
                                { value: "5 a 10 anos", label: "5 a 10 anos" },
                                { value: "10 a 20 anos", label: "10 a 20 anos" },
                                { value: "Acima de 20 anos", label: "Acima de 20 anos" },
                            ]}
                        />

                        <Separator />

                        {/* 2. Motivo do Contato */}
                        <FormTextarea
                            id="motivo_contato"
                            label="Qual motivo o fez nos procurar? Quais problemas existentes?"
                            rows={4}
                            maxLength={500}
                            showCharCount
                            value={safeData.motivo_contato}
                            onChange={(e) => handleFieldChange('motivo_contato', e.target.value)}
                            onBlur={() => markTouched('motivo_contato')}
                            helperText="Descreva os motivos e problemas existentes"
                            placeholder="Descreva os problemas e motivações..."
                            disabled={readOnly}
                        />

                        {/* 3. Tempo do Ocorrido */}
                        <FormTextarea
                            id="historico_tempo"
                            label="Quando aconteceu? Há quanto tempo vem acontecendo?"
                            rows={3}
                            maxLength={300}
                            showCharCount
                            value={safeData.historico_tempo}
                            onChange={(e) => handleFieldChange('historico_tempo', e.target.value)}
                            onBlur={() => markTouched('historico_tempo')}
                            helperText="Informe o histórico temporal do problema"
                            placeholder="Descreva quando começou e há quanto tempo ocorre..."
                            disabled={readOnly}
                        />

                        {/* 4. Histórico de Ações */}
                        <FormTextarea
                            id="acoes_realizadas"
                            label="O que já foi feito a respeito disso?"
                            rows={3}
                            maxLength={300}
                            showCharCount
                            value={safeData.acoes_realizadas}
                            onChange={(e) => handleFieldChange('acoes_realizadas', e.target.value)}
                            onBlur={() => markTouched('acoes_realizadas')}
                            helperText="Descreva as ações já realizadas (opcional)"
                            placeholder="Descreva as ações já tomadas..."
                            disabled={readOnly}
                        />

                        {/* 5. Previsão Orçamentária */}
                        <FormTextarea
                            id="previsao_orcamentaria"
                            label="Existe previsão orçamentária para a nossa contratação ou você precisa de parâmetro para taxa extra?"
                            rows={3}
                            maxLength={300}
                            showCharCount
                            value={safeData.previsao_orcamentaria}
                            onChange={(e) => handleFieldChange('previsao_orcamentaria', e.target.value)}
                            onBlur={() => markTouched('previsao_orcamentaria')}
                            helperText="Informe sobre orçamento disponível ou necessidade de parâmetros"
                            placeholder="Responda sobre a previsão orçamentária..."
                            disabled={readOnly}
                        />

                        {/* 6. Agendamento de Proposta */}
                        <FormTextarea
                            id="agendamento_proposta"
                            label="Nossas propostas são apresentadas, nós não enviamos orçamento. Você concorda e deseja que eu faça o orçamento? Se sim, qual dia e horário sugeridos para apresentação da proposta comercial? Podemos apresentar em assembleia?"
                            rows={4}
                            maxLength={500}
                            showCharCount
                            value={safeData.agendamento_proposta}
                            onChange={(e) => handleFieldChange('agendamento_proposta', e.target.value)}
                            onBlur={() => markTouched('agendamento_proposta')}
                            helperText="Informe disponibilidade para apresentação da proposta"
                            placeholder="Responda sobre o agendamento e disponibilidade..."
                            disabled={readOnly}
                        />

                        <Separator />

                        {/* 7. Anexos - MANTER ESTRUTURA EXISTENTE */}
                        <FileUploadUnificado
                            label="Anexar Arquivos"
                            files={(data.anexos || []) as unknown as ArquivoComComentario[]}
                            onFilesChange={(files) => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const filesForSchema = files.map((file: any) => ({
                                    id: file.id,
                                    url: file.url,
                                    nome: file.name || file.nome,
                                    tamanho: file.size || file.tamanho,
                                    comentario: file.comentario || file.comment
                                }));
                                onDataChange({ ...safeData, anexos: filesForSchema });
                            }}
                            disabled={readOnly}
                            osId={osId}
                        />
                    </CardContent>
                </Card>
            </div>
        );
    }
);

StepFollowup1OS5.displayName = 'StepFollowup1OS5';
