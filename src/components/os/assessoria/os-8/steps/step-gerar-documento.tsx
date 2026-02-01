/**
 * Step 6: Gerar Documento
 * 
 * Este componente gera o PDF de visita técnica utilizando dados de todas as etapas anteriores.
 * Suporta dois modos:
 * - Recebimento de Unidade → Checklist de 27 itens
 * - Parecer Técnico → Manifestações patológicas, gravidade, NBR
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Eye, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
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

// =====================================================
// TYPES
// =====================================================

interface Etapa1Data {
  identificacao?: {
    nome?: string;
    cpfCnpj?: string;
    email?: string;
    telefone?: string;
  };
  edificacao?: {
    nome?: string;
    sindico?: string;
  };
  endereco?: {
    logradouro?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
  };
}

interface Etapa2Data {
  finalidadeInspecao?: FinalidadeInspecao | '';
  areaVistoriada?: string;
  detalhesSolicitacao?: string;
  tempoSituacao?: string;
}

interface Etapa4Data {
  dataRealizacao?: string;
}

interface FotoComComentario {
  url: string;
  comentario?: string;
  isNaoConforme?: boolean;
}

interface Etapa5Data {
  pontuacaoEngenheiro?: string;
  pontuacaoMorador?: string;
  manifestacaoPatologica?: string;
  recomendacoesPrevias?: string;
  gravidade?: string;
  origemNBR?: string;
  observacoesGerais?: string;
  resultadoVisita?: string;
  justificativa?: string;
  // Fotos do formulário genérico (pode ser string[] legado ou array de objetos)
  fotosLocal?: string[] | FotoComComentario[];
  // Fotos de arquivos com comentário (formato FileWithComment do uploader)
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
      // Fotos do checklist com comentários
      fotos?: Array<{
        url: string;
        comentario?: string;
      }>;
    }>;
  };
}

interface StepGerarDocumentoProps {
  osId: string;
  codigoOS?: string;
  data: {
    documentoGerado: boolean;
    documentoUrl: string;
  };
  onDataChange: (data: { documentoGerado: boolean; documentoUrl: string }) => void;
  readOnly?: boolean;
  // Dados de etapas anteriores para montar o PDF
  etapa1Data?: Etapa1Data;
  etapa2Data?: Etapa2Data;
  etapa4Data?: Etapa4Data;
  etapa5Data?: Etapa5Data;
}

export function StepGerarDocumento({
  osId,
  codigoOS,
  data: documentData,
  onDataChange,
  readOnly,
  etapa1Data,
  etapa2Data,
  etapa4Data,
  etapa5Data,
}: StepGerarDocumentoProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { generating: generatingPDF, generate: generatePDF } = usePDFGeneration();
  const { currentUser } = useAuth();

  // Verificar se é recebimento de unidade
  const finalidadeInspecao = etapa2Data?.finalidadeInspecao as FinalidadeInspecao | undefined;
  const isRecebimento = finalidadeInspecao ? isFinalidadeRecebimento(finalidadeInspecao) : false;

  // Gerar título dinâmico
  const tituloDocumento = finalidadeInspecao
    ? gerarTituloDocumento(finalidadeInspecao, etapa2Data?.areaVistoriada)
    : 'RELATÓRIO DE VISITA TÉCNICA';

  /**
   * Transforma dados do checklist para formato do PDF
   */
  const transformChecklistData = (): VisitaTecnicaData['checklistRecebimento'] | undefined => {
    if (!etapa5Data?.checklistRecebimento?.items) return undefined;

    const items: ChecklistItem[] = [];
    let conformes = 0;
    let naoConformes = 0;
    let naoAplica = 0;

    // Iterar pelos blocos e itens definidos
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

  /**
   * Monta o payload completo para geração do PDF
   */
  const buildPDFPayload = (): VisitaTecnicaData => {
    const now = new Date().toISOString();

    // Construir endereço completo
    const enderecoCompleto = [
      etapa1Data?.endereco?.logradouro,
      etapa1Data?.endereco?.bairro,
    ].filter(Boolean).join(', ');

    // Coletar todas as fotos com legendas
    const todasFotos: Array<{ url: string; legenda: string; isNaoConforme: boolean }> = [];

    // 1. Fotos do campo fotosLocal (formato legado string[] ou novo FotoComComentario[])
    if (etapa5Data?.fotosLocal && Array.isArray(etapa5Data.fotosLocal)) {
      etapa5Data.fotosLocal.forEach((foto, idx) => {
        if (typeof foto === 'string') {
          // Formato legado: apenas URL
          todasFotos.push({
            url: foto,
            legenda: `Foto ${idx + 1}`,
            isNaoConforme: false,
          });
        } else if (foto && typeof foto === 'object' && 'url' in foto) {
          // Novo formato: objeto com url e comentario
          todasFotos.push({
            url: foto.url,
            legenda: foto.comentario || `Foto ${idx + 1}`,
            isNaoConforme: foto.isNaoConforme || false,
          });
        }
      });
    }

    // 2. Fotos do campo arquivos (FileWithComment)
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

    // 3. Fotos do checklist de recebimento (itens NC têm prioridade visual)
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
      // Metadados
      codigoOS: codigoOS || osId?.substring(0, 8) || 'OS08-XXX',
      dataVisita: etapa4Data?.dataRealizacao || now,
      dataGeracao: now,

      // Título dinâmico
      finalidadeInspecao: finalidadeInspecao || 'parecer_tecnico',
      tituloDocumento,

      // Cliente
      cliente: {
        nome: etapa1Data?.identificacao?.nome || etapa1Data?.edificacao?.nome || 'Cliente não identificado',
        cpfCnpj: etapa1Data?.identificacao?.cpfCnpj,
        endereco: enderecoCompleto || undefined,
        bairro: etapa1Data?.endereco?.bairro,
        cidade: etapa1Data?.endereco?.cidade,
        estado: etapa1Data?.endereco?.uf,
        sindico: etapa1Data?.edificacao?.sindico,
      },

      // Solicitante (do cliente)
      solicitante: {
        nome: etapa1Data?.identificacao?.nome || 'Solicitante não identificado',
        contato: etapa1Data?.identificacao?.telefone || '',
        condominio: etapa1Data?.edificacao?.nome,
      },

      // Objetivo
      objetivo: {
        descricaoSolicitacao: etapa2Data?.detalhesSolicitacao || 'Não especificado',
        areaVistoriada: etapa2Data?.areaVistoriada || 'Não especificada',
        tempoSituacao: etapa2Data?.tempoSituacao,
      },

      // Qualidade
      qualidade: {
        engenheiroPontual: etapa5Data?.pontuacaoEngenheiro === 'sim',
        moradorPontual: etapa5Data?.pontuacaoMorador === 'sim',
      },

      // Fotos
      fotos: todasFotos.length > 0 ? todasFotos : undefined,

      // Responsável técnico
      responsavelTecnico: {
        nome: currentUser?.nome_completo || 'Engenheiro Responsável',
        cargo: 'Engenheiro Civil',
        crea: undefined, // TODO: adicionar campo crea ao User type se necessário
      },
    };

    // Adicionar dados específicos baseado na finalidade
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
      logger.log('📄 Gerando documento de visita técnica para OS:', osId);

      // Montar payload completo
      const payload = buildPDFPayload();
      logger.log('📦 Payload do PDF:', payload);

      // Gerar PDF de visita técnica
      const result = await generatePDF('visita-tecnica', osId, payload);

      if (result?.success && result.url) {
        logger.log('✅ PDF de visita técnica gerado com sucesso:', result.url);

        onDataChange({
          ...documentData,
          documentoGerado: true,
          documentoUrl: result.url,
        });

        toast.success('Documento de visita técnica gerado com sucesso!');
      } else {
        throw new Error(result?.error || 'Falha ao gerar PDF');
      }
    } catch (error) {
      logger.error('Erro ao gerar documento:', error);
      toast.error('Erro ao gerar documento. Verifique se todas as etapas anteriores foram concluídas.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVisualizarDocumento = () => {
    if (documentData.documentoUrl) {
      window.open(documentData.documentoUrl, '_blank');
      toast.info('Abrindo documento...');
    }
  };

  const handleBaixarDocumento = () => {
    if (documentData.documentoUrl) {
      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = documentData.documentoUrl;
      link.download = `${codigoOS || 'visita-tecnica'}.pdf`;
      link.click();
      toast.success('Download iniciado!');
    }
  };

  // Determinar descrição do documento baseado na finalidade
  const tipoDocumentoLabel = isRecebimento
    ? 'Relatório de Inspeção de Recebimento'
    : 'Parecer Técnico';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Gerar Documento Interno</h2>
        <p className="text-sm text-muted-foreground">
          Gere o {tipoDocumentoLabel.toLowerCase()} para uso interno da empresa
        </p>
      </div>

      {!documentData.documentoGerado ? (
        <div className="space-y-4">
          {/* Card Informativo */}
          <div className="border border-border rounded-lg p-6 bg-background">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }}>
                <FileText className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-base mb-2">{tipoDocumentoLabel}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  O documento será gerado com base nas informações coletadas durante a visita técnica.
                  Este documento é para uso interno e controle da empresa.
                </p>

                <div className="space-y-2 text-sm">
                  {isRecebimento ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
                        <span>Checklist de 27 itens conforme NBR 15575</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
                        <span>Estatísticas de conformidade (C/NC/NA)</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
                        <span>Parecer técnico completo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
                        <span>Manifestações patológicas identificadas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
                        <span>Gravidade e embasamento normativo (NBR)</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
                    <span>Recomendações técnicas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
                    <span>Registro fotográfico</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview do título */}
          <div className="bg-muted/50 border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Título do documento:</p>
            <p className="font-semibold text-sm">{tituloDocumento}</p>
          </div>

          {/* Botão de Gerar */}
          <div className="flex flex-col items-center gap-4 py-8">
            <PrimaryButton
              onClick={handleGerarDocumento}
              disabled={isGenerating || generatingPDF || readOnly}
              className="px-8 py-3"
            >
              {(isGenerating || generatingPDF) ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {generatingPDF ? 'Gerando PDF...' : 'Processando...'}
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Gerar {tipoDocumentoLabel}
                </>
              )}
            </PrimaryButton>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Certifique-se de que todas as informações estão corretas antes de gerar o documento.
              Você poderá visualizar e baixar o documento após a geração.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Confirmação de Documento Gerado */}
          <div className="border border-success/20 rounded-lg p-6 bg-success/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg mb-1 text-success">Documento Gerado com Sucesso!</h3>
                <p className="text-sm text-success mb-4">
                  O {tipoDocumentoLabel.toLowerCase()} está pronto e disponível para visualização e download.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleVisualizarDocumento}
                    className="bg-white border border-green-600 text-success hover:bg-success/5"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>

                  <Button
                    onClick={handleBaixarDocumento}
                    className="bg-success text-white hover:bg-success"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Card com Preview */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-base mb-4" style={{ color: 'var(--primary)' }}>
              Informações do Documento
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-muted-foreground">Tipo:</span>
                <span>{tipoDocumentoLabel}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-muted-foreground">Formato:</span>
                <span>PDF</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-muted-foreground">Finalidade:</span>
                <span className="capitalize">{finalidadeInspecao?.replace(/_/g, ' ') || 'Parecer Técnico'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Gerado em:</span>
                <span>{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Avance para a próxima etapa para gerar e enviar o documento ao cliente.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
