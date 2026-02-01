/**
 * Step 6: Gerar Documento (OS-11)
 * 
 * Este componente gera o PDF de visita técnica utilizando dados de todas as etapas anteriores.
 * Suporta dois modos:
 * - Recebimento de Unidade → Checklist de 27 itens
 * - Parecer Técnico → Manifestações patológicas, gravidade, NBR
 * 
 * Adaptado do OS-08 para o fluxo de contratação avulsa.
 */

import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { FileText, Download, Eye, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';
import { useAuth } from '@/lib/contexts/auth-context';
import { logger } from '@/lib/utils/logger';
import {
  gerarTituloDocumento,
  isFinalidadeRecebimento,
  type FinalidadeInspecao
} from '../../shared/types/visita-tecnica-types';
import { CHECKLIST_BLOCOS } from '../../shared/components/checklist-recebimento-table';
import type { VisitaTecnicaData, ChecklistItem, GravidadeNivel } from '@/lib/pdf/templates/visita-tecnica-template';
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { gerarDocumentoSchema } from '@/lib/validations/os11-schemas';

// =====================================================
// TYPES
// =====================================================

interface Etapa1Data {
  identificacao?: {
    nome?: string;
    cpfCnpj?: string;
    email?: string;
    telefone?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    endereco?: string;
  };
  endereco?: string;
  nome?: string;
  cpfCnpj?: string;
  telefone?: string;
}

interface Etapa2Data {
  dataVisita?: string;
  instrucoes?: string;
}

interface FotoComComentario {
  url: string;
  comentario?: string;
  isNaoConforme?: boolean;
}

interface Etapa5Data { // Pós-Visita
    finalidadeInspecao?: FinalidadeInspecao;
    pontuacaoEngenheiro?: string;
    pontuacaoMorador?: string;
    manifestacaoPatologica?: string;
    recomendacoesPrevias?: string;
    gravidade?: string;
    origemNBR?: string;
    observacoesGerais?: string;
    resultadoVisita?: string;
    justificativa?: string;
    fotosLocal?: string[] | FotoComComentario[];
    arquivos?: Array<{
        url: string;
        comentario?: string;
        name?: string;
    }>;
    checklistRecebimento?: {
        items: Record<string, {
            id: string;
            status: 'C' | 'NC' | 'NA' | '';
            observacao: string;
            fotos?: Array<{
                url: string;
                comentario?: string;
            }>;
        }>;
    };
    areaVistoriada?: string;
}

interface StepGerarDocumentoData {
    documentoGerado: boolean;
    documentoUrl: string;
    templateUsado?: string;
}

interface StepGerarDocumentoProps {
  osId: string;
  codigoOS?: string;
  data: StepGerarDocumentoData;
  onDataChange: (data: StepGerarDocumentoData) => void;
  readOnly?: boolean;
  etapa1Data?: Etapa1Data;
  etapa2Data?: Etapa2Data;
  etapa3Data?: any;
  etapa4Data?: any;
  etapa5Data?: Etapa5Data;
}

export interface StepGerarDocumentoHandle {
    validate: () => boolean;
    isFormValid: () => boolean;
}

export const StepGerarDocumento = forwardRef<StepGerarDocumentoHandle, StepGerarDocumentoProps>(
  function StepGerarDocumento({
  osId,
  codigoOS,
  data: documentData,
  onDataChange,
  readOnly,
  etapa1Data,
  etapa2Data,
  etapa5Data,
}, ref) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { generating: generatingPDF, generate: generatePDF } = usePDFGeneration();
  const { currentUser } = useAuth();

  const finalidadeInspecao = etapa5Data?.finalidadeInspecao as FinalidadeInspecao | undefined;
  const isRecebimento = finalidadeInspecao ? isFinalidadeRecebimento(finalidadeInspecao) : false;
  const templateEsperado = isRecebimento ? 'checklist_recebimento' : 'visita_tecnica';

  const tituloDocumento = finalidadeInspecao
    ? gerarTituloDocumento(finalidadeInspecao, etapa5Data?.areaVistoriada)
    : 'RELATÓRIO DE VISITA TÉCNICA';

  // Validation Hook
  const {
    validateAll,
    markAllTouched
  } = useFieldValidation(gerarDocumentoSchema);
  
  // Update templateUsado whenever relevant data changes
  useEffect(() => {
      if (!readOnly && documentData.templateUsado !== templateEsperado) {
          onDataChange({
              ...documentData,
              templateUsado: templateEsperado
          });
      }
  }, [finalidadeInspecao, isRecebimento, documentData, onDataChange, readOnly, templateEsperado]);

  const validate = () => {
    markAllTouched();
    // Validate if document shows as generated (we can rely on the data or actual file existence check if needed)
    // The schema checks for templateUsado. We also manually check documentoGerado.
    const isValid = validateAll({
        documentoGerado: documentData.documentoGerado,
        urlDocumento: documentData.documentoUrl,
        templateUsado: documentData.templateUsado || templateEsperado
    });
    
    if (!documentData.documentoGerado || !documentData.documentoUrl) {
        toast.error('É necessário gerar o documento antes de prosseguir.');
        return false;
    }
    
    return isValid;
  };
  
  useImperativeHandle(ref, () => ({
      validate,
      isFormValid: () => documentData.documentoGerado && !!documentData.documentoUrl
  }));

  const transformChecklistData = (): VisitaTecnicaData['checklistRecebimento'] | undefined => {
    if (!etapa5Data?.checklistRecebimento?.items) return undefined;

    const items: ChecklistItem[] = [];
    let conformes = 0;
    let naoConformes = 0;
    let naoAplica = 0;

    CHECKLIST_BLOCOS.forEach(bloco => {
      bloco.items.forEach(itemDef => {
        const itemData = etapa5Data.checklistRecebimento?.items[itemDef.id];
        if (itemData && itemData.status) {
          items.push({
            id: itemDef.id,
            bloco: bloco.titulo,
            label: itemDef.label,
            status: itemData.status as 'C' | 'NC' | 'NA',
            observacao: itemData.observacao || undefined,
          });

          switch (itemData.status) {
            case 'C': conformes++; break;
            case 'NC': naoConformes++; break;
            case 'NA': naoAplica++; break;
          }
        }
      });
    });

    return {
      items,
      estatisticas: {
        total: items.length,
        conformes,
        naoConformes,
        naoAplica,
      },
    };
  };

  const buildPDFPayload = (): VisitaTecnicaData => {
    const now = new Date().toISOString();
    const enderecoEnd = etapa1Data?.identificacao?.endereco || etapa1Data?.endereco || '';
    
    const todasFotos: Array<{ url: string; legenda: string; isNaoConforme: boolean }> = [];

    if (etapa5Data?.fotosLocal && Array.isArray(etapa5Data.fotosLocal)) {
      etapa5Data.fotosLocal.forEach((foto, idx) => {
        if (typeof foto === 'string') {
          todasFotos.push({
            url: foto,
            legenda: `Foto ${idx + 1}`,
            isNaoConforme: false,
          });
        } else if (foto && typeof foto === 'object' && 'url' in foto) {
          todasFotos.push({
            url: foto.url,
            legenda: foto.comentario || `Foto ${idx + 1}`,
            isNaoConforme: foto.isNaoConforme || false,
          });
        }
      });
    }

    if (etapa5Data?.arquivos && Array.isArray(etapa5Data.arquivos)) {
      etapa5Data.arquivos.forEach((arquivo, idx) => {
        if (arquivo.url) {
          todasFotos.push({
            url: arquivo.url,
            legenda: arquivo.comentario || arquivo.name || `Arquivo ${idx + 1}`,
            isNaoConforme: false,
          });
        }
      });
    }

    if (isRecebimento && etapa5Data?.checklistRecebimento?.items) {
      Object.values(etapa5Data.checklistRecebimento.items).forEach(item => {
        if (item.fotos && Array.isArray(item.fotos)) {
          item.fotos.forEach((foto, idx) => {
            if (foto.url) {
              todasFotos.push({
                url: foto.url,
                legenda: foto.comentario || `Item ${item.id} - Foto ${idx + 1}`,
                isNaoConforme: item.status === 'NC',
              });
            }
          });
        }
      });
    }

    const payload: VisitaTecnicaData = {
      codigoOS: codigoOS || osId?.substring(0, 8) || 'OS11-XXX',
      dataVisita: etapa2Data?.dataVisita || now,
      dataGeracao: now,
      finalidadeInspecao: finalidadeInspecao || 'parecer_tecnico',
      tituloDocumento,
      cliente: {
        nome: etapa1Data?.identificacao?.nome || etapa1Data?.nome || 'Cliente não identificado',
        cpfCnpj: etapa1Data?.identificacao?.cpfCnpj || etapa1Data?.cpfCnpj,
        endereco: typeof enderecoEnd === 'string' ? enderecoEnd : undefined,
        bairro: etapa1Data?.identificacao?.bairro,
        cidade: etapa1Data?.identificacao?.cidade,
        estado: etapa1Data?.identificacao?.estado,
      },
      solicitante: {
        nome: etapa1Data?.identificacao?.nome || 'Solicitante não identificado',
        contato: etapa1Data?.identificacao?.telefone || etapa1Data?.telefone || '',
      },
      objetivo: {
        descricaoSolicitacao: etapa2Data?.instrucoes || 'Laudo Técnico Pontual',
        areaVistoriada: etapa5Data?.areaVistoriada || 'Não especificada',
      },
      qualidade: {
        engenheiroPontual: etapa5Data?.pontuacaoEngenheiro === 'sim',
        moradorPontual: etapa5Data?.pontuacaoMorador === 'sim',
      },
      fotos: todasFotos.length > 0 ? todasFotos : undefined,
      responsavelTecnico: {
        nome: currentUser?.nome_completo || 'Engenheiro Responsável',
        cargo: 'Engenheiro Civil',
      },
    };

    if (isRecebimento) {
      payload.checklistRecebimento = transformChecklistData();
    } else {
      payload.parecerTecnico = {
        manifestacaoPatologica: etapa5Data?.manifestacaoPatologica || '',
        recomendacoes: etapa5Data?.recomendacoesPrevias || '',
        gravidade: (etapa5Data?.gravidade as GravidadeNivel) || 'baixa',
        origemNBR: etapa5Data?.origemNBR || '',
        observacoes: etapa5Data?.observacoesGerais || '',
        resultadoVisita: etapa5Data?.resultadoVisita || '',
        justificativa: etapa5Data?.justificativa || '',
      };
    }

    return payload;
  };

  const handleGerarDocumento = async () => {
    if (readOnly) return;
    setIsGenerating(true);

    try {
      logger.log('📄 Gerando documento (OS-11) para OS:', osId);
      const payload = buildPDFPayload();
      const result = await generatePDF('visita-tecnica', osId, payload);

      if (result?.success && result.url) {
        logger.log('✅ PDF gerado:', result.url);
        onDataChange({
          ...documentData,
          documentoGerado: true,
          documentoUrl: result.url,
          templateUsado: templateEsperado
        });
        toast.success('Documento gerado com sucesso!');
      } else {
        throw new Error(result?.error || 'Falha ao gerar PDF');
      }
    } catch (error) {
      logger.error('Erro ao gerar documento:', error);
      toast.error('Erro ao gerar documento.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVisualizarDocumento = () => {
    if (documentData.documentoUrl) {
      window.open(documentData.documentoUrl, '_blank');
    }
  };

  const handleBaixarDocumento = () => {
    if (documentData.documentoUrl) {
      const link = document.createElement('a');
      link.href = documentData.documentoUrl;
      link.download = `${codigoOS || 'visita-tecnica'}.pdf`;
      link.click();
    }
  };

  const tipoDocumentoLabel = isRecebimento ? 'Relatório de Inspeção' : 'Parecer Técnico';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Gerar Documento Interno</h2>
        <p className="text-sm text-muted-foreground">
          Gere o {tipoDocumentoLabel.toLowerCase()} para uso interno
        </p>
      </div>

      {!documentData.documentoGerado ? (
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-6 bg-background">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base mb-2">{tipoDocumentoLabel}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Documento gerado com base nas informações coletadas.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 py-8">
            <PrimaryButton
              onClick={handleGerarDocumento}
              disabled={isGenerating || generatingPDF || readOnly}
              className="px-8 py-3"
            >
              {(isGenerating || generatingPDF) ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Gerar {tipoDocumentoLabel}
                </>
              )}
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-success/20 rounded-lg p-6 bg-success/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg mb-1 text-success">Documento Gerado!</h3>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Button onClick={handleVisualizarDocumento} variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button onClick={handleBaixarDocumento}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});