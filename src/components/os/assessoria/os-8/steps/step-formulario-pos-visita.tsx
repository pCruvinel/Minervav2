import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { uploadFile } from '@/lib/utils/supabase-storage';
import { ordensServicoAPI } from '@/lib/api-client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, X, ClipboardCheck } from 'lucide-react';
import { FileWithComment } from '@/components/ui/file-upload-unificado';
import { toast } from '@/lib/utils/safe-toast';
import { FinalidadeInspecao, isFinalidadeRecebimento, isFinalidadeSPCI, isFinalidadeSPDA, AREAS_VISTORIA } from '../../shared/types/visita-tecnica-types';
import { ChecklistRecebimentoTable, ChecklistRecebimentoData } from '../../shared/components/checklist-recebimento-table';
import { ChecklistSPCITable } from '../../shared/components/checklist-spci-table';
import { ChecklistSPDATable } from '../../shared/components/checklist-spda-table';

// =====================================================
// TYPES
// =====================================================

interface FormularioGenericoData {
  pontuacaoEngenheiro: string;
  pontuacaoMorador: string;
  tipoDocumento: string;
  areaVistoriada: string;
  manifestacaoPatologica: string;
  recomendacoesPrevias: string;
  gravidade: string;
  origemNBR: string;
  observacoesGerais: string;
  arquivos?: FileWithComment[];
  fotosLocal?: string[];
  resultadoVisita: string;
  justificativa: string;
}

interface StepFormularioPosVisitaProps {
  osId?: string;
  etapaId?: string;
  finalidadeInspecao?: FinalidadeInspecao | '';
  data: FormularioGenericoData & {
    checklistRecebimento?: ChecklistRecebimentoData;
  };
  onDataChange: (data: FormularioGenericoData & { checklistRecebimento?: ChecklistRecebimentoData }) => void;
  readOnly?: boolean;
}

export interface StepFormularioPosVisitaHandle {
  salvar: () => Promise<boolean>;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export const StepFormularioPosVisita = forwardRef<StepFormularioPosVisitaHandle, StepFormularioPosVisitaProps>(
  function StepFormularioPosVisita({ osId, etapaId, finalidadeInspecao, data, onDataChange, readOnly }, ref) {
    const { currentUser } = useAuth();
    const [fotosFiles, setFotosFiles] = useState<File[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);

    // Verificar tipo de finalidade
    const isRecebimento = finalidadeInspecao ? isFinalidadeRecebimento(finalidadeInspecao) : false;
    const isSPCI = finalidadeInspecao ? isFinalidadeSPCI(finalidadeInspecao) : false;
    const isSPDA = finalidadeInspecao ? isFinalidadeSPDA(finalidadeInspecao) : false;
    const isChecklist = isRecebimento || isSPCI || isSPDA;

    const handleInputChange = (field: string, value: string) => {
      if (readOnly) return;
      onDataChange({ ...data, [field]: value });
    };

    const handleChecklistChange = (checklistData: ChecklistRecebimentoData) => {
      if (readOnly) return;
      onDataChange({ ...data, checklistRecebimento: checklistData });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) return;
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setUploadingFiles(true);
      try {
        const filesArray = Array.from(files);
        const newFotosFiles = [...fotosFiles, ...filesArray];
        setFotosFiles(newFotosFiles);

        const newFiles = filesArray.map((file) => URL.createObjectURL(file));
        handleInputChange('fotosLocal', [...(data.fotosLocal || []), ...newFiles] as unknown as string);
        toast.success(`${files.length} arquivo(s) anexado(s) com sucesso!`);
      } catch {
        toast.error('Erro ao selecionar arquivos');
      } finally {
        setUploadingFiles(false);
      }
    };

    const handleRemoveFile = (index: number) => {
      if (readOnly) return;
      const newFiles = (data.fotosLocal || []).filter((_, i) => i !== index);
      const newFotosFiles = fotosFiles.filter((_, i) => i !== index);
      setFotosFiles(newFotosFiles);
      onDataChange({ ...data, fotosLocal: newFiles });
      toast.info('Arquivo removido');
    };

    // Função para salvar dados no Supabase
    const salvar = async (): Promise<boolean> => {
      if (!osId) {
        console.warn('⚠️ osId não fornecido, salvamento ignorado');
        return false;
      }

      try {
        console.log('💾 Salvando formulário pós-visita...');

        const fotosUrls: string[] = [];
        const colaboradorId = currentUser?.id || 'sistema';
        const osNumero = `os-${osId?.substring(0, 8) || 'draft'}`;

        if (fotosFiles.length > 0) {
          toast.info(`Fazendo upload de ${fotosFiles.length} foto(s)...`);

          for (const foto of fotosFiles) {
            try {
              const uploaded = await uploadFile({
                file: foto,
                osNumero,
                etapa: 'os08-pos-visita',
                osId,
                colaboradorId,
              });
              fotosUrls.push(uploaded.url);
            } catch (uploadError) {
              console.error('❌ Erro ao fazer upload de foto:', uploadError);
            }
          }

          console.log(`✅ ${fotosUrls.length} foto(s) enviada(s)`);
        }

        // Preparar dados para salvar
        const dadosEtapa = isChecklist
          ? {
            finalidadeInspecao,
            checklistRecebimento: data.checklistRecebimento,
            dataPreenchimento: new Date().toISOString(),
          }
          : {
            finalidadeInspecao,
            pontuacaoEngenheiro: data.pontuacaoEngenheiro,
            pontuacaoMorador: data.pontuacaoMorador,
            tipoDocumento: data.tipoDocumento,
            areaVistoriada: data.areaVistoriada,
            manifestacaoPatologica: data.manifestacaoPatologica,
            recomendacoesPrevias: data.recomendacoesPrevias,
            gravidade: data.gravidade,
            origemNBR: data.origemNBR,
            observacoesGerais: data.observacoesGerais,
            resultadoVisita: data.resultadoVisita,
            justificativa: data.justificativa,
            fotosLocal: fotosUrls,
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
            nome_etapa: 'OS08 - Formulário Pós-Visita',
            status: 'concluida',
            ordem: 8,
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
    }), [osId, etapaId, data, fotosFiles, currentUser, isChecklist]);

    // =====================================================
    // RENDERIZAÇÃO CONDICIONAL
    // =====================================================

    // Se for recebimento de unidade, mostrar checklist
    if (isRecebimento) {
      return (
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
      );
    }

    // Se for SPCI, mostrar checklist SPCI
    if (isSPCI) {
      return (
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
      );
    }

    // Se for SPDA, mostrar checklist SPDA
    if (isSPDA) {
      return (
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
      );
    }

    // Formulário genérico para outras finalidades
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl mb-1">Formulário Pós-Visita</h2>
          <p className="text-sm text-muted-foreground">
            Preencha as informações coletadas durante a visita técnica
          </p>
        </div>

        {/* Questionário Inicial */}
        <div className="space-y-4">
          <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
            Questionário
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pontuacaoEngenheiro">
                Você foi pontual no horário da visita? <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.pontuacaoEngenheiro}
                onValueChange={(value) => handleInputChange('pontuacaoEngenheiro', value)}
                disabled={readOnly}
              >
                <SelectTrigger id="pontuacaoEngenheiro">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pontuacaoMorador">
                O morador foi pontual no horário da visita? <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.pontuacaoMorador}
                onValueChange={(value) => handleInputChange('pontuacaoMorador', value)}
                disabled={readOnly}
              >
                <SelectTrigger id="pontuacaoMorador">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tipoDocumento">
                Esta visita técnica é para gerar um parecer técnico ou um escopo de intervenção? <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.tipoDocumento}
                onValueChange={(value) => handleInputChange('tipoDocumento', value)}
                disabled={readOnly}
              >
                <SelectTrigger id="tipoDocumento">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parecer">Parecer Técnico</SelectItem>
                  <SelectItem value="escopo">Escopo de Intervenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Área Vistoriada */}
        <div className="space-y-4">
          <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
            Área Vistoriada
          </h3>

          <div className="space-y-3">
            <Label>
              Selecione a área vistoriada <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={data.areaVistoriada}
              onValueChange={(value) => handleInputChange('areaVistoriada', value)}
              disabled={readOnly}
            >
              {AREAS_VISTORIA.map((area, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <RadioGroupItem value={area} id={`area-pos-${index}`} className="mt-1" />
                  <Label htmlFor={`area-pos-${index}`} className="cursor-pointer leading-relaxed">
                    {area}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Informações Técnicas */}
        <div className="space-y-4">
          <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
            Informações Técnicas
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manifestacaoPatologica">
                Manifestação patológica encontrada <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="manifestacaoPatologica"
                value={data.manifestacaoPatologica}
                onChange={(e) => handleInputChange('manifestacaoPatologica', e.target.value)}
                placeholder="Descreva as manifestações patológicas identificadas"
                rows={3}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recomendacoesPrevias">
                Recomendações prévias <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="recomendacoesPrevias"
                value={data.recomendacoesPrevias}
                onChange={(e) => handleInputChange('recomendacoesPrevias', e.target.value)}
                placeholder="Liste as recomendações iniciais"
                rows={3}
                disabled={readOnly}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gravidade">
                  Gravidade <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={data.gravidade}
                  onValueChange={(value) => handleInputChange('gravidade', value)}
                  disabled={readOnly}
                >
                  <SelectTrigger id="gravidade">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origemNBR">
                  Origem NBR <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="origemNBR"
                  value={data.origemNBR}
                  onChange={(e) => handleInputChange('origemNBR', e.target.value)}
                  placeholder="Ex: NBR 15575"
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoesGerais">
                Observações gerais da visita <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="observacoesGerais"
                value={data.observacoesGerais}
                onChange={(e) => handleInputChange('observacoesGerais', e.target.value)}
                placeholder="Adicione observações relevantes sobre a visita"
                rows={4}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Upload de Fotos */}
        <div className="space-y-4">
          <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
            Fotos do Local Vistoriado
          </h3>

          <div className="space-y-2">
            <Label>
              Anexe fotos do local <span className="text-destructive">*</span>
            </Label>

            {!readOnly && (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-border transition-colors">
                <input
                  type="file"
                  id="file-upload-pos"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingFiles}
                />
                <label htmlFor="file-upload-pos" className="cursor-pointer">
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Clique para selecionar ou arraste arquivos
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, JPEG até 10MB
                  </p>
                </label>
              </div>
            )}

            {(data.fotosLocal?.length ?? 0) > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-sm text-muted-foreground">
                  {data.fotosLocal?.length} arquivo(s) anexado(s)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {data.fotosLocal?.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                        <img
                          src={file}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {!readOnly && (
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resultado da Visita */}
        <div className="space-y-4">
          <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
            Resultado da Visita
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resultadoVisita">
                Qual o resultado da visita técnica? <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="resultadoVisita"
                value={data.resultadoVisita}
                onChange={(e) => handleInputChange('resultadoVisita', e.target.value)}
                placeholder="Descreva o resultado geral da visita"
                rows={3}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="justificativa">
                Justifique <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="justificativa"
                value={data.justificativa}
                onChange={(e) => handleInputChange('justificativa', e.target.value)}
                placeholder="Justifique o resultado apresentado"
                rows={3}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Todos os campos marcados com <span className="text-destructive">*</span> são obrigatórios.
            Revise todas as informações antes de avançar para a geração do documento.
          </AlertDescription>
        </Alert>
      </div>
    );
  });
