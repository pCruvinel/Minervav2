/**
 * Step Follow-up 1 específico para OS-06 (Assessoria Pontual / Laudo Técnico)
 * 
 * Campos:
 * 1. Idade da Edificação (Select - manter estrutura existente)
 * 2. Área da Vistoria (Select - opções de sistemas técnicos)
 * 3. Motivo do Contato (Textarea)
 * 4. Tempo do Ocorrido (Textarea)
 * 5. Histórico de Ações (Textarea)
 * 6. Previsão Orçamentária (Textarea)
 * 7. Agendamento de Proposta (Textarea)
 * 8. Anexos (Upload - manter estrutura existente)
 */

import { forwardRef, useImperativeHandle, useState } from 'react';
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

export interface StepFollowup1OS6Data {
    // Tipo flexível para compatibilidade com FileUploadUnificado
    anexos?: Array<Record<string, unknown>>;
    idadeEdificacao?: string;
    area_vistoria?: string;
    motivo_contato?: string;
    historico_tempo?: string;
    acoes_realizadas?: string;
    previsao_orcamentaria?: string;
    agendamento_proposta?: string;
}

interface StepFollowup1OS6Props {
    data: StepFollowup1OS6Data;
    onDataChange: (data: StepFollowup1OS6Data) => void;
    readOnly?: boolean;
    osId?: string;
}

export interface StepFollowup1OS6Handle {
    validate: () => boolean;
    isFormValid: () => boolean;
}

// Opções de áreas de vistoria
const AREAS_VISTORIA = [
    {
        value: "abastecimento_agua",
        label: "Abastecimento de água (tubulações, conexões, hidrômetro, reservatórios, bombas, registros e afins) – exceto SPCI"
    },
    {
        value: "esgotamento_drenagem",
        label: "Esgotamento e drenagem (tubulações, conexões, caixas coletoras, galerias, sarjetas, grelhas e afins)"
    },
    {
        value: "spda",
        label: "SPDA (captores, malhas, sinalização, cabos e afins)"
    },
    {
        value: "spci",
        label: "SPCI (Qualquer item relacionado ao sistema de proteção e combate ao incêndio)"
    },
    {
        value: "arquitetura",
        label: "Arquitetura (Fachadas, muros, área verde e afins)"
    },
    {
        value: "estrutural",
        label: "Estrutural (Fundações, lajes, vigas, pilares e afins)"
    },
    {
        value: "telefone_interfone_antena",
        label: "Telefone, interfone, antena (cabos, quadros e afins)"
    },
    {
        value: "eletrica",
        label: "Elétrica (Quadros, disjuntores, tomadas, interruptores, centrais de medição e afins)"
    },
    {
        value: "cobertura",
        label: "Cobertura (Telhado, laje, calhas, rufos, platibanda e afins)"
    },
];

export const StepFollowup1OS6 = forwardRef<StepFollowup1OS6Handle, StepFollowup1OS6Props>(
    function StepFollowup1OS6({ data, onDataChange, readOnly = false, osId }, ref) {

        // Estado para controlar campos tocados
        const [touched, setTouched] = useState<Record<string, boolean>>({});

        // Garantir valores padrão
        const safeData: StepFollowup1OS6Data = {
            anexos: data.anexos || [],
            idadeEdificacao: data.idadeEdificacao || '',
            area_vistoria: data.area_vistoria || '',
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

        // Validação: idadeEdificacao e area_vistoria são obrigatórios
        const isValid = (): boolean => {
            return !!safeData.idadeEdificacao &&
                safeData.idadeEdificacao.length > 0 &&
                !!safeData.area_vistoria &&
                safeData.area_vistoria.length > 0;
        };

        // Expor métodos via ref
        useImperativeHandle(ref, () => ({
            validate: () => {
                // Marcar todos como tocados
                setTouched({
                    idadeEdificacao: true,
                    area_vistoria: true,
                    motivo_contato: true,
                    historico_tempo: true,
                    acoes_realizadas: true,
                    previsao_orcamentaria: true,
                    agendamento_proposta: true,
                });

                const valid = isValid();
                console.log('[StepFollowup1OS6] Validação:', {
                    valid,
                    idadeEdificacao: safeData.idadeEdificacao,
                    area_vistoria: safeData.area_vistoria
                });

                if (!valid) {
                    // Scroll para o primeiro campo com erro
                    if (!safeData.idadeEdificacao) {
                        const element = document.getElementById('idadeEdificacao');
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.focus();
                        }
                    } else if (!safeData.area_vistoria) {
                        const element = document.getElementById('area_vistoria');
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.focus();
                        }
                    }
                }

                return valid;
            },
            isFormValid: () => isValid(),
        }), [safeData.idadeEdificacao, safeData.area_vistoria]);

        // Handler genérico para atualizar campos
        const handleFieldChange = (field: keyof StepFollowup1OS6Data, value: string) => {
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
                            Entrevista Inicial - Laudo Técnico
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        <FormSelect
                            id="idadeEdificacao"
                            label="Qual a idade da edificação?"
                            required
                            value={safeData.idadeEdificacao ?? ''}
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

                        <FormSelect
                            id="area_vistoria"
                            label="Qual a área a ser vistoriada?"
                            required
                            value={safeData.area_vistoria ?? ''}
                            onValueChange={(value) => {
                                handleFieldChange('area_vistoria', value);
                                markTouched('area_vistoria');
                            }}
                            error={touched.area_vistoria && !safeData.area_vistoria ? 'Campo obrigatório' : undefined}
                            success={touched.area_vistoria && !!safeData.area_vistoria}
                            helperText="Selecione a área/sistema técnico a ser vistoriado"
                            placeholder="Selecione a área"
                            disabled={readOnly}
                            options={AREAS_VISTORIA}
                        />

                        <Separator />

                        {/* 3. Motivo do Contato */}
                        <FormTextarea
                            id="motivo_contato"
                            label="Qual o motivo de nos procurar? Quais são os problemas existentes?"
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

                        {/* 4. Tempo do Ocorrido */}
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

                        {/* 5. Histórico de Ações */}
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

                        {/* 6. Previsão Orçamentária */}
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

                        {/* 7. Agendamento de Proposta */}
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

                        {/* 8. Anexos - MANTER ESTRUTURA EXISTENTE */}
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

StepFollowup1OS6.displayName = 'StepFollowup1OS6';
