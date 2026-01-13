import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText } from 'lucide-react';
import { FileUploadUnificado, FileWithComment } from '@/components/ui/file-upload-unificado';
import { StepLayout, StepSection } from '@/components/os/shared/wrappers/step-layout';
import {
    FinalidadeInspecao,
    FINALIDADE_OPTIONS,
    AREAS_VISTORIA,
    FINALIDADE_AREA_MAP,
    deveAutoPreencherArea,
    gerarTituloDocumento,
} from '../types/os08-types';

export interface StepDetalhesSolicitacaoData {
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

interface StepDetalhesSolicitacaoProps {
    data: StepDetalhesSolicitacaoData;
    onDataChange: (data: StepDetalhesSolicitacaoData) => void;
    readOnly?: boolean;
    osId?: string;
}

export function StepDetalhesSolicitacao({ data, onDataChange, readOnly, osId }: StepDetalhesSolicitacaoProps) {
    const arquivos = data.arquivos || [];

    const handleInputChange = (field: keyof StepDetalhesSolicitacaoData, value: StepDetalhesSolicitacaoData[keyof StepDetalhesSolicitacaoData]) => {
        if (readOnly) return;
        onDataChange({ ...data, [field]: value });
    };

    // Auto-preencher área quando SPCI ou SPDA for selecionado
    useEffect(() => {
        if (data.finalidadeInspecao && deveAutoPreencherArea(data.finalidadeInspecao)) {
            const areaAutomatica = FINALIDADE_AREA_MAP[data.finalidadeInspecao];
            if (areaAutomatica && data.areaVistoriada !== areaAutomatica) {
                onDataChange({ ...data, areaVistoriada: areaAutomatica });
            }
        }
    }, [data.finalidadeInspecao]);

    // Gerar título do documento em tempo real
    const tituloDocumento = data.finalidadeInspecao
        ? gerarTituloDocumento(data.finalidadeInspecao, data.areaVistoriada)
        : '';

    return (
        <StepLayout
            title="Detalhes da Solicitação"
            description="Informe os detalhes técnicos da vistoria solicitada"
        >
            <div className="space-y-6">
                {/* ✨ NOVO: Finalidade da Inspeção */}
                <StepSection title="Finalidade da Inspeção">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="finalidadeInspecao">
                                Qual a finalidade desta visita técnica? <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.finalidadeInspecao}
                                onValueChange={(value) => handleInputChange('finalidadeInspecao', value)}
                                disabled={readOnly}
                            >
                                <SelectTrigger id="finalidadeInspecao">
                                    <SelectValue placeholder="Selecione a finalidade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {FINALIDADE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex flex-col">
                                                <span>{option.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Descrição da finalidade selecionada */}
                            {data.finalidadeInspecao && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {FINALIDADE_OPTIONS.find(o => o.value === data.finalidadeInspecao)?.descricao}
                                </p>
                            )}
                        </div>

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
                </StepSection>

                {/* Tipo de Área */}
                <StepSection title="Tipo de Área">
                    <RadioGroup
                        value={data.tipoArea}
                        onValueChange={(value) => handleInputChange('tipoArea', value)}
                        disabled={readOnly}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="unidade_autonoma" id="tipo-unidade" />
                            <Label htmlFor="tipo-unidade" className="cursor-pointer">
                                Unidade autônoma
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="area_comum" id="tipo-area" />
                            <Label htmlFor="tipo-area" className="cursor-pointer">
                                Área comum do condomínio
                            </Label>
                        </div>
                    </RadioGroup>
                </StepSection>

                {/* Unidades Envolvidas */}
                <StepSection title="Unidades Envolvidas">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="unidadesVistoriar">
                                Unidades a serem vistoriadas <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="unidadesVistoriar"
                                value={data.unidadesVistoriar}
                                onChange={(e) => handleInputChange('unidadesVistoriar', e.target.value)}
                                placeholder="No caso de infiltração, é obrigatório o agendamento com a outra unidade que se desconfia ser a causadora"
                                rows={3}
                                disabled={readOnly}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contatoUnidades">
                                Contato das unidades envolvidas <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="contatoUnidades"
                                type="tel"
                                value={data.contatoUnidades}
                                onChange={(e) => handleInputChange('contatoUnidades', e.target.value)}
                                placeholder="(00) 00000-0000"
                                disabled={readOnly}
                            />
                        </div>
                    </div>
                </StepSection>

                {/* Discriminação Técnica */}
                <StepSection title="Discriminação Técnica">
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <Label>
                                Área a ser vistoriada <span className="text-destructive">*</span>
                            </Label>
                            <RadioGroup
                                value={data.areaVistoriada}
                                onValueChange={(value) => handleInputChange('areaVistoriada', value)}
                                disabled={readOnly || deveAutoPreencherArea(data.finalidadeInspecao as FinalidadeInspecao)}
                            >
                                {AREAS_VISTORIA.map((area, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                        <RadioGroupItem value={area} id={`area-${index}`} className="mt-1" />
                                        <Label htmlFor={`area-${index}`} className="cursor-pointer leading-relaxed">
                                            {area}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                            {deveAutoPreencherArea(data.finalidadeInspecao as FinalidadeInspecao) && (
                                <p className="text-sm text-muted-foreground italic">
                                    ℹ️ Área selecionada automaticamente com base na finalidade.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="detalhesSolicitacao">
                                Detalhe a sua solicitação. O que deve ser vistoriado? <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="detalhesSolicitacao"
                                value={data.detalhesSolicitacao}
                                onChange={(e) => handleInputChange('detalhesSolicitacao', e.target.value)}
                                placeholder="Descreva detalhadamente o que precisa ser vistoriado"
                                rows={4}
                                disabled={readOnly}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tempoSituacao">
                                Há quanto tempo esta situação ocorre? <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="tempoSituacao"
                                value={data.tempoSituacao}
                                onChange={(e) => handleInputChange('tempoSituacao', e.target.value)}
                                placeholder="Ex: 3 meses, 1 ano, etc."
                                disabled={readOnly}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="primeiraVisita">
                                É a primeira visita técnica solicitada? <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="primeiraVisita"
                                value={data.primeiraVisita}
                                onChange={(e) => handleInputChange('primeiraVisita', e.target.value)}
                                placeholder="Sim ou Não"
                                disabled={readOnly}
                            />
                        </div>
                    </div>
                </StepSection>

                {/* Upload de Fotos */}
                <StepSection title="Anexar Fotos">
                    <FileUploadUnificado
                        label="Anexe fotos da situação"
                        files={arquivos}
                        onFilesChange={(files) => handleInputChange('arquivos', files)}
                        disabled={readOnly}
                        osId={osId}
                        maxFiles={10}
                        acceptedTypes={['image/jpeg', 'image/jpg', 'image/png']}
                    />
                </StepSection>

                {/* Alert Informativo */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Certifique-se de preencher todos os campos obrigatórios (*) para facilitar a análise técnica da visita.
                    </AlertDescription>
                </Alert>
            </div>
        </StepLayout>
    );
}
