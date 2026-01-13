'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Loader2, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';
import { PDFType } from '@/lib/types';
import { PDFViewerEmbedded } from '@/components/pdf/pdf-viewer-embedded';
import { createFileRoute } from '@tanstack/react-router';

// ============================================================
// MOCK DATA PARA TESTES - Usado apenas nesta página de debug
// ============================================================

const MOCK_OS_ID = '00000000-0000-0000-0000-000000000001';

const MOCK_DATA: Record<PDFType, Record<string, unknown>> = {
  proposta: {
    codigoOS: 'OS-001-2026',
    codigoProposta: 'PROP-001-2026',
    dataEmissao: '2026-01-08',
    validadeProposta: 30,
    tituloProposta: 'SERVIÇOS DE RECUPERAÇÃO ESTRUTURAL',
    clienteCpfCnpj: '12345678000190',
    clienteNome: 'Condomínio Edifício Teste',
    clienteEmail: 'contato@condominioteste.com.br',
    clienteTelefone: '98991234567',
    clienteEndereco: 'Rua das Flores, 123',
    clienteBairro: 'Centro',
    clienteCidade: 'São Luís',
    clienteEstado: 'MA',
    clienteResponsavel: 'João da Silva',
    quantidadeUnidades: 48,
    quantidadeBlocos: 2,
    objetivo: 'Execução de serviços de recuperação estrutural e impermeabilização em todas as áreas comuns do condomínio, seguindo normas ABNT NBR 15575.',
    dadosFinanceiros: {
      precoFinal: 150000,
      numeroParcelas: 3,
      percentualEntrada: 40,
      percentualImposto: 14,
      percentualLucro: 15,
      percentualImprevisto: 5,
    },
    dadosCronograma: {
      objetivo: 'Cronograma de execução da obra',
      preparacaoArea: 7,
      planejamentoInicial: 5,
      logisticaTransporte: 3,
      etapasPrincipais: [
        {
          nome: 'Fundações e Estrutura',
          subetapas: [
            { nome: 'Escavação e preparo do terreno', unidade: 'm³', quantidade: 100, total: 15000, diasUteis: 10 },
            { nome: 'Concretagem de fundação', unidade: 'm³', quantidade: 50, total: 25000, diasUteis: 15 },
          ]
        },
        {
          nome: 'Impermeabilização',
          subetapas: [
            { nome: 'Tratamento de fissuras', unidade: 'm²', quantidade: 200, total: 20000, diasUteis: 8 },
            { nome: 'Aplicação de manta asfáltica', unidade: 'm²', quantidade: 150, total: 30000, diasUteis: 12 },
          ]
        },
        {
          nome: 'Acabamento',
          subetapas: [
            { nome: 'Pintura e texturização', unidade: 'm²', quantidade: 300, total: 25000, diasUteis: 20 },
            { nome: 'Limpeza final', unidade: 'vb', quantidade: 1, total: 5000, diasUteis: 5 },
          ]
        },
      ],
    },
    garantias: [
      '5 anos para serviços estruturais',
      '3 anos para impermeabilização',
      '1 ano para pintura e acabamentos',
    ],
  },

  'proposta-ass-anual': {
    codigoOS: 'OS05-89076',
    dataEmissao: '2025-07-24',
    clienteNome: 'CONDOMÍNIO FIT ONE RESIDENCE',
    clienteCpfCnpj: '87221767000146',
    clienteEmail: 'fitone-3@gmail.com',
    clienteTelefone: '98981429678',
    clienteEndereco: 'AVENIDA DO ACRE, S/Nº',
    clienteBairro: 'CHÁCARA BRASIL',
    clienteCidade: 'São Luís',
    clienteEstado: 'MA',
    clienteResponsavel: 'Maria Acanha',
    quantidadeUnidades: 192,
    quantidadeBlocos: 3,
    objetivo: [
      'Consultoria, inspeção e vistoria técnica especializada disponível;',
      'Aumentar confiabilidade e diminuir indisponibilidade de equipamentos com a implantação de planos de manutenção preventivas e preditivas;',
      'Segurança, tranquilidade e economia;',
    ],
    especificacoesTecnicas: [
      { item: 1, descricao: 'Recebimento do condomínio (conciliar itens normativos e de projeto)' },
      { item: 2, descricao: 'Consultoria técnica de engenharia' },
      { item: 3, descricao: 'Procedimento de supervisão de obras no interior das unidades segundo as normas vigentes' },
      { item: 4, descricao: 'Criação de escopo para reformas e manutenções' },
      { item: 5, descricao: 'Vistorias, laudos e inspeções periódicas' },
      { item: 6, descricao: 'Elaboração e supervisão de plano de manutenção preventiva' },
      { item: 7, descricao: 'Laudos de SPDA e SPCI (para obtenção do CA do AVCB)' },
      { item: 8, descricao: 'Disponibilidade para realizar cotações de serviços de engenharia quando solicitado' },
      { item: 9, descricao: 'Elaborar pareceres técnicos' },
      { item: 10, descricao: 'Laudo de vistoria geral do condomínio (situação)' },
      { item: 11, descricao: 'Elaboração de manual de instalação de aparelhos de ar condicionado' },
      { item: 12, descricao: 'Responsabilidade técnica' },
    ],
    metodologia: [
      'Acompanhamento semanal in loco',
      'Relatório mensal de acompanhamento de plano de manutenção',
      'Mais de 35 equipamentos de diagnóstico',
    ],
    prazo: {
      horarioFuncionamento: 'Segunda a sexta de 8h às 18h',
      suporteEmergencial: 'Suporte técnico emergencial - atuação máxima de 2h',
    },
    garantia: 'A qualidade do serviço prestado é garantida integralmente na responsabilidade técnica de empresa habilitada para exercício da função, com corpo técnico formado por engenheiros especialistas na área, devidamente registrados no órgão da classe CREA-MA.',
    precificacao: {
      valorMaterialMaoDeObra: 2350.00,
      percentualImposto: 14,
      valorImposto: 329.00,
      valorTotal: 2679.00,
    },
    pagamento: {
      valorMensal: 2598.63,
      desconto: '3% de desconto para pagamento no quinto dia útil do Mês',
    },
  },

  'proposta-ass-pontual': {
    codigoOS: 'OS05-89076',
    dataEmissao: '2025-07-24',
    clienteNome: 'CONDOMÍNIO FIT ONE RESIDENCE',
    clienteCpfCnpj: '87221767000146',
    clienteEmail: 'fitone-3@gmail.com',
    clienteTelefone: '98981429678',
    clienteEndereco: 'AVENIDA DO ACRE, S/Nº',
    clienteBairro: 'CHÁCARA BRASIL',
    clienteCidade: 'São Luís',
    clienteEstado: 'MA',
    clienteResponsavel: 'Maria Acanha',
    quantidadeUnidades: 192,
    quantidadeBlocos: 3,
    objetivo: 'Diagnosticar estado atual estrutural de edificação condominial após minunciosa vistoria por meio de equipe de engenharia com vasto conhecimento e experiência na área, com auxílio de equipamentos de diagnóstico, a fim de nortear eventual necessidade de intervenção de reforço estrutural necessário.',
    especificacoesTecnicas: [
      { item: 1, descricao: 'Consultoria técnica de engenharia;' },
      { item: 2, descricao: 'Ensaios de esclerometria nos pilares visando a obtenção dos resultados de resistências do concreto;' },
      { item: 3, descricao: 'Classificação e análise das anomalias das falhas de manutenção quanto ao grau de risco;' },
      { item: 4, descricao: 'Recomendação das ações necessárias para restaurar ou preservar o desempenho dos sistemas e elementos' },
      { item: 5, descricao: 'Classificação e análise das anomalias das falhas de manutenção quanto ao grau de risco;' },
      { item: 6, descricao: 'Indicação das orientações técnicas e ordem de prioridades (urgência na intervenção);' },
      { item: 7, descricao: 'Escariamento de estruturas (caso necessário, não incluso a recomposição);' },
      { item: 8, descricao: 'Elaboração de laudo técnico de diagnóstico estrutural das edificações;' },
    ],
    metodologia: [
      'Investigação in loco com auxílio de equipamentos de diagnóstico',
      'Análise de dados colhidos entre equipe técnica',
      'Elaboração de laudo técnico com o diagnóstico',
      'Apresentação de laudo para cliente',
    ],
    prazo: {
      planejamentoInicial: 3,
      logisticaTransporte: 1,
      levantamentoCampo: 3,
      composicaoLaudo: 30,
      apresentacaoCliente: 1,
    },
    garantia: 'A qualidade do serviço prestado é garantida integralmente na responsabilidade técnica de empresa habilitada para exercício da função, com corpo técnico formado por engenheiros especialistas na área, devidamente registrados no órgão da classe CREA-MA.',
    precificacao: {
      valorMaterialMaoDeObra: 34410.20,
      percentualImposto: 14,
      valorImposto: 4817.43,
      valorTotal: 39227.63,
    },
    pagamento: {
      percentualEntrada: 40,
      valorEntrada: 15691.05,
      numeroParcelas: 2,
      valorParcela: 11768.29,
    },
  },

  contrato: {
    codigoOS: 'OS-003-2026',
    numeroContrato: 'CONT-001-2026',
    dataEmissao: '2026-01-08',
    dataInicio: '2026-01-15',
    dataTermino: '2027-01-14',
    contratanteNome: 'Construtora Delta LTDA',
    contratanteCpfCnpj: '55.666.777/0001-88',
    contratanteEndereco: 'Rua dos Construtores, 100',
    contratanteCidade: 'São Luís',
    contratanteEstado: 'MA',
    contratadoNome: 'MINERVA ENGENHARIA E REPRESENTAÇÕES LTDA',
    contratadoCpfCnpj: '12.345.678/0001-90',
    contratadoEndereco: 'Av. Colares Moreira, 100 - Renascença',
    contratadoCidade: 'São Luís',
    contratadoEstado: 'MA',
    objetoContrato: 'Prestação de serviços de consultoria em engenharia estrutural, incluindo elaboração de projetos, acompanhamento de obras e emissão de laudos técnicos.',
    valorContrato: 50000,
    formaPagamento: 'Parcelas mensais de R$ 4.166,67 via boleto bancário',
    clausulas: [
      { numero: 1, titulo: 'DO OBJETO', texto: 'A CONTRATADA compromete-se a prestar os serviços de engenharia descritos neste instrumento.' },
      { numero: 2, titulo: 'DO PRAZO', texto: 'O presente contrato terá vigência de 12 (doze) meses.' },
      { numero: 3, titulo: 'DO VALOR', texto: 'O valor total do contrato é de R$ 50.000,00 (cinquenta mil reais).' },
    ],
  },

  memorial: {
    codigoOS: 'OS-001-2026',
    titulo: 'Recuperação Estrutural de Fachada',
    dataEmissao: '2026-01-08',
    clienteNome: 'Condomínio Vista Mar',
    local: 'Av. Litorânea, 1500 - Calhau - São Luís/MA',
    secoes: [
      { titulo: '1. OBJETIVO', conteudo: 'Este memorial descreve os serviços de recuperação estrutural da fachada principal do edifício, incluindo tratamento de fissuras e impermeabilização.' },
      { titulo: '2. PREPARAÇÃO', conteudo: 'Limpeza completa da superfície com jato de água de alta pressão. Remoção de revestimentos soltos e tratamento de ferrugens expostas.' },
      { titulo: '3. APLICAÇÃO', conteudo: 'Aplicação de revestimento impermeabilizante tipo manta asfáltica em toda a extensão da laje de cobertura.' },
      { titulo: '4. ACABAMENTO', conteudo: 'Pintura final com tinta acrílica premium na cor indicada pelo condomínio, aplicada em duas demãos.' },
    ],
  },

  'documento-sst': {
    codigoOS: 'OS-002-2026',
    tipoDocumento: 'Checklist de Segurança do Trabalho',
    dataEmissao: '2026-01-08',
    clienteNome: 'Obra Residencial Palm Beach',
    local: 'Av. Litorânea, 2000 - São Luís/MA',
    responsavelTecnico: 'Eng. Maria Oliveira - CREA MA-12345',
    itens: [
      { categoria: 'EPIs', descricao: 'Equipamentos de Proteção Individual obrigatórios', status: 'conforme' as const },
      { categoria: 'Sinalização', descricao: 'Sinalização de segurança instalada', status: 'conforme' as const },
      { categoria: 'Treinamento', descricao: 'Treinamento CIPA realizado', status: 'conforme' as const },
      { categoria: 'Incêndio', descricao: 'Extintores de incêndio verificados', status: 'conforme' as const },
      { categoria: 'Elétrica', descricao: 'Quadro elétrico com proteção', status: 'nao-conforme' as const, observacao: 'Necessário instalar proteção no quadro principal.' },
    ],
    conclusao: 'A obra encontra-se em conformidade com as normas de segurança, exceto pelo item elétrico que deve ser regularizado em até 7 dias.',
  },

  'parecer-reforma': {
    codigoOS: 'OS-007-2026',
    dataEmissao: '2026-01-08',
    cliente: {
      nome: 'Condomínio Jardim das Acácias',
      cpfCnpj: '12.345.678/0001-99',
      endereco: 'Rua das Acácias, 50',
      bairro: 'Renascença',
      cidade: 'São Luís',
      estado: 'MA',
      cep: '65075-000',
    },
    reforma: {
      tipoReforma: 'Reforma de área comum (salão de festas)',
      descricaoObra: 'Ampliação do salão de festas em 30m², incluindo instalação de novo banheiro e copa.',
      areaAfetada: '120 m²',
      prazoPrevisto: '45 dias',
    },
    analiseTecnica: 'Após análise dos projetos apresentados, constatou-se que a estrutura existente suporta a ampliação proposta, desde que sejam realizados reforços nas vigas de apoio.',
    conclusao: 'APROVADO COM RESSALVAS',
    recomendacoes: [
      'Executar reforço estrutural nas vigas V1 e V2 antes de iniciar a ampliação.',
      'Apresentar ART de projeto estrutural antes do início da obra.',
      'Seguir rigorosamente o projeto aprovado.',
    ],
    responsavelTecnico: 'Eng. Carlos Santos',
    creaResponsavel: 'CREA-MA 54321',
  },

  'visita-tecnica': {
    codigoOS: 'OS-008-2026',
    dataVisita: '2026-01-06',
    cliente: {
      nome: 'Edifício Comercial Centro',
      endereco: 'Praça Deodoro, 100 - Centro - São Luís/MA',
      contato: '(98) 99999-8888',
    },
    visitante: {
      nome: 'Eng. Ana Paula Lima',
      cargo: 'Engenheira Civil',
      crea: 'CREA-MA 67890',
    },
    motivoVisita: 'Inspeção de infiltrações na cobertura do edifício, conforme solicitação do síndico.',
    atividadesRealizadas: [
      'Inspeção visual de toda a laje de cobertura',
      'Verificação do sistema de escoamento pluvial',
      'Identificação de pontos de infiltração',
      'Registro fotográfico das anomalias encontradas',
    ],
    pendencias: [
      'Aguardando orçamento de empresa especializada em impermeabilização',
      'Síndico deve aprovar início dos serviços em assembleia',
    ],
    observacoes: 'Foram identificadas 3 áreas críticas de infiltração que necessitam de intervenção imediata para evitar danos estruturais.',
  },

  'laudo-tecnico': {
    codigoOS: 'OS-011-2026',
    dataEmissao: '2026-01-08',
    cliente: {
      nome: 'Sindicato dos Engenheiros',
      cnpj: '99.888.777/0001-55',
    },
    servico: {
      titulo: 'Laudo de Vistoria Predial Anual',
      descricaoDetalhada: 'Vistoria técnica completa do imóvel sede do sindicato, avaliando condições estruturais, instalações hidráulicas e elétricas.',
      entregaveis: [
        'Laudo técnico completo',
        'Relatório fotográfico',
        'Plano de manutenção preventiva',
      ],
      prazoExecucao: '10 dias úteis',
    },
    investimento: {
      valorTotal: 2800,
      condicoesPagamento: 'À vista com 5% de desconto',
    },
  },
};

const PDF_TYPES: { value: PDFType; label: string }[] = [
  { value: 'proposta', label: 'Proposta Comercial (OS 1-4)' },
  { value: 'proposta-ass-anual', label: 'Proposta Assessoria Anual (OS 5)' },
  { value: 'proposta-ass-pontual', label: 'Proposta Assessoria Pontual (OS 6)' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'memorial', label: 'Memorial Descritivo' },
  { value: 'documento-sst', label: 'Documento SST' },
  { value: 'parecer-reforma', label: 'Parecer de Reforma (OS 7)' },
  { value: 'visita-tecnica', label: 'Visita Técnica (OS 8)' },
];

// ============================================================
// COMPONENTE DA PÁGINA
// ============================================================

function PDFTestPage() {
  const [selectedType, setSelectedType] = useState<PDFType | ''>('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const { generating, generate, error } = usePDFGeneration();

  const handleGenerate = async () => {
    if (!selectedType) return;

    setLastError(null);
    setGeneratedUrl(null);

    const mockData = MOCK_DATA[selectedType];
    if (!mockData) {
      setLastError(`Dados mock não encontrados para o tipo: ${selectedType}`);
      return;
    }

    const result = await generate(selectedType, MOCK_OS_ID, mockData);

    if (result?.success && result.url) {
      setGeneratedUrl(result.url);
    } else {
      setLastError(result?.error || 'Erro desconhecido na geração.');
    }
  };

  const handleDownload = () => {
    if (generatedUrl) {
      const link = document.createElement('a');
      link.href = generatedUrl;
      link.download = `${selectedType}_teste.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Teste de Geração de PDFs
          </CardTitle>
          <CardDescription>
            Use esta página para testar a geração de PDFs com dados mockados.
            Isso é útil para verificar se os templates estão funcionando corretamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seletor de Tipo */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Tipo de Documento</label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as PDFType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de PDF..." />
                </SelectTrigger>
                <SelectContent>
                  {PDF_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} disabled={!selectedType || generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar PDF
                </>
              )}
            </Button>
          </div>

          {/* Feedback de Erro */}
          {(lastError || error) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{lastError || error?.message}</AlertDescription>
            </Alert>
          )}

          {/* Feedback de Sucesso */}
          {generatedUrl && (
            <Alert className="bg-success/10 border-success text-success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>PDF gerado com sucesso!</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" />
                    Baixar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(generatedUrl, '_blank')}>
                    <Eye className="h-4 w-4 mr-1" />
                    Abrir
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview do PDF */}
      {generatedUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <PDFViewerEmbedded
              pdfUrl={generatedUrl}
              filename={`${selectedType}_teste.pdf`}
              height={600}
              showToolbar
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export const Route = createFileRoute('/_auth/configuracoes/teste-pdf')({
  component: PDFTestPage,
});
