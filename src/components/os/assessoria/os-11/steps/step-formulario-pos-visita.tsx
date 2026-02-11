/**
 * Step 5: Questionário Pós-Visita (OS-11)
 * 
 * Este componente replica o padrão da OS-08 "Finalidade da Inspeção":
 * - Seleção de finalidade com descrição
 * - Campos condicionais baseados na finalidade selecionada
 * - Preview do título do documento que será gerado
 * - Checklist de recebimento para finalidade 'recebimento_unidade'
 */

import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { ordensServicoAPI } from '@/lib/api-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ClipboardCheck, FileText } from 'lucide-react';
import { FileUploadUnificado, FileWithComment } from '@/components/ui/file-upload-unificado';
import { toast } from 'sonner';
import {
  FinalidadeInspecao,
  FINALIDADE_OPTIONS,
  AREAS_VISTORIA,
  FINALIDADE_AREA_MAP,
  isFinalidadeRecebimento,
  isFinalidadeSPCI,
  isFinalidadeSPDA,
  isFinalidadeChecklist,
  deveAutoPreencherArea,
  gerarTituloDocumento,
} from '../../shared/types/visita-tecnica-types';
import { ChecklistRecebimentoTable, ChecklistRecebimentoData } from '../../shared/components/checklist-recebimento-table';
import { ChecklistSPCITable } from '../../shared/components/checklist-spci-table';
import { ChecklistSPDATable } from '../../shared/components/checklist-spda-table';
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { posVisitaSchema } from '@/lib/validations/os11-schemas';
import { FormSelect } from '@/components/ui/form-select';
import { FormTextarea } from '@/components/ui/form-textarea';
import { FormRadioGroup } from '@/components/ui/form-radio-group';
import { FormInput } from '@/components/ui/form-input';

// =====================================================
// TYPES
// =====================================================

interface FormularioGenericoData {
  finalidadeInspecao: FinalidadeInspecao | '';
  pontuacaoEngenheiro: string;
  pontuacaoMorador: string;
  areaVistoriada: string;
  manifestacaoPatologica: string;
  recomendacoesPrevias: string;
  gravidade: string;
  origemNBR: string;
  observacoesGerais: string;
  arquivos?: FileWithComment[];
  fotosLocal?: FileWithComment[];
  resultadoVisita: string;
  justificativa: string;
}

interface StepFormularioPosVisitaProps {
  osId?: string;
  etapaId?: string;
  data: FormularioGenericoData & {
    checklistRecebimento?: ChecklistRecebimentoData;
  };
  onDataChange: (data: FormularioGenericoData & { checklistRecebimento?: ChecklistRecebimentoData }) => void;
  readOnly?: boolean;
}

export interface StepFormularioPosVisitaHandle {
  salvar: () => Promise<boolean>;
  validate: () => boolean;
  isFormValid: () => boolean;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export const StepFormularioPosVisita = forwardRef<StepFormularioPosVisitaHandle, StepFormularioPosVisitaProps>(
  function StepFormularioPosVisita({ osId, etapaId, data, onDataChange, readOnly }, ref) {
    const { currentUser } = useAuth();

    // Verificar tipo de finalidade
    const isRecebimento = data.finalidadeInspecao ? isFinalidadeRecebimento(data.finalidadeInspecao) : false;
    const isSPCI = data.finalidadeInspecao ? isFinalidadeSPCI(data.finalidadeInspecao) : false;
    const isSPDA = data.finalidadeInspecao ? isFinalidadeSPDA(data.finalidadeInspecao) : false;
    const isChecklistMode = data.finalidadeInspecao ? isFinalidadeChecklist(data.finalidadeInspecao) : false;

    // Gerar título do documento em tempo real
    const tituloDocumento = data.finalidadeInspecao
      ? gerarTituloDocumento(data.finalidadeInspecao, data.areaVistoriada)
      : '';

    // Composite data for validation to include finalidadeInspecao
    const validationData = { ...data };

    const {
        errors,
        touched,
        validateField,
        markFieldTouched,
        validateAll,
        markAllTouched
    } = useFieldValidation(posVisitaSchema);

    // Auto-preencher área quando SPCI ou SPDA for selecionado
    useEffect(() => {
      if (data.finalidadeInspecao && deveAutoPreencherArea(data.finalidadeInspecao)) {
        const areaAutomatica = FINALIDADE_AREA_MAP[data.finalidadeInspecao];
        if (areaAutomatica && data.areaVistoriada !== areaAutomatica) {
          onDataChange({ ...data, areaVistoriada: areaAutomatica });
        }
      }
    }, [data.finalidadeInspecao]);

    const validate = () => {
        markAllTouched();
        const isValidSchema = validateAll(validationData);
        
        // Validação específica para checklists (Recebimento, SPCI, SPDA)
        let isValidChecklist = true;
        if (isChecklistMode) {
            if (!data.checklistRecebimento || Object.keys(data.checklistRecebimento.items || {}).length === 0) {
                 toast.error('Preencha o checklist de inspeção');
                 isValidChecklist = false;
            }
        } else {
             if (!isValidSchema) {
                toast.error('Verifique os campos obrigatórios no formulário');
             }
        }
        
        return isValidSchema && isValidChecklist;
    };

    // Função para salvar dados no Supabase
    const salvar = async (): Promise<boolean> => {
      if (!validate()) return false;

      if (!osId) {
        console.warn('⚠️ osId não fornecido, salvamento ignorado');
        return false;
      }

      try {
        console.log('💾 Salvando formulário pós-visita...');

        // Preparar dados para salvar
        const dadosEtapa = isChecklistMode
          ? {
            finalidadeInspecao: data.finalidadeInspecao,
            checklistRecebimento: data.checklistRecebimento,
            dataPreenchimento: new Date().toISOString(),
          }
          : {
            finalidadeInspecao: data.finalidadeInspecao,
            pontuacaoEngenheiro: data.pontuacaoEngenheiro,
            pontuacaoMorador: data.pontuacaoMorador,
            areaVistoriada: data.areaVistoriada,
            manifestacaoPatologica: data.manifestacaoPatologica,
            recomendacoesPrevias: data.recomendacoesPrevias,
            gravidade: data.gravidade,
            origemNBR: data.origemNBR,
            observacoesGerais: data.observacoesGerais,
            resultadoVisita: data.resultadoVisita,
            justificativa: data.justificativa,
            fotosLocal: data.fotosLocal?.map(f => f.url) || [],
            dataPreenchimento: new Date().toISOString(),
          };

        if (etapaId) {
          await ordensServicoAPI.updateEtapa(etapaId, {
            dados_etapa: dadosEtapa,
            status: 'concluida',
            data_conclusao: new Date().toISOString(),
          });
          console.log('✅ Etapa atualizada com sucesso');
        } else {
          await ordensServicoAPI.createEtapa(osId, {
            nome_etapa: 'OS11 - Formulário Pós-Visita',
            status: 'concluida',
            ordem: 5,
            dados_etapa: dadosEtapa,
            data_conclusao: new Date().toISOString(),
          });
          console.log('✅ Etapa criada com sucesso');
        }

        toast.success('Formulário pós-visita salvo com sucesso!');
        return true;
      } catch (error) {
        console.error('❌ Erro ao salvar formulário:', error);
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        toast.error(`Erro ao salvar: ${errorMsg}`);
        return false;
      }
    };

    useImperativeHandle(ref, () => ({
      salvar,
      validate,
      isFormValid: () => validateAll(validationData)
    }), [osId, etapaId, data, currentUser, isChecklistMode, validateAll, validationData]);

    const handleInputChange = (field: keyof FormularioGenericoData, value: string | FileWithComment[]) => {
      if (readOnly) return;
      const newData = { ...data, [field]: value };
      onDataChange(newData);

      if (touched[field]) {
          validateField(field as string, value);
      }
    };
    
    const handleBlur = (field: keyof FormularioGenericoData) => {
        markFieldTouched(field as string);
        validateField(field as string, data[field as keyof FormularioGenericoData]);
    };

    const handleChecklistChange = (checklistData: ChecklistRecebimentoData) => {
      if (readOnly) return;
      onDataChange({ ...data, checklistRecebimento: checklistData });
    };

    // =====================================================
    // RENDERIZAÇÃO
    // =====================================================

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl mb-1">Questionário Pós-Visita</h2>
          <p className="text-sm text-muted-foreground">
            Preencha as informações coletadas durante a visita técnica
          </p>
        </div>

        {/* Finalidade da Inspeção (Padrão OS-08) */}
        <div className="space-y-4">
          <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
            Finalidade da Inspeção
          </h3>

          <FormSelect
            id="finalidadeInspecao"
            label="Qual a finalidade desta visita técnica?"
            value={data.finalidadeInspecao}
            onValueChange={(value) => handleInputChange('finalidadeInspecao', value)}
            disabled={readOnly}
            required
            options={FINALIDADE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
            error={touched.finalidadeInspecao ? errors.finalidadeInspecao : undefined}
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

        {/* RENDERIZAÇÃO CONDICIONAL BASEADA NA FINALIDADE */}

        {/* Se for recebimento de unidade, mostrar checklist */}
        {isRecebimento && (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Inspeção de Recebimento de Unidade</h2>
                  <p className="text-sm text-muted-foreground">
                    Preencha o checklist completo conforme NBR 15575 e PBQP-H
                  </p>
                </div>
              </div>
            </div>

            <ChecklistRecebimentoTable
              data={data.checklistRecebimento || { items: {} }}
              onChange={handleChecklistChange}
              readOnly={readOnly}
              osId={osId}
            />

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Todos os itens marcados como "Não Conforme" devem ter uma observação obrigatória.
                Anexe fotos para evidenciar cada não conformidade.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Se for SPCI, mostrar checklist SPCI */}
        {isSPCI && (
          <div className="space-y-6">
            <ChecklistSPCITable
              data={data.checklistRecebimento || { items: {} }}
              onChange={handleChecklistChange}
              readOnly={readOnly}
              osId={osId}
            />

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Todos os itens marcados como "Não Conforme" devem ter uma observação obrigatória.
                Anexe fotos para evidenciar cada não conformidade.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Se for SPDA, mostrar checklist SPDA */}
        {isSPDA && (
          <div className="space-y-6">
            <ChecklistSPDATable
              data={data.checklistRecebimento || { items: {} }}
              onChange={handleChecklistChange}
              readOnly={readOnly}
              osId={osId}
            />

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Todos os itens marcados como "Não Conforme" devem ter uma observação obrigatória.
                Anexe fotos para evidenciar cada não conformidade.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Se NÃO for checklist, mostrar formulário técnico */}
        {!isChecklistMode && data.finalidadeInspecao && (
          <>
            {/* Questionário Inicial */}
            <div className="space-y-4">
              <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                Questionário
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  id="pontuacaoEngenheiro"
                  label="Você foi pontual no horário da visita?"
                  value={data.pontuacaoEngenheiro}
                  onValueChange={(value) => handleInputChange('pontuacaoEngenheiro', value)}
                  disabled={readOnly}
                  required
                  options={[
                      { value: 'sim', label: 'Sim' },
                      { value: 'nao', label: 'Não' }
                  ]}
                  error={touched.pontuacaoEngenheiro ? errors.pontuacaoEngenheiro : undefined}
                />

                <FormSelect
                  id="pontuacaoMorador"
                  label="O morador foi pontual no horário da visita?"
                  value={data.pontuacaoMorador}
                  onValueChange={(value) => handleInputChange('pontuacaoMorador', value)}
                  disabled={readOnly}
                  required
                  options={[
                      { value: 'sim', label: 'Sim' },
                      { value: 'nao', label: 'Não' }
                  ]}
                  error={touched.pontuacaoMorador ? errors.pontuacaoMorador : undefined}
                />
              </div>
            </div>

            {/* Área Vistoriada */}
            <div className="space-y-4">
              <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                Área Vistoriada
              </h3>

              <div className="space-y-3">
                <FormRadioGroup
                  id="areaVistoriada"
                  label="Selecione a área vistoriada"
                  value={data.areaVistoriada}
                  onValueChange={(value) => handleInputChange('areaVistoriada', value)}
                  disabled={readOnly || (data.finalidadeInspecao ? deveAutoPreencherArea(data.finalidadeInspecao) : false)}
                  options={AREAS_VISTORIA.map(area => ({ value: area, label: area }))}
                  error={touched.areaVistoriada ? errors.areaVistoriada : undefined}
                  required
                />

                {data.finalidadeInspecao && deveAutoPreencherArea(data.finalidadeInspecao) && (
                  <p className="text-sm text-muted-foreground italic">
                    ℹ️ Área selecionada automaticamente com base na finalidade.
                  </p>
                )}
              </div>
            </div>

            {/* Informações Técnicas */}
            <div className="space-y-4">
              <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                Informações Técnicas
              </h3>

              <div className="space-y-4">
                <FormTextarea
                  id="manifestacaoPatologica"
                  label="Manifestação patológica encontrada"
                  value={data.manifestacaoPatologica}
                  onChange={(e) => handleInputChange('manifestacaoPatologica', e.target.value)}
                  onBlur={() => handleBlur('manifestacaoPatologica')}
                  placeholder="Descreva as manifestações patológicas identificadas"
                  rows={3}
                  disabled={readOnly}
                  required
                  error={touched.manifestacaoPatologica ? errors.manifestacaoPatologica : undefined}
                />

                <FormTextarea
                  id="recomendacoesPrevias"
                  label="Recomendações prévias"
                  value={data.recomendacoesPrevias}
                  onChange={(e) => handleInputChange('recomendacoesPrevias', e.target.value)}
                  onBlur={() => handleBlur('recomendacoesPrevias')}
                  placeholder="Liste as recomendações iniciais"
                  rows={3}
                  disabled={readOnly}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    id="gravidade"
                    label="Gravidade"
                    value={data.gravidade}
                    onValueChange={(value) => handleInputChange('gravidade', value)}
                    disabled={readOnly}
                    required
                    options={[
                        { value: 'baixa', label: 'Baixa' },
                        { value: 'media', label: 'Média' },
                        { value: 'alta', label: 'Alta' },
                        { value: 'critica', label: 'Crítica' }
                    ]}
                    error={touched.gravidade ? errors.gravidade : undefined}
                  />

                  <FormInput
                    id="origemNBR"
                    label="Origem NBR"
                    value={data.origemNBR}
                    onChange={(e) => handleInputChange('origemNBR', e.target.value)}
                    onBlur={() => handleBlur('origemNBR')}
                    placeholder="Ex: NBR 15575"
                    disabled={readOnly}
                    required
                  />
                </div>

                <FormTextarea
                  id="observacoesGerais"
                  label="Observações gerais da visita"
                  value={data.observacoesGerais}
                  onChange={(e) => handleInputChange('observacoesGerais', e.target.value)}
                  onBlur={() => handleBlur('observacoesGerais')}
                  placeholder="Adicione observações relevantes sobre a visita"
                  rows={4}
                  disabled={readOnly}
                  required
                />
              </div>
            </div>

            {/* Upload de Fotos */}
            <div className="space-y-4">
              <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                Fotos do Local Vistoriado
              </h3>

              <FileUploadUnificado
                label="Anexe fotos do local"
                files={data.fotosLocal || []}
                onFilesChange={(files) => handleInputChange('fotosLocal', files)}
                disabled={readOnly}
                osId={osId}
                etapaId="5"
                etapaNome="Questionário Pós-Visita"
                maxFiles={10}
                maxFileSize={5}
                acceptedTypes={['image/jpeg', 'image/png', 'image/jpg']}
              />
            </div>

            {/* Resultado da Visita */}
            <div className="space-y-4">
              <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                Resultado da Visita
              </h3>

              <div className="space-y-4">
                <FormTextarea
                  id="resultadoVisita"
                  label="Qual o resultado da visita técnica?"
                  value={data.resultadoVisita}
                  onChange={(e) => handleInputChange('resultadoVisita', e.target.value)}
                  onBlur={() => handleBlur('resultadoVisita')}
                  placeholder="Descreva o resultado geral da visita"
                  rows={3}
                  disabled={readOnly}
                  required
                />

                <FormTextarea
                  id="justificativa"
                  label="Justifique"
                  value={data.justificativa}
                  onChange={(e) => handleInputChange('justificativa', e.target.value)}
                  onBlur={() => handleBlur('justificativa')}
                  placeholder="Justifique o resultado apresentado"
                  rows={3}
                  disabled={readOnly}
                  required
                />
              </div>
            </div>
          </>
        )}

        {/* Alert - Apenas se finalidade foi selecionada */}
        {data.finalidadeInspecao && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Todos os campos marcados com <span className="text-destructive">*</span> são obrigatórios.
              Revise todas as informações antes de avançar para a geração do documento.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }
);
