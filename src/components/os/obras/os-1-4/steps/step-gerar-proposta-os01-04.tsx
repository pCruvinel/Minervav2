import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import '@/styles/print-proposal.css';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Eye, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';
import { PDFDownloadButton } from '@/components/pdf/pdf-download-button';
import { toast } from '@/lib/utils/safe-toast';

interface EtapaPrincipal {
  nome: string;
  subetapas: Array<{
    nome: string;
    m2: string;
    diasUteis: string;
    total: string;
  }>;
}

interface StepGerarPropostaOS0104Props {
  osId: string;

  // Dados da Etapa 1 (Cliente/Lead)
  etapa1Data: {
    leadId?: string;
    nome?: string;
    cpfCnpj?: string;
    telefone?: string;
    email?: string;
    nomeResponsavel?: string;
    qtdUnidades?: string;
    qtdBlocos?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };

  // Dados da Etapa 2 (Tipo OS)
  etapa2Data: {
    tipoOS: string;
  };

  // Dados da Etapa 7 (Memorial de Escopo)
  etapa7Data: {
    objetivo: string;
    etapasPrincipais: EtapaPrincipal[];
    planejamentoInicial: string;
    logisticaTransporte: string;
    preparacaoArea: string;
  };

  // Dados da Etapa 8 (Precificação)
  etapa8Data: {
    percentualEntrada: string;
    numeroParcelas: string;
  };

  // Valores calculados da precificação
  valorTotal: number;
  valorEntrada: number;
  valorParcela: number;

  // Dados próprios da etapa
  data: {
    propostaGerada: boolean;
    dataGeracao: string;
    pdfUrl?: string; // URL assinada do PDF
    codigoProposta: string;
    validadeDias: string;
    garantiaMeses: string;
    descricaoServicos?: string;
    valorProposta?: string;
    prazoProposta?: string;
    condicoesPagamento?: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepGerarPropostaOS0104({
  osId,
  etapa1Data,
  etapa2Data,
  etapa7Data,
  etapa8Data,
  valorTotal,
  valorEntrada,
  valorParcela,
  data,
  onDataChange,
  readOnly = false,
}: StepGerarPropostaOS0104Props) {
  // Hook para geração de PDF
  const { generating, error, generate } = usePDFGeneration();

  // Inicializar com URL salva se existir
  const [pdfUrl, setPdfUrl] = useState<string | null>(data.pdfUrl || null);

  // Sincronizar estado local quando prop muda
  useEffect(() => {
    if (data.pdfUrl && data.pdfUrl !== pdfUrl) {
      setPdfUrl(data.pdfUrl);
    }
  }, [data.pdfUrl]);

  // Validar campos obrigatórios da Etapa 1 (apenas os essenciais para a proposta)
  const validarDadosEtapa1 = () => {
    const camposFaltantes: string[] = [];

    // Campos essenciais para a proposta comercial
    if (!etapa1Data.nome?.trim()) camposFaltantes.push('Nome/Razão Social');
    if (!etapa1Data.cpfCnpj?.trim()) camposFaltantes.push('CPF/CNPJ');
    if (!etapa1Data.telefone?.trim()) camposFaltantes.push('Telefone');
    if (!etapa1Data.email?.trim()) camposFaltantes.push('E-mail');

    return {
      valido: camposFaltantes.length === 0,
      camposFaltantes,
    };
  };

  const validacao = validarDadosEtapa1();

  // Calcular prazo total
  const calcularPrazoTotal = (): number => {
    const planejamento = parseFloat(etapa7Data.planejamentoInicial) || 0;
    const logistica = parseFloat(etapa7Data.logisticaTransporte) || 0;
    const preparacao = parseFloat(etapa7Data.preparacaoArea) || 0;

    // Verificação de segurança para etapasPrincipais
    const execucao = etapa7Data.etapasPrincipais?.reduce((total, etapa) => {
      return total + (etapa.subetapas?.reduce((subtotal, sub) => {
        return subtotal + (parseFloat(sub.diasUteis) || 0);
      }, 0) || 0);
    }, 0) || 0;

    return planejamento + logistica + preparacao + execucao;
  };

  const prazoTotal = calcularPrazoTotal();

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Gerar código da proposta (se não existir)
  const gerarCodigoProposta = () => {
    if (!data.codigoProposta) {
      const codigo = `PROP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
      onDataChange({ ...data, codigoProposta: codigo });
    }
  };

  // ✅ NOVO: Validação preventiva com feedback específico
  const handleGerarPropostaSegura = async () => {
    // Validar CNPJ
    if (!etapa1Data.cpfCnpj || etapa1Data.cpfCnpj.trim() === '') {
      toast.error('CNPJ do cliente não foi preenchido na Etapa 1');
      return;
    }

    // Validar se CNPJ é válido (remover máscara e validar)
    const cpfCnpjLimpo = etapa1Data.cpfCnpj.replace(/\D/g, '');
    if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
      toast.error('CNPJ do cliente está em formato inválido');
      return;
    }

    // Validar preço
    if (!valorTotal || valorTotal <= 0) {
      toast.error('Valor da proposta deve ser maior que zero. Verifique se preencheu os dados do Memorial (Etapa 7) e Precificação (Etapa 8)');
      return;
    }

    // Validar dados do memorial
    if (!etapa7Data.etapasPrincipais || etapa7Data.etapasPrincipais.length === 0) {
      toast.error('Preencha o Memorial de Escopo (Etapa 7) antes de gerar a proposta');
      return;
    }

    // Tudo validado, chamar generate com dados
    await handleGerarProposta();
  };

  const handleGerarProposta = async () => {
    console.log('[Step 9] ======== INÍCIO GERAÇÃO PROPOSTA ========');
    gerarCodigoProposta();

    // Gerar descrição dos serviços baseada nas etapas
    const descricaoServicos = gerarDescricaoServicos();

    const cpfCnpjLimpo = etapa1Data.cpfCnpj?.replace(/\D/g, '') || '';

    // Salvar dados locais primeiro
    onDataChange({
      ...data,
      propostaGerada: false, // Manter false até gerar PDF
      descricaoServicos,
      valorProposta: formatCurrency(valorTotal),
      prazoProposta: prazoTotal.toString(),
      condicoesPagamento: `Entrada de ${etapa8Data.percentualEntrada}% (${formatCurrency(valorEntrada)}) em até 7 dias após assinatura do contrato. Demais pagamentos parcelados em ${etapa8Data.numeroParcelas}x de ${formatCurrency(valorParcela)}.`,
    });

    try {
      // Montar payload completo para proposta-template.tsx
      const payload = {
        // Dados do cliente (Etapa 1)
        codigoOS: osId.slice(0, 8).toUpperCase(),
        dataEmissao: new Date().toISOString(),
        validadeProposta: parseInt(data.validadeDias) || 30,
        tituloProposta: etapa2Data.tipoOS === 'OS-01' ? 'PERÍCIA DE FACHADA' :
          etapa2Data.tipoOS === 'OS-02' ? 'REVITALIZAÇÃO DE FACHADA' :
            etapa2Data.tipoOS === 'OS-03' ? 'REFORÇO ESTRUTURAL' : 'SERVIÇOS DE ENGENHARIA',
        clienteCpfCnpj: cpfCnpjLimpo,
        clienteNome: etapa1Data.nome || '',
        clienteEmail: etapa1Data.email || '',
        clienteTelefone: etapa1Data.telefone || '',
        clienteEndereco: etapa1Data.endereco || '',
        clienteBairro: etapa1Data.bairro || '',
        clienteCidade: etapa1Data.cidade || '',
        clienteEstado: etapa1Data.estado || '',
        clienteResponsavel: etapa1Data.nomeResponsavel || '',
        quantidadeUnidades: parseInt(etapa1Data.qtdUnidades || '0') || 1,
        quantidadeBlocos: parseInt(etapa1Data.qtdBlocos || '0') || 1,

        // Objetivo do serviço (para seção 1 do PDF)
        objetivo: etapa7Data.objetivo || gerarDescricaoServicos(),

        // Dados financeiros (Etapa 8)
        dadosFinanceiros: {
          precoFinal: valorTotal,
          numeroParcelas: parseInt(etapa8Data.numeroParcelas) || 1,
          percentualEntrada: parseFloat(etapa8Data.percentualEntrada) || 40,
          percentualImposto: 14, // Default
          percentualLucro: 15, // Default
          percentualImprevisto: 5, // Default
        },

        // Dados do cronograma (Etapa 7 - Memorial)
        dadosCronograma: {
          objetivo: etapa7Data.objetivo || '',
          preparacaoArea: parseFloat(etapa7Data.preparacaoArea) || 0,
          planejamentoInicial: parseFloat(etapa7Data.planejamentoInicial) || 0,
          logisticaTransporte: parseFloat(etapa7Data.logisticaTransporte) || 0,
          etapasPrincipais: (etapa7Data.etapasPrincipais || []).map(etapa => ({
            nome: etapa.nome,
            subetapas: (etapa.subetapas || []).map(sub => ({
              nome: sub.nome,
              m2: sub.m2 || '',
              quantidade: parseFloat(sub.m2) || 1,
              unidade: 'm²',
              total: parseFloat(sub.total) || 0,
              diasUteis: parseFloat(sub.diasUteis) || 0,
            })),
          })),
        },

        // Garantias
        garantias: [
          `${data.garantiaMeses || '12'} meses de garantia para serviços estruturais`,
          '6 meses de garantia para acabamentos',
          'Suporte técnico durante todo o período de garantia',
        ],
      };

      const result = await generate('proposta', osId, payload);

      if (result && result.success && result.url) {
        setPdfUrl(result.url);

        // ✅ Marcar como gerada E SALVAR URL
        onDataChange({
          ...data,
          propostaGerada: true,
          dataGeracao: new Date().toLocaleDateString('pt-BR'),
          pdfUrl: result.url // Persistir URL (mesmo que temporária, ajuda no UX imediato)
        });

        toast.success('Proposta gerada com sucesso!');
      } else {
        toast.error(`Erro ao gerar proposta: ${result?.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      console.error('Erro ao gerar proposta:', err);
      toast.error('Erro ao gerar proposta. Tente novamente.');
    }
  };

  // Gerar descrição automática dos serviços
  const gerarDescricaoServicos = (): string => {
    const tipoServico = etapa2Data.tipoOS === 'OS-01' ? 'Diagnóstico de Fachada' :
      etapa2Data.tipoOS === 'OS-02' ? 'Laudo Estrutural' :
        etapa2Data.tipoOS === 'OS-03' ? 'Impermeabilização' :
          etapa2Data.tipoOS === 'OS-04' ? 'Reforma/Recuperação Estrutural' : 'Serviço';

    const servicosAgrupados = etapa7Data.etapasPrincipais?.map(etapa =>
      `${etapa.nome}: ${etapa.subetapas?.map(sub => sub.nome).join(', ') || ''}`
    ).join('. ') || 'Serviços não especificados';

    return `Serviços de ${tipoServico}. ${servicosAgrupados}. Prazo total de execução: ${prazoTotal} dias úteis. Valor total: ${formatCurrency(valorTotal)}.`;
  };


  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Preencha os dados complementares e gere a proposta comercial com base nas informações das etapas anteriores.
        </AlertDescription>
      </Alert>

      {/* Formulário de dados complementares */}
      {!data.propostaGerada && (
        <Card>
          <CardHeader>
            <CardTitle>Dados Complementares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Validação dos dados da Etapa 1 */}
            {validacao.valido ? (
              <Alert className="bg-success/5 border-success/20">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  ✅ Todos os dados necessários foram preenchidos
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" className="bg-warning/5 border-warning/30">
                <AlertCircle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-warning">
                  <div>
                    <strong>Atenção:</strong> Preencha os dados essenciais do cliente antes de gerar a proposta:
                  </div>
                  <ul className="list-disc list-inside mt-2 ml-2 text-sm space-y-1">
                    {validacao.camposFaltantes.map((campo, index) => (
                      <li key={index}>{campo}</li>
                    ))}
                  </ul>
                  <div className="mt-2 text-xs text-warning">
                    💡 Os demais dados do endereço podem ser complementados posteriormente.
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Exibir erros de geração de PDF */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao gerar PDF: {typeof error === 'string' ? error : error.message || 'Erro desconhecido'}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validadeDias">
                  Validade da Proposta (dias) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="validadeDias"
                  type="number"
                  value={data.validadeDias}
                  onChange={(e) => !readOnly && onDataChange({ ...data, validadeDias: e.target.value })}
                  placeholder="Ex: 30"
                  disabled={readOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="garantiaMeses">
                  Garantia (meses) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="garantiaMeses"
                  type="number"
                  value={data.garantiaMeses}
                  onChange={(e) => !readOnly && onDataChange({ ...data, garantiaMeses: e.target.value })}
                  placeholder="Ex: 12"
                  disabled={readOnly}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão Gerar Proposta */}
      {!data.propostaGerada && (
        <div className="flex justify-center">
          <PrimaryButton
            onClick={handleGerarPropostaSegura}
            disabled={readOnly || !data.validadeDias || !data.garantiaMeses || !validacao.valido || generating}
            className="px-8"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Gerar Proposta Comercial
              </>
            )}
          </PrimaryButton>
        </div>
      )}

      {/* Card de Sucesso */}
      {data.propostaGerada && (
        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <div className="text-sm font-medium">Proposta gerada com sucesso!</div>
                  <div className="text-xs text-muted-foreground">
                    Código: {data.codigoProposta} | Data: {data.dataGeracao}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Botão de Visualizar - agora usa pdfUrl se disponível */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(pdfUrl || `/os/proposta/${data.codigoProposta}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar Proposta
                </Button>

                {/* Botão de Download */}
                {pdfUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = pdfUrl;
                      link.download = `proposta-${data.codigoProposta}.pdf`;
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}