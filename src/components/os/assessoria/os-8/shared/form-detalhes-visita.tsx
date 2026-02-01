/**
 * FormDetalhesVisita - Componente compartilhado para campos de detalhes da visita técnica
 * 
 * Este componente é reutilizado tanto no formulário público (/solicitacao-visita-tecnica)
 * quanto no workflow interno (step-detalhes-solicitacao.tsx).
 * 
 * AGORA COM VALIDAÇÃO ZOD + FEEDBACK VISUAL (Green/Red Rings)
 */

import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUploadUnificado, FileWithComment } from '@/components/ui/file-upload-unificado';
import {
    FinalidadeInspecao,
    FINALIDADE_OPTIONS,
    AREAS_VISTORIA,
    FINALIDADE_AREA_MAP,
    deveAutoPreencherArea,
    gerarTituloDocumento,
} from '../types/os08-types';

// Validação
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { detalhesVisitaSchema } from '@/lib/validations/os08-schema';

// Componentes Padronizados (com validação visual)
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { FormTextarea } from '@/components/ui/form-textarea';
import { FormRadioGroup } from '@/components/ui/form-radio-group';
import { FormMaskedInput } from '@/components/ui/form-masked-input';

// Tipos exportados
export interface DetalhesSolicitacaoData {
    finalidadeInspecao: FinalidadeInspecao | '';
    tipoArea: string;
    unidadesVistoriar: string;
    contatoUnidades: string;
    tipoDocumento: string;
    areaVistoriada: string;
    detalhesSolicitacao: string;
    tempoSituacao: string;
    primeiraVisita: string;
    arquivos?: FileWithComment[];
}

export const EMPTY_DETALHES_DATA: DetalhesSolicitacaoData = {
    finalidadeInspecao: '',
    tipoArea: '',
    unidadesVistoriar: '',
    contatoUnidades: '',
    tipoDocumento: '',
    areaVistoriada: '',
    detalhesSolicitacao: '',
    tempoSituacao: '',
    primeiraVisita: '',
    arquivos: [],
};

interface FormDetalhesVisitaProps {
    data: DetalhesSolicitacaoData;
    onDataChange: (data: DetalhesSolicitacaoData) => void;
    readOnly?: boolean;
    osId?: string;
    /** 'public' = formulário externo, 'internal' = step do workflow */
    variant?: 'public' | 'internal';
    /** Mostrar Cards em vez de Sections (para variant=public) */
    useCards?: boolean;
}

// Wrapper para seções
const SectionWrapper = ({ 
    title, 
    description, 
    children, 
    useCards 
}: { 
    title: string; 
    description?: string; 
    children: React.ReactNode; 
    useCards: boolean; 
}) => {
    if (useCards) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>{children}</CardContent>
            </Card>
        );
    }
    return (
        <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">{title}</h3>
            {children}
        </div>
    );
};

export interface FormDetalhesVisitaRef {
    validate: () => boolean;
}

export const FormDetalhesVisita = forwardRef<FormDetalhesVisitaRef, FormDetalhesVisitaProps>(({ 
    data, 
    onDataChange, 
    readOnly, 
    osId,
    variant = 'internal',
    useCards = false,
}, ref) => {
    
    // Hook de validação
    const {
        errors,
        touched,
        validateField,
        markFieldTouched,
        markAllTouched,
        validateAll
    } = useFieldValidation(detalhesVisitaSchema);

    // Expor função de validação para o pai (useImperativeHandle)
    useImperativeHandle(ref, () => ({
        validate: () => {
            markAllTouched();
            const valid = validateAll(data);
            
            if (!valid) {
                 // Scroll para o primeiro erro
                 const firstError = Object.keys(errors)[0];
                 if (firstError) {
                     document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 }
            }
            return valid;
        }
    }));

    const arquivos = data.arquivos || [];

    const handleInputChange = (
        field: keyof DetalhesSolicitacaoData, 
        value: DetalhesSolicitacaoData[keyof DetalhesSolicitacaoData]
    ) => {
        if (readOnly) return;
        
        const newData = { ...data, [field]: value };
        onDataChange(newData);
        
        // Validar se o campo já foi tocado
        if (touched[field]) {
            validateField(field as string, value);
        }
    };

    const handleBlur = (field: keyof DetalhesSolicitacaoData) => {
        markFieldTouched(field as string);
        validateField(field as string, data[field]);
    };

    // Auto-preencher área quando SPCI ou SPDA for selecionado
    useEffect(() => {
        if (data.finalidadeInspecao && deveAutoPreencherArea(data.finalidadeInspecao as FinalidadeInspecao)) {
            const areaAutomatica = FINALIDADE_AREA_MAP[data.finalidadeInspecao as FinalidadeInspecao];
            if (areaAutomatica && data.areaVistoriada !== areaAutomatica) {
                const newData = { ...data, areaVistoriada: areaAutomatica };
                onDataChange(newData);
                // Validar automaticamente a mudança
                validateField('areaVistoriada', areaAutomatica);
            }
        }
    }, [data.finalidadeInspecao]);

    // Gerar título do documento em tempo real
    const tituloDocumento = data.finalidadeInspecao
        ? gerarTituloDocumento(data.finalidadeInspecao as FinalidadeInspecao, data.areaVistoriada)
        : '';

    return (
        <div className="space-y-6">
            {/* Finalidade da Inspeção */}
            <SectionWrapper title="Finalidade da Inspeção" useCards={useCards}>
                <div className="space-y-4">
                    <FormSelect
                        id="finalidadeInspecao"
                        label="Qual a finalidade desta visita técnica?"
                        required
                        value={data.finalidadeInspecao}
                        onValueChange={(value) => handleInputChange('finalidadeInspecao', value)}
                        options={FINALIDADE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                        placeholder="Selecione a finalidade"
                        disabled={readOnly}
                        error={touched.finalidadeInspecao ? errors.finalidadeInspecao : undefined}
                        success={touched.finalidadeInspecao && !errors.finalidadeInspecao && !!data.finalidadeInspecao}
                    />

                    {/* Descrição da finalidade selecionada */}
                    {data.finalidadeInspecao && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {FINALIDADE_OPTIONS.find(o => o.value === data.finalidadeInspecao)?.descricao}
                        </p>
                    )}

                    {/* Preview do título do documento */}
                    {tituloDocumento && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Título do documento que será gerado:
                                    </p>
                                    <p className="font-medium text-primary">
                                        {tituloDocumento}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SectionWrapper>

            {/* Tipo de Área */}
            <SectionWrapper title="Tipo de Área" useCards={useCards}>
                <FormRadioGroup
                    id="tipoArea"
                    // Label vazia pois o SectionWrapper já tem título, mas mantemos id
                    value={data.tipoArea}
                    onValueChange={(value) => handleInputChange('tipoArea', value)}
                    error={touched.tipoArea ? errors.tipoArea : undefined}
                    disabled={readOnly}
                    options={[
                        { value: 'unidade_autonoma', label: 'Unidade autônoma' },
                        { value: 'area_comum', label: 'Área comum do condomínio' }
                    ]}
                />
            </SectionWrapper>

            {/* Unidades Envolvidas */}
            <SectionWrapper title="Unidades Envolvidas" useCards={useCards}>
                <div className="space-y-4">
                    <FormTextarea
                        id="unidadesVistoriar"
                        label="Unidades a serem vistoriadas"
                        required
                        value={data.unidadesVistoriar}
                        onChange={(e) => handleInputChange('unidadesVistoriar', e.target.value)}
                        onBlur={() => handleBlur('unidadesVistoriar')}
                        placeholder="No caso de infiltração, é obrigatório o agendamento com a outra unidade que se desconfia ser a causadora"
                        rows={3}
                        disabled={readOnly}
                        error={touched.unidadesVistoriar ? errors.unidadesVistoriar : undefined}
                        success={touched.unidadesVistoriar && !errors.unidadesVistoriar && data.unidadesVistoriar.length > 0}
                    />

                    <FormMaskedInput
                        id="contatoUnidades"
                        label="Contato das unidades envolvidas"
                        required
                        maskType="celular"
                        value={data.contatoUnidades}
                        onChange={(e) => handleInputChange('contatoUnidades', e.target.value)}
                        onBlur={() => handleBlur('contatoUnidades')}
                        placeholder="(00) 00000-0000"
                        disabled={readOnly}
                        error={touched.contatoUnidades ? errors.contatoUnidades : undefined}
                        success={touched.contatoUnidades && !errors.contatoUnidades && data.contatoUnidades.length >= 14}
                    />
                </div>
            </SectionWrapper>

            {/* Discriminação Técnica */}
            <SectionWrapper title="Discriminação Técnica" useCards={useCards}>
                <div className="space-y-4">
                    <FormRadioGroup
                        id="areaVistoriada"
                        label="Área a ser vistoriada"
                        required
                        value={data.areaVistoriada}
                        onValueChange={(value) => handleInputChange('areaVistoriada', value)}
                        disabled={readOnly || (data.finalidadeInspecao ? deveAutoPreencherArea(data.finalidadeInspecao as FinalidadeInspecao) : false)}
                        error={touched.areaVistoriada ? errors.areaVistoriada : undefined}
                        options={AREAS_VISTORIA.map((area) => ({
                            value: area,
                            label: area
                        }))}
                    />
                    
                    {data.finalidadeInspecao && deveAutoPreencherArea(data.finalidadeInspecao as FinalidadeInspecao) && (
                        <p className="text-sm text-muted-foreground italic">
                            ℹ️ Área selecionada automaticamente com base na finalidade.
                        </p>
                    )}

                    <FormTextarea
                        id="detalhesSolicitacao"
                        label="Detalhe a sua solicitação. O que deve ser vistoriado?"
                        required
                        value={data.detalhesSolicitacao}
                        onChange={(e) => handleInputChange('detalhesSolicitacao', e.target.value)}
                        onBlur={() => handleBlur('detalhesSolicitacao')}
                        placeholder="Descreva detalhadamente o que precisa ser vistoriado"
                        rows={4}
                        disabled={readOnly}
                        error={touched.detalhesSolicitacao ? errors.detalhesSolicitacao : undefined}
                        success={touched.detalhesSolicitacao && !errors.detalhesSolicitacao && data.detalhesSolicitacao.length >= 10}
                    />

                    <FormInput
                        id="tempoSituacao"
                        label="Há quanto tempo esta situação ocorre?"
                        required
                        value={data.tempoSituacao}
                        onChange={(e) => handleInputChange('tempoSituacao', e.target.value)}
                        onBlur={() => handleBlur('tempoSituacao')}
                        placeholder="Ex: 3 meses, 1 ano, etc."
                        disabled={readOnly}
                        error={touched.tempoSituacao ? errors.tempoSituacao : undefined}
                        success={touched.tempoSituacao && !errors.tempoSituacao && data.tempoSituacao.length > 0}
                    />

                    <FormInput
                        id="primeiraVisita"
                        label="É a primeira visita técnica solicitada?"
                        required
                        value={data.primeiraVisita}
                        onChange={(e) => handleInputChange('primeiraVisita', e.target.value)}
                        onBlur={() => handleBlur('primeiraVisita')}
                        placeholder="Sim ou Não"
                        disabled={readOnly}
                        error={touched.primeiraVisita ? errors.primeiraVisita : undefined}
                        success={touched.primeiraVisita && !errors.primeiraVisita && data.primeiraVisita.length > 0}
                    />
                </div>
            </SectionWrapper>

            {/* Upload de Fotos */}
            <SectionWrapper title="Anexar Fotos" useCards={useCards}>
                <FileUploadUnificado
                    label="Anexe fotos da situação"
                    files={arquivos}
                    onFilesChange={(files) => handleInputChange('arquivos', files)}
                    disabled={readOnly}
                    osId={osId}
                    maxFiles={10}
                    acceptedTypes={['image/jpeg', 'image/jpg', 'image/png']}
                />
            </SectionWrapper>

            {/* Alert Informativo - apenas para versão pública */}
            {variant === 'public' && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Certifique-se de preencher todos os campos obrigatórios (*) para facilitar a análise técnica da visita.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
});

FormDetalhesVisita.displayName = 'FormDetalhesVisita';
