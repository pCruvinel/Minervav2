import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import '@/styles/print-proposal.css';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Eye, CheckCircle, AlertCircle } from 'lucide-react';

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

  // Validar campos obrigatórios da Etapa 1 (apenas os essenciais para a proposta)
  const validarDadosEtapa1 = () => {
    const camposFaltantes: string[] = [];

    // Campos essenciais para a proposta comercial
    if (!etapa1Data.nome?.trim()) camposFaltantes.push('Nome/Razão Social');
    if (!etapa1Data.cpfCnpj?.trim()) camposFaltantes.push('CPF/CNPJ');
    if (!etapa1Data.telefone?.trim()) camposFaltantes.push('Telefone');
    if (!etapa1Data.email?.trim()) camposFaltantes.push('E-mail');

    // Campos importantes mas não críticos para a proposta
    // if (!etapa1Data.nomeResponsavel?.trim()) camposFaltantes.push('Nome do Responsável');
    // if (!etapa1Data.endereco?.trim()) camposFaltantes.push('Endereço (Rua)');
    // if (!etapa1Data.numero?.trim()) camposFaltantes.push('Número');
    // if (!etapa1Data.bairro?.trim()) camposFaltantes.push('Bairro');
    // if (!etapa1Data.cidade?.trim()) camposFaltantes.push('Cidade');
    // if (!etapa1Data.estado?.trim()) camposFaltantes.push('Estado');

    return {
      valido: camposFaltantes.length === 0,
      camposFaltantes,
    };
  };

  const validacao = validarDadosEtapa1();

  // Gerar proposta automaticamente ao montar o componente (se ainda não foi gerada)
  useEffect(() => {
    if (!data.propostaGerada && validacao.valido && data.validadeDias && data.garantiaMeses) {
      handleGerarProposta();
    }
  }, [data.propostaGerada, validacao.valido, data.validadeDias, data.garantiaMeses]);

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

  // Calcular valores por unidade
  const qtdUnidadesNum = parseFloat(etapa1Data.qtdUnidades || '0') || 0;
  const entradaPorUnidade = qtdUnidadesNum > 0 ? valorEntrada / qtdUnidadesNum : 0;
  const parcelaPorUnidade = qtdUnidadesNum > 0 ? valorParcela / qtdUnidadesNum : 0;

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

  const handleGerarProposta = () => {
    gerarCodigoProposta();

    // Gerar descrição dos serviços baseada nas etapas
    const descricaoServicos = gerarDescricaoServicos();

    // Salvar dados obrigatórios do schema da Etapa 9
    onDataChange({
      ...data,
      propostaGerada: true,
      dataGeracao: new Date().toLocaleDateString('pt-BR'),
      descricaoServicos,
      valorProposta: formatCurrency(valorTotal),
      prazoProposta: prazoTotal.toString(),
      condicoesPagamento: `Entrada de ${etapa8Data.percentualEntrada}% (${formatCurrency(valorEntrada)}) em até 7 dias após assinatura do contrato. Demais pagamentos parcelados em ${etapa8Data.numeroParcelas}x de ${formatCurrency(valorParcela)}.`,
    });

    // Abrir proposta em nova aba
    const propostaUrl = `/os/proposta/${data.codigoProposta}`;
    window.open(propostaUrl, '_blank');
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
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  ✅ Todos os dados necessários foram preenchidos
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" className="bg-yellow-50 border-yellow-300">
                <AlertCircle className="h-4 w-4 text-yellow-700" />
                <AlertDescription className="text-yellow-800">
                  <div>
                    <strong>Atenção:</strong> Preencha os dados essenciais do cliente antes de gerar a proposta:
                  </div>
                  <ul className="list-disc list-inside mt-2 ml-2 text-sm space-y-1">
                    {validacao.camposFaltantes.map((campo, index) => (
                      <li key={index}>{campo}</li>
                    ))}
                  </ul>
                  <div className="mt-2 text-xs text-yellow-700">
                    💡 Os demais dados do endereço podem ser complementados posteriormente.
                  </div>
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
            onClick={handleGerarProposta}
            disabled={readOnly || !data.validadeDias || !data.garantiaMeses || !validacao.valido}
            className="px-8"
          >
            <FileText className="h-4 w-4 mr-2" />
            Gerar Proposta Comercial
          </PrimaryButton>
        </div>
      )}

      {/* Card de Sucesso */}
      {data.propostaGerada && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium">Proposta gerada com sucesso!</div>
                  <div className="text-xs text-muted-foreground">
                    Código: {data.codigoProposta} | Data: {data.dataGeracao}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/os/proposta/${data.codigoProposta}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar Proposta
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}