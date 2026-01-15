/**
 * StepGerarProposta - Etapa de Geração de Proposta Comercial
 * 
 * Funcionalidades:
 * - Detecta o tipo de OS e chama o handler correto
 * - Botão "Gerar Documento" no canto superior direito
 * - Visualizador de PDF embarcado após geração
 * - Toolbar com impressão, download, rotação, navegação
 * 
 * Mapeamento de tipos:
 * - OS 1-4 (Obras): tipo = 'proposta'
 * - OS 5 (Assessoria Anual): tipo = 'proposta-ass-anual'
 * - OS 6 (Assessoria Pontual): tipo = 'proposta-ass-pontual'
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { PDFViewerEmbedded } from '@/components/pdf/pdf-viewer-embedded';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';
import { isValidUUID } from '@/lib/utils/os-workflow-helpers';
import { toast } from '@/lib/utils/safe-toast';

// Tipos de PDF disponíveis
type PDFType = 'proposta' | 'proposta-ass-anual' | 'proposta-ass-pontual';

interface StepGerarPropostaProps {
  osId: string;
  /**
   * Tipo da OS para determinar qual template usar:
   * - 'OS-01' | 'OS-02' | 'OS-03' | 'OS-04' → proposta (obras)
   * - 'OS-05' → proposta-ass-anual
   * - 'OS-06' → proposta-ass-pontual
   */
  tipoOS?: string;
  etapa1Data?: {
    nome?: string;
    cpfCnpj?: string;
    email?: string;
    telefone?: string;
    [key: string]: unknown;
  };
  etapa2Data?: {
    tipoOS?: string;
    [key: string]: unknown;
  };
  etapa7Data?: {
    objetivo?: string;
    etapasPrincipais?: unknown[];
    especificacoesTecnicas?: unknown[];
    metodologia?: string;
    garantia?: string;
    prazo?: unknown;
    [key: string]: unknown;
  };
  etapa8Data?: {
    percentualEntrada?: string;
    numeroParcelas?: string;
    percentualImposto?: string;
    custoBase?: string;
    [key: string]: unknown;
  };
  valorTotal?: number;
  valorEntrada?: number;
  valorParcela?: number;
  data: {
    propostaGerada?: boolean;
    dataGeracao?: string;
    pdfUrl?: string; // Pode ser link temporário ou expirado
    codigoProposta?: string;
    validadeDias?: string;
    garantiaMeses?: string;
    [key: string]: unknown;
  };
  // eslint-disable-next-line no-unused-vars
  onDataChange: (newData: Record<string, unknown>) => void;
  readOnly?: boolean;
}

/**
 * Determina o tipo de PDF baseado no código da OS
 */
function getPDFType(tipoOS?: string): PDFType {
  if (!tipoOS) return 'proposta'; // Default para obras

  const tipoNormalizado = tipoOS.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // OS 5 - Assessoria Anual
  if (tipoNormalizado === 'OS05' || tipoNormalizado === 'OS5') {
    return 'proposta-ass-anual';
  }

  // OS 6 - Assessoria Pontual (Laudo)
  if (tipoNormalizado === 'OS06' || tipoNormalizado === 'OS6') {
    return 'proposta-ass-pontual';
  }

  // OS 1-4 - Obras
  return 'proposta';
}

export function StepGerarProposta({
  osId,
  tipoOS,
  etapa1Data = {},
  etapa2Data = {},
  etapa7Data = {},
  etapa8Data = {},
  valorTotal = 0,
  valorEntrada = 0,
  valorParcela = 0,
  data,
  onDataChange,
  readOnly = false
}: StepGerarPropostaProps) {
  // Hook de geração de PDF
  const { generating, generate } = usePDFGeneration();

  // Estado local do PDF gerado
  const [pdfUrl, setPdfUrl] = useState<string | null>(data.pdfUrl || null);

  // ✅ Estado separado para URL de exibição (que precisa ser signed e válida)
  const [displayUrl, setDisplayUrl] = useState<string | null>(data.pdfUrl || null);

  // ✅ PERSISTÊNCIA: Sincronizar pdfUrl quando data muda
  useEffect(() => {
    if (data.pdfUrl && data.pdfUrl !== pdfUrl) {
      setPdfUrl(data.pdfUrl);
    }
  }, [data.pdfUrl]);

  // ✅ Efeito de Recuperação Inteligente:
  // Se a proposta foi gerada mas a URL expirou (406), busca path no banco e gera nova URL fresca
  useEffect(() => {
    const refreshUrl = async () => {
      // Se sabe que tem proposta gerada + osId
      if (data.propostaGerada && osId) {
        try {
          // 1. Tentar buscar o documento mais recente no banco para pegar o path real
          // O Edge Function salva com tipo=proposta no bucket 'uploads'
          const { data: doc } = await supabase
            .from('os_documentos')
            .select('caminho_arquivo, criado_em')
            .eq('os_id', osId)
            .eq('tipo', 'proposta')
            .order('criado_em', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (doc && doc.caminho_arquivo) {
            // 2. Gerar URL assinada usando o bucket 'uploads' (usado pelo Edge Function)
            const { data: signed } = await supabase.storage
              .from('uploads') // IMPORTANTE: Edge Function usa 'uploads', não 'os-documents'
              .createSignedUrl(doc.caminho_arquivo, 3600);

            if (signed?.signedUrl) {
              setDisplayUrl(signed.signedUrl);
              return; // Sucesso, nova URL definida
            }
          }
        } catch (err) {
          console.error('Erro ao buscar URL fresca da proposta:', err);
        }
      }

      // Fallback: Se não conseguiu gerar nova, usa a salva (que pode estar expirada)
      if (data.pdfUrl) {
        setDisplayUrl(data.pdfUrl);
      }
    };

    refreshUrl();
  }, [data.propostaGerada, osId, data.pdfUrl]);

  // Validar se osId é um UUID válido
  const osIdValido = osId && isValidUUID(osId);

  // Determinar tipo de PDF (da prop direta ou do etapa2Data)
  const tipoOSFinal = tipoOS || etapa2Data?.tipoOS || '';
  const pdfType = getPDFType(tipoOSFinal);

  // Construir dados da proposta baseado no tipo
  const cpfCnpjLimpo = (etapa1Data.cpfCnpj || '').replace(/\D/g, '');

  // 🛠️ FIX: Extrair campos de endereço corretamente
  // etapa1Data pode ter campos flat (rua, bairro) ou objeto aninhado (endereco.rua)
  const enderecoObj = etapa1Data.endereco as Record<string, string> | undefined;
  const rua = typeof etapa1Data.rua === 'string' ? etapa1Data.rua : (enderecoObj?.rua || '');
  const numero = typeof etapa1Data.numero === 'string' ? etapa1Data.numero : (enderecoObj?.numero || '');
  const bairro = typeof etapa1Data.bairro === 'string' ? etapa1Data.bairro : (enderecoObj?.bairro || '');
  const cidade = typeof etapa1Data.cidade === 'string' ? etapa1Data.cidade : (enderecoObj?.cidade || '');
  const estado = typeof etapa1Data.estado === 'string' ? etapa1Data.estado : (enderecoObj?.estado || '');

  // Formatar endereço completo como string
  const enderecoCompleto = [rua, numero].filter(Boolean).join(', ');

  // Dados comuns
  const propostaData: Record<string, unknown> = {
    clienteCpfCnpj: cpfCnpjLimpo,
    // Passar dados do cliente para garantir que o PDF use os dados mais recentes do frontend
    clienteNome: String(etapa1Data.nome || ''),
    clienteEmail: String(etapa1Data.email || ''),
    clienteTelefone: String(etapa1Data.telefone || ''),
    clienteEndereco: enderecoCompleto, // ✅ FIX: Agora é string
    clienteBairro: bairro, // ✅ FIX: Agora é string
    clienteCidade: cidade, // ✅ FIX: Agora é string
    clienteEstado: estado, // ✅ FIX: Agora é string
    clienteResponsavel: String(etapa1Data.nomeResponsavel || ''),
    quantidadeUnidades: String(etapa1Data.qtdUnidades || '0'),
    quantidadeBlocos: String(etapa1Data.qtdBlocos || '0'),
  };

  // Dados específicos por tipo
  if (pdfType === 'proposta') {
    // Obras (OS 1-4) - usa estrutura de memorial com etapas principais
    propostaData.dadosFinanceiros = {
      precoFinal: valorTotal.toString(),
      valorEntrada: valorEntrada.toString(),
      valorParcela: valorParcela.toString(),
      numeroParcelas: etapa8Data.numeroParcelas || '1',
      percentualEntrada: etapa8Data.percentualEntrada || '0',
      percentualImposto: etapa8Data.percentualImposto || '0',
    };

    // Mapear dados do memorial (cronograma)
    // O backend espera dadosCronograma com etapasPrincipais
    propostaData.dadosCronograma = {
      etapasPrincipais: etapa7Data.etapasPrincipais || [],
      preparacaoArea: etapa7Data.preparacaoArea || 0,
      planejamentoInicial: etapa7Data.planejamentoInicial || 0,
      logisticaTransporte: etapa7Data.logisticaTransporte || 0,
    };
  } else {
    // Assessoria (OS 5-6) - usa estrutura simplificada
    // 🛠️ FIX: Converter dados do formato do formulário para o formato esperado pelo PDF

    // Objetivo: string → string[] para OS-05, string para OS-06
    const objetivoRaw = etapa7Data.objetivo || '';
    const isOS06 = pdfType === 'proposta-ass-pontual';

    // Para OS-05: converte para array; Para OS-06: mantém como string
    const objetivoArray: string[] = typeof objetivoRaw === 'string'
      ? objetivoRaw
        .split(/[\n\r•;]/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
      : Array.isArray(objetivoRaw) ? objetivoRaw : [];

    // Metodologia: string → string[] (split por linhas ou bullets)
    const metodologiaRaw = etapa7Data.metodologia || '';
    const metodologiaArray: string[] = typeof metodologiaRaw === 'string'
      ? metodologiaRaw
        .split(/[\n\r•]/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
      : Array.isArray(metodologiaRaw) ? metodologiaRaw : [];

    // Especificações: {descricao} → {item, descricao}
    const especsRaw = etapa7Data.especificacoesTecnicas || [];
    const especsArray = Array.isArray(especsRaw)
      ? especsRaw.map((espec: unknown, idx: number) => ({
        item: idx + 1,
        descricao: typeof espec === 'object' && espec !== null && 'descricao' in espec
          ? (espec as { descricao: string }).descricao
          : String(espec),
      }))
      : [];

    // Prazo: Formatar conforme o tipo de OS
    const prazoRaw = etapa7Data.prazo as Record<string, unknown> || {};

    // Prazo formatado baseado no tipo de OS
    const prazoFormatado = isOS06
      ? {
        // OS-06 (Pontual): Dias úteis
        planejamentoInicial: parseInt(String(prazoRaw.planejamentoInicial || 0)) || 0,
        logisticaTransporte: parseInt(String(prazoRaw.logisticaTransporte || 0)) || 0,
        levantamentoCampo: parseInt(String(prazoRaw.levantamentoCampo || 0)) || 0,
        composicaoLaudo: parseInt(String(prazoRaw.composicaoLaudo || 0)) || 0,
        apresentacaoCliente: parseInt(String(prazoRaw.apresentacaoCliente || 0)) || 0,
      }
      : {
        // OS-05 (Anual): Horário de funcionamento
        horarioFuncionamento: prazoRaw.diasSemana
          ? `${prazoRaw.diasSemana} de ${prazoRaw.horarioInicio || '08:00'} às ${prazoRaw.horarioFim || '18:00'}`
          : 'Segunda a sexta de 08:00 às 18:00',
        suporteEmergencial: (prazoRaw.suporteEmergencial as string) || 'Suporte técnico emergencial - atuação máxima de 2h',
      };

    // Objetivo: array para OS-05, string para OS-06
    propostaData.objetivo = isOS06 ? (objetivoRaw || '') : objetivoArray;
    propostaData.especificacoesTecnicas = especsArray;
    propostaData.metodologia = metodologiaArray;
    propostaData.garantia = etapa7Data.garantia || '';
    propostaData.prazo = prazoFormatado;
    propostaData.precificacao = {
      valorMaterialMaoDeObra: parseFloat((etapa8Data.custoBase || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || valorTotal,
      percentualImposto: parseFloat(etapa8Data.percentualImposto || '14') || 14,
    };

    // Pagamento: diferente para OS-05 (mensal) e OS-06 (parcelado)
    if (isOS06) {
      propostaData.pagamento = {
        percentualEntrada: parseFloat(etapa8Data.percentualEntrada || '40') || 40,
        numeroParcelas: parseInt(etapa8Data.numeroParcelas || '2') || 2,
      };
    } else {
      propostaData.pagamento = {
        valorMensal: valorTotal,
        desconto: '3% de desconto para pagamento no quinto dia útil do Mês',
      };
    }
  }

  // Handler para gerar PDF
  const handleGeneratePDF = async () => {
    if (!osIdValido) {
      toast.error('ID da OS inválido');
      return;
    }

    try {
      console.log('[StepGerarProposta] Gerando PDF:', { pdfType, tipoOSFinal, osId });
      const result = await generate(pdfType, osId, propostaData);

      if (result?.success && result.url) {
        // Atualizar estados locais
        setPdfUrl(result.url);
        setDisplayUrl(result.url); // Usar link direto inicialmente

        // Salvar dados da etapa com persistência (incluindo valores financeiros)
        onDataChange({
          ...data,
          propostaGerada: true,
          dataGeracao: new Date().toISOString().split('T')[0],
          pdfUrl: result.url,
          pdfMetadata: result.metadata,
          // ✅ Persistir valores financeiros para referência futura
          valorTotal: valorTotal,
          valorEntrada: valorEntrada,
          valorParcela: valorParcela,
        });

        // NOTA: O Edge Function JÁ DEVE salvar em os_documentos.
        // Se quisermos redundância, ok, mas cuidado com duplicação.
        // Vamos confiar no Edge Function + Busca na montagem.

        toast.success('Proposta gerada com sucesso!');
      } else {
        toast.error(result?.error || 'Erro ao gerar proposta');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar proposta. Tente novamente.');
    }
  };

  // Nome do arquivo para download
  const filename = `proposta-${osId?.substring(0, 8) || 'draft'}.pdf`;

  // Labels por tipo
  const tipoLabel = pdfType === 'proposta'
    ? 'Proposta de Obra'
    : pdfType === 'proposta-ass-anual'
      ? 'Proposta de Assessoria Anual'
      : 'Proposta de Assessoria Pontual';

  return (
    <div className="space-y-4">
      {/* Header com Título e Botão */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Proposta Comercial</h3>
          {data.propostaGerada && (
            <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
              <CheckCircle className="h-3 w-3" />
              Gerada em {data.dataGeracao}
            </span>
          )}
        </div>

        {/* Botão Gerar - Canto Superior Direito */}
        {osIdValido && !readOnly && (
          <Button
            onClick={handleGeneratePDF}
            disabled={generating}
            className="min-w-[160px]"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {pdfUrl ? 'Gerar Novamente' : 'Gerar Documento'}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Alerta de osId inválido */}
      {!osIdValido && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro:</strong> ID da OS não está disponível ou é inválido.
            Certifique-se de que a OS foi criada corretamente nas etapas anteriores.
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta informativo (só mostra se não tem PDF) */}
      {!pdfUrl && osIdValido && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Clique no botão <strong>"Gerar Documento"</strong> para criar a {tipoLabel.toLowerCase()}
            automaticamente com base nas informações preenchidas nas etapas anteriores.
          </AlertDescription>
        </Alert>
      )}

      {/* Visualizador de PDF Embarcado */}
      {/* Usa displayUrl (assinado/link real) se disponível, senão pdfUrl */}
      {(displayUrl || pdfUrl) ? (
        <PDFViewerEmbedded
          pdfUrl={(displayUrl || pdfUrl) as string}
          filename={filename}
          height={600}
          showToolbar={true}
          className="mt-4"
        />
      ) : (
        /* Estado Vazio - Antes de Gerar */
        <Card className="border-dashed">
          <CardHeader className="text-center pb-2">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
            <CardTitle className="text-muted-foreground font-normal">
              Nenhuma proposta gerada ainda
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              O documento será exibido aqui após a geração.
            </p>
            <p className="mt-2">
              Tipo de documento: <strong>{tipoLabel}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info sobre dados utilizados (colapsável para debug) */}
      {pdfUrl && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">
            Dados utilizados na proposta
          </summary>
          <pre className="mt-2 p-3 bg-muted rounded-md overflow-x-auto">
            {JSON.stringify({
              osId: (osId?.substring(0, 8) || 'N/A') + '...',
              tipoOS: tipoOSFinal || 'N/A',
              pdfType,
              clienteCpfCnpj: cpfCnpjLimpo ? `***${cpfCnpjLimpo.slice(-4)}` : 'N/A',
              valorTotal,
              valorEntrada,
              valorParcela,
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
