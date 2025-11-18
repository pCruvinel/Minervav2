import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { PrimaryButton } from '../../../ui/primary-button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Separator } from '../../../ui/separator';
import { FileText, Download, Eye, EyeOff, Printer, CheckCircle, AlertCircle } from 'lucide-react';

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
    nome: string;
    cpfCnpj: string;
    telefone: string;
    email: string;
    nomeResponsavel: string;
    qtdUnidades: string;
    qtdBlocos: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
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
  };
  onDataChange: (data: any) => void;
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
}: StepGerarPropostaOS0104Props) {
  const [showPreview, setShowPreview] = useState(false);

  // Validar campos obrigatórios da Etapa 1
  const validarDadosEtapa1 = () => {
    const camposFaltantes: string[] = [];

    if (!etapa1Data.nome) camposFaltantes.push('Nome/Razão Social');
    if (!etapa1Data.cpfCnpj) camposFaltantes.push('CPF/CNPJ');
    if (!etapa1Data.telefone) camposFaltantes.push('Telefone');
    if (!etapa1Data.email) camposFaltantes.push('E-mail');
    if (!etapa1Data.nomeResponsavel) camposFaltantes.push('Nome do Responsável');
    if (!etapa1Data.endereco) camposFaltantes.push('Endereço (Rua)');
    if (!etapa1Data.numero) camposFaltantes.push('Número');
    if (!etapa1Data.bairro) camposFaltantes.push('Bairro');
    if (!etapa1Data.cidade) camposFaltantes.push('Cidade');
    if (!etapa1Data.estado) camposFaltantes.push('Estado');
    // Nota: qtdUnidades e qtdBlocos são opcionais

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
    const execucao = etapa7Data.etapasPrincipais.reduce((total, etapa) => {
      return total + etapa.subetapas.reduce((subtotal, sub) => {
        return subtotal + (parseFloat(sub.diasUteis) || 0);
      }, 0);
    }, 0);
    return planejamento + logistica + preparacao + execucao;
  };

  const prazoTotal = calcularPrazoTotal();

  // Calcular valores por unidade
  const qtdUnidadesNum = parseFloat(etapa1Data.qtdUnidades) || 0;
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
    onDataChange({
      ...data,
      propostaGerada: true,
      dataGeracao: new Date().toLocaleDateString('pt-BR'),
    });
    setShowPreview(true);
  };

  const handleImprimir = () => {
    window.print();
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
                    <strong>Atenção:</strong> Preencha os campos obrigatórios da Etapa 1 antes de gerar a proposta:
                  </div>
                  <ul className="list-disc list-inside mt-2 ml-2 text-sm space-y-1">
                    {validacao.camposFaltantes.map((campo, index) => (
                      <li key={index}>{campo}</li>
                    ))}
                  </ul>
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
                  onChange={(e) => onDataChange({ ...data, validadeDias: e.target.value })}
                  placeholder="Ex: 30"
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
                  onChange={(e) => onDataChange({ ...data, garantiaMeses: e.target.value })}
                  placeholder="Ex: 12"
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
            disabled={!data.validadeDias || !data.garantiaMeses || !validacao.valido}
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
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showPreview ? 'Ocultar' : 'Visualizar'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleImprimir}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
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

      {/* Preview da Proposta */}
      {data.propostaGerada && showPreview && (
        <Card className="print:shadow-none">
          <CardContent className="p-8 space-y-6">
            {/* Cabeçalho em 2 Colunas */}
            <div className="grid grid-cols-2 gap-8 pb-6 border-b">
              {/* Coluna Esquerda */}
              <div className="space-y-4">
                {/* Logo/Empresa */}
                <div className="mb-4">
                  <div className="text-xl font-medium" style={{ color: '#D3AF37' }}>
                    MINERVA ENGENHARIA
                  </div>
                </div>

                {/* Informações do Cliente */}
                <div>
                  <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                    👤 Informações do Cliente
                  </h2>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cliente:</span>{' '}
                      <span className="font-medium">{etapa1Data.nome}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Responsável:</span>{' '}
                      <span className="font-medium">{etapa1Data.nomeResponsavel}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CPF/CNPJ:</span>{' '}
                      <span className="font-medium">{etapa1Data.cpfCnpj}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Telefone:</span>{' '}
                      <span className="font-medium">{etapa1Data.telefone}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bairro:</span>{' '}
                      <span className="font-medium">{etapa1Data.bairro}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">E-mail:</span>{' '}
                      <span className="font-medium">{etapa1Data.email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Endereço:</span>{' '}
                      <span className="font-medium">{etapa1Data.endereco}{etapa1Data.numero ? `, ${etapa1Data.numero}` : ''}{etapa1Data.complemento ? ` - ${etapa1Data.complemento}` : ''}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cidade/Estado:</span>{' '}
                      <span className="font-medium">{etapa1Data.cidade}/{etapa1Data.estado}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Direita */}
              <div className="space-y-4">
                {/* Informações da Proposta */}
                <div>
                  <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                    📄 Informações da Proposta
                  </h2>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Código da Proposta:</span>{' '}
                      <span className="font-medium">{data.codigoProposta}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data de Emissão:</span>{' '}
                      <span className="font-medium">{data.dataGeracao}</span>
                    </div>
                  </div>
                </div>

                {/* Detalhes da Edificação */}
                <div className="pt-4">
                  <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                    🏢 Detalhes da Edificação
                  </h2>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quantidade de Unidades:</span>{' '}
                      <span className="font-medium">{etapa1Data.qtdUnidades} unidades autônomas</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantidade de Blocos:</span>{' '}
                      <span className="font-medium">{etapa1Data.qtdBlocos} blocos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 1. Detalhes do Projeto */}
            <div className="space-y-3">
              <h2 className="font-medium pb-2 border-b">1. DETALHES DO PROJETO (OBRA)</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Objeto:</span>{' '}
                  <span className="font-medium">
                    Proposta de {etapa2Data.tipoOS === 'OS-01' ? 'Diagnóstico de Fachada' : 
                                etapa2Data.tipoOS === 'OS-02' ? 'Laudo Estrutural' :
                                etapa2Data.tipoOS === 'OS-03' ? 'Impermeabilização' :
                                etapa2Data.tipoOS === 'OS-04' ? 'Reforma/Recuperação Estrutural' : 'Serviço'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Objetivo:</span>{' '}
                  <span className="font-medium">{etapa7Data.objetivo}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Prazo Total:</span>{' '}
                  <span className="font-medium">{prazoTotal} dias úteis</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Garantia:</span>{' '}
                  <span className="font-medium">{data.garantiaMeses} meses</span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Seguro de Obra incluso</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Serviço garantido por nota fiscal e emissão de ART (CREA-MA)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Garantia conforme NBR 15571-1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Especificações Técnicas */}
            <div className="space-y-3">
              <h2 className="font-medium pb-2 border-b">2. ESPECIFICAÇÕES TÉCNICAS</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Descrição dos Serviços:</h3>
                  <div className="space-y-3">
                    {etapa7Data.etapasPrincipais.map((etapa, etapaIndex) => (
                      <div key={etapaIndex} className="ml-4">
                        <div className="font-medium text-sm mb-2">{etapa.nome}</div>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                          {etapa.subetapas.map((sub, subIndex) => (
                            <li key={subIndex}>
                              {sub.nome}
                              {sub.m2 && ` - ${sub.m2} m²`}
                              {sub.diasUteis && ` - ${sub.diasUteis} dias úteis`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Valores e Pagamento */}
            <div className="space-y-3">
              <h2 className="font-medium pb-2 border-b">3. VALORES E CONDIÇÕES DE PAGAMENTO</h2>
              <div className="space-y-4 text-sm">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <div className="font-medium mb-2">Valor Total (Investimento + Impostos):</div>
                  <div className="text-2xl font-medium" style={{ color: '#D3AF37' }}>
                    {formatCurrency(valorTotal)}
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-2">Parcelamento:</div>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span>Entrada ({etapa8Data.percentualEntrada}%):</span>
                      <span className="font-medium">{formatCurrency(valorEntrada)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground ml-4">
                      Prazo: 7 dias após assinatura de contrato
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <span>Parcelas:</span>
                      <span className="font-medium">
                        {etapa8Data.numeroParcelas}x de {formatCurrency(valorParcela)}
                      </span>
                    </div>
                  </div>
                </div>

                {etapa1Data.qtdUnidades && parseFloat(etapa1Data.qtdUnidades) > 0 && (
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="font-medium mb-2">Investimento por Unidade Autônoma:</div>
                    <div className="space-y-1 ml-4 text-sm">
                      <div className="flex justify-between">
                        <span>Entrada:</span>
                        <span className="font-medium">{formatCurrency(entradaPorUnidade)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cada Parcela:</span>
                        <span className="font-medium">{formatCurrency(parcelaPorUnidade)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Informações da Empresa */}
            <div className="space-y-3 border-t pt-6">
              <h2 className="font-medium pb-2 border-b">4. INFORMAÇÕES DA EMPRESA EMISSORA</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Empresa:</span> MINERVA ENGENHARIA
                </div>
                <div>
                  <span className="font-medium">Endereço:</span>{' '}
                  Av. Colares Moreira, Edifício Los Angeles, N°100, Loja 01, Renascença, São Luís - MA, CEP: 65075-144
                </div>
                <div>
                  <span className="font-medium">Telefones:</span>{' '}
                  (98) 98226-7909 / (98) 98151-3355
                </div>
                <div>
                  <span className="font-medium">Contato Digital:</span>{' '}
                  www.minerva-eng.com.br / contato@minerva-eng.com.br
                </div>
              </div>
            </div>

            {/* Assinatura */}
            <div className="pt-12 space-y-8">
              <div className="text-center">
                <div className="border-t border-neutral-300 w-64 mx-auto mb-2"></div>
                <div className="text-sm">
                  <div className="font-medium">MINERVA ENGENHARIA</div>
                  <div className="text-muted-foreground text-xs">Responsável Técnico</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}