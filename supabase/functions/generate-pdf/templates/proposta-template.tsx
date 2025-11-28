/**
 * Template de Proposta Comercial em React PDF
 * Baseado no modelo Minerva Engenharia
 * 
 * Estrutura:
 * - Header com logo e dados da empresa
 * - Dados do Cliente
 * - Objetivo
 * - Especificações Técnicas (Etapas e Subetapas)
 * - Prazo - Cronograma de Obra
 * - Garantia
 * - Investimentos
 * - Pagamento
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, fontSize, commonStyles } from './shared-styles.ts';
import { formatarMoeda, formatarData, formatarCpfCnpj } from '../utils/pdf-formatter.ts';

// ============================================
// INTERFACES
// ============================================

export interface Subetapa {
  nome: string;
  m2?: string;
  unidade?: string; // UNID, m², m³, etc.
  quantidade?: number;
  total: string | number;
  diasUteis?: string | number;
}

export interface Etapa {
  nome: string;
  subetapas: Subetapa[];
}

export interface DadosFinanceiros {
  precoFinal: string | number;
  maoObraCusto?: string | number;
  materialCusto?: string | number;
  numeroParcelas?: string | number;
  percentualLucro?: string | number;
  percentualEntrada?: string | number;
  percentualImposto?: string | number;
  percentualImprevisto?: string | number;
}

export interface DadosCronograma {
  objetivo?: string;
  preparacaoArea?: string | number;
  planejamentoInicial?: string | number;
  logisticaTransporte?: string | number;
  etapasPrincipais: Etapa[];
}

export interface PropostaData {
  // Dados da OS/Proposta
  codigoOS: string;
  codigoProposta?: string;
  dataEmissao: string;
  validadeProposta?: number; // dias

  // Dados do Cliente
  clienteNome: string;
  clienteCpfCnpj: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  clienteEndereco?: string;
  clienteBairro?: string;
  clienteCidade?: string;
  clienteEstado?: string;
  clienteResponsavel?: string;

  // Dados específicos (para condomínios, etc.)
  quantidadeUnidades?: number;
  quantidadeBlocos?: number;

  // Objetivo da Proposta
  objetivo: string;
  tituloProposta?: string;

  // Dados do Cronograma (etapas e subetapas)
  dadosCronograma: DadosCronograma;

  // Dados Financeiros
  dadosFinanceiros: DadosFinanceiros;

  // Garantia
  garantias?: string[];

  // Dados da Empresa
  empresaNome?: string;
  empresaCnpj?: string;
  empresaEndereco?: string;
  empresaTelefone?: string;
  empresaEmail?: string;
  empresaSite?: string;
  empresaLogo?: string;
}

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  ...commonStyles,

  // Page com margens menores para mais conteúdo
  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.neutral900,
  },

  // Header estilo Minerva
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottom: `3 solid ${colors.primary}`,
  },

  headerLeft: {
    flexDirection: 'column',
    width: '30%',
  },

  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '65%',
  },

  logo: {
    width: 100,
    height: 60,
    marginBottom: spacing.xs,
  },

  empresaInfo: {
    fontSize: fontSize.xs,
    color: colors.neutral600,
    textAlign: 'right',
    lineHeight: 1.4,
  },

  dataEmissao: {
    fontSize: fontSize.xs,
    color: colors.neutral500,
    textAlign: 'right',
    marginTop: spacing.sm,
  },

  // Dados do Cliente - Grid estilo tabela
  clienteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral300,
  },

  clienteRow: {
    flexDirection: 'row',
    width: '100%',
  },

  clienteCell: {
    padding: spacing.xs,
    borderRightWidth: 1,
    borderRightColor: colors.neutral300,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral300,
  },

  clienteLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: colors.neutral700,
  },

  clienteValue: {
    fontSize: fontSize.sm,
    color: colors.neutral900,
  },

  // Título da Proposta
  tituloPropostaContainer: {
    backgroundColor: colors.neutral100,
    padding: spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  tituloProposta: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.neutral800,
  },

  // Seção Objetivo
  objetivoContainer: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },

  objetivoLabel: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  objetivoText: {
    fontSize: fontSize.sm,
    color: colors.white,
    marginTop: spacing.xs,
  },

  // Tabela de Especificações Técnicas
  sectionHeader: {
    backgroundColor: colors.neutral800,
    padding: spacing.sm,
    marginTop: spacing.md,
  },

  sectionHeaderText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  // Tabela de itens
  tableContainer: {
    borderWidth: 1,
    borderColor: colors.neutral300,
    marginBottom: spacing.md,
  },

  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.neutral200,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral300,
  },

  tableHeaderCell: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    padding: spacing.xs,
    textAlign: 'center',
  },

  // Linha de categoria/etapa
  etapaRow: {
    flexDirection: 'row',
    backgroundColor: colors.neutral100,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral300,
  },

  etapaCell: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    padding: spacing.xs,
  },

  // Linha de subetapa
  subetapaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },

  subetapaCell: {
    fontSize: fontSize.xs,
    color: colors.neutral700,
    padding: spacing.xs,
  },

  // Colunas da tabela de especificações
  colItem: { width: '8%', textAlign: 'center' },
  colDescricao: { width: '52%' },
  colUnidade: { width: '12%', textAlign: 'center' },
  colTotal: { width: '28%', textAlign: 'right' },

  // Seção Prazo/Cronograma
  cronogramaContainer: {
    marginTop: spacing.md,
  },

  cronogramaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
    paddingVertical: spacing.xs,
  },

  cronogramaAtividade: {
    width: '70%',
    fontSize: fontSize.xs,
    color: colors.neutral700,
    paddingLeft: spacing.sm,
  },

  cronogramaDias: {
    width: '30%',
    fontSize: fontSize.xs,
    color: colors.neutral800,
    textAlign: 'right',
    paddingRight: spacing.sm,
  },

  prazoTotal: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: spacing.sm,
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },

  prazoTotalLabel: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  prazoTotalValue: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  // Seção Garantia
  garantiaContainer: {
    backgroundColor: colors.neutral50,
    padding: spacing.md,
    marginTop: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },

  garantiaTitle: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.xs,
  },

  garantiaItem: {
    fontSize: fontSize.xs,
    color: colors.neutral700,
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },

  // Seção Investimentos
  investimentoContainer: {
    marginTop: spacing.md,
  },

  investimentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },

  investimentoLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral700,
  },

  investimentoValue: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral800,
  },

  investimentoTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },

  investimentoTotalLabel: {
    fontSize: fontSize.base,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  investimentoTotalValue: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  // Impostos
  impostosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.warning,
    padding: spacing.sm,
  },

  // Seção Pagamento
  pagamentoContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral300,
  },

  pagamentoTitle: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.sm,
  },

  pagamentoRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },

  pagamentoLabel: {
    width: '50%',
    fontSize: fontSize.sm,
    color: colors.neutral700,
  },

  pagamentoValue: {
    width: '50%',
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    textAlign: 'right',
  },

  // Investimento por unidade
  unidadeBox: {
    backgroundColor: colors.neutral100,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral300,
  },

  unidadeTitle: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: colors.neutral600,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  // Validade
  validadeText: {
    fontSize: fontSize.xs,
    color: colors.neutral500,
    textAlign: 'right',
    marginTop: spacing.sm,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.xl,
    right: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },

  footerText: {
    fontSize: fontSize.xs,
    color: colors.neutral500,
    textAlign: 'center',
  },
});

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function Header({ data }: { data: PropostaData }) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        {data.empresaLogo ? (
          <Image style={styles.logo} src={data.empresaLogo} />
        ) : (
          <Text style={{ fontSize: fontSize.xl, fontFamily: fonts.bold, color: colors.primary }}>
            {data.empresaNome || 'MINERVA'}
          </Text>
        )}
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.empresaInfo}>
          {data.empresaEndereco || 'Av. Colares Moreira, Edifício Los Angeles, Nº100, Loja 01'}
        </Text>
        <Text style={styles.empresaInfo}>
          {data.empresaCidade || 'Renascença, São Luís - MA'}
        </Text>
        <Text style={styles.empresaInfo}>
          {data.empresaTelefone || '(98) 98226-7909 / (98) 98151-3355'}
        </Text>
        <Text style={styles.empresaInfo}>
          {data.empresaSite || 'www.minerva-eng.com.br'} / {data.empresaEmail || 'contato@minerva-eng.com.br'}
        </Text>
        <Text style={styles.dataEmissao}>{formatarData(data.dataEmissao)}</Text>
      </View>
    </View>
  );
}

function DadosCliente({ data }: { data: PropostaData }) {
  return (
    <View style={styles.clienteGrid}>
      {/* Linha 1 */}
      <View style={styles.clienteRow}>
        <View style={[styles.clienteCell, { width: '60%' }]}>
          <Text style={styles.clienteLabel}>CLIENTE: <Text style={styles.clienteValue}>{data.clienteNome}</Text></Text>
        </View>
        <View style={[styles.clienteCell, { width: '40%', borderRightWidth: 0 }]}>
          <Text style={styles.clienteLabel}>E-MAIL: <Text style={styles.clienteValue}>{data.clienteEmail || '-'}</Text></Text>
        </View>
      </View>

      {/* Linha 2 */}
      <View style={styles.clienteRow}>
        <View style={[styles.clienteCell, { width: '30%' }]}>
          <Text style={styles.clienteLabel}>RESPO <Text style={styles.clienteValue}>{data.clienteResponsavel || '-'}</Text></Text>
        </View>
        <View style={[styles.clienteCell, { width: '30%' }]}>
          <Text style={styles.clienteLabel}>CPF/CNPJ: <Text style={styles.clienteValue}>{formatarCpfCnpj(data.clienteCpfCnpj)}</Text></Text>
        </View>
        <View style={[styles.clienteCell, { width: '40%', borderRightWidth: 0 }]}>
          <Text style={styles.clienteLabel}>END.: <Text style={styles.clienteValue}>{data.clienteEndereco || '-'}</Text></Text>
        </View>
      </View>

      {/* Linha 3 */}
      <View style={styles.clienteRow}>
        <View style={[styles.clienteCell, { width: '30%' }]}>
          <Text style={styles.clienteLabel}>TEL: <Text style={styles.clienteValue}>{data.clienteTelefone || '-'}</Text></Text>
        </View>
        <View style={[styles.clienteCell, { width: '30%' }]}>
          <Text style={styles.clienteLabel}>BAIRRO: <Text style={styles.clienteValue}>{data.clienteBairro || '-'}</Text></Text>
        </View>
        <View style={[styles.clienteCell, { width: '40%', borderRightWidth: 0 }]}>
          <Text style={styles.clienteLabel}>CIDADE/ESTADO: <Text style={styles.clienteValue}>{data.clienteCidade || '-'}/{data.clienteEstado || '-'}</Text></Text>
        </View>
      </View>

      {/* Linha 4 - Código da proposta e quantidades */}
      <View style={[styles.clienteRow, { borderBottomWidth: 0 }]}>
        <View style={[styles.clienteCell, { width: '30%', borderBottomWidth: 0 }]}>
          <Text style={styles.clienteLabel}>CODIGO DA PROPOSTA: <Text style={styles.clienteValue}>{data.codigoProposta || data.codigoOS}</Text></Text>
        </View>
        <View style={[styles.clienteCell, { width: '35%', borderBottomWidth: 0 }]}>
          <Text style={styles.clienteLabel}>QUANTIDADE DE UNIDADES: <Text style={styles.clienteValue}>{data.quantidadeUnidades || '-'}</Text></Text>
        </View>
        <View style={[styles.clienteCell, { width: '35%', borderRightWidth: 0, borderBottomWidth: 0 }]}>
          <Text style={styles.clienteLabel}>QUANTIDADE DE BLOCOS: <Text style={styles.clienteValue}>{data.quantidadeBlocos || '-'}</Text></Text>
        </View>
      </View>
    </View>
  );
}

function TituloProposta({ titulo }: { titulo?: string }) {
  if (!titulo) return null;
  return (
    <View style={styles.tituloPropostaContainer}>
      <Text style={styles.tituloProposta}>{titulo}</Text>
    </View>
  );
}

function Objetivo({ objetivo }: { objetivo: string }) {
  return (
    <View style={styles.objetivoContainer}>
      <Text style={styles.objetivoLabel}>1. OBJETIVO: <Text style={{ fontFamily: fonts.regular }}>• {objetivo}</Text></Text>
    </View>
  );
}

function EspecificacoesTecnicas({ etapas }: { etapas: Etapa[] }) {
  let itemCounter = 0;

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>2. ESPECIFICAÇÕES TÉCNICAS;</Text>
      </View>

      <View style={styles.tableContainer}>
        {/* Header da tabela */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.colItem]}>ITEM</Text>
          <Text style={[styles.tableHeaderCell, styles.colDescricao]}>DESCRIÇÃO DE SERVIÇOS</Text>
          <Text style={[styles.tableHeaderCell, styles.colUnidade]}>UNID.</Text>
          <Text style={[styles.tableHeaderCell, styles.colTotal]}>TOTAL</Text>
        </View>

        {/* Etapas e Subetapas */}
        {etapas.map((etapa, etapaIndex) => {
          itemCounter++;
          const etapaNumero = itemCounter;

          return (
            <View key={etapaIndex}>
              {/* Linha da Etapa (categoria) */}
              <View style={styles.etapaRow}>
                <Text style={[styles.etapaCell, { width: '100%' }]}>
                  {etapaNumero}. {etapa.nome.toUpperCase()}
                </Text>
              </View>

              {/* Subetapas */}
              {etapa.subetapas.map((subetapa, subIndex) => (
                <View key={subIndex} style={styles.subetapaRow}>
                  <Text style={[styles.subetapaCell, styles.colItem]}>
                    {etapaNumero}.{subIndex + 1}
                  </Text>
                  <Text style={[styles.subetapaCell, styles.colDescricao]}>
                    {subetapa.nome}
                  </Text>
                  <Text style={[styles.subetapaCell, styles.colUnidade]}>
                    {subetapa.quantidade || subetapa.m2 || '1'} {subetapa.unidade || 'UNID'}
                  </Text>
                  <Text style={[styles.subetapaCell, styles.colTotal]}>
                    R$ {formatarValor(subetapa.total)}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function CronogramaObra({ dados, etapas }: { dados: DadosCronograma; etapas: Etapa[] }) {
  // Calcular total de dias
  let totalDias = 0;

  const diasPlanejamento = Number(dados.planejamentoInicial) || 0;
  const diasLogistica = Number(dados.logisticaTransporte) || 0;
  const diasPreparacao = Number(dados.preparacaoArea) || 0;

  totalDias += diasPlanejamento + diasLogistica + diasPreparacao;

  // Dias das subetapas
  const diasSubetapas: { nome: string; dias: number }[] = [];
  etapas.forEach((etapa) => {
    etapa.subetapas.forEach((sub) => {
      const dias = Number(sub.diasUteis) || 0;
      totalDias += dias;
      diasSubetapas.push({ nome: `${etapa.nome} - ${sub.nome}`, dias });
    });
  });

  return (
    <View style={styles.cronogramaContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>3. PRAZO - CRONOGRAMA DE OBRA:</Text>
      </View>

      <View style={{ borderWidth: 1, borderColor: colors.neutral300 }}>
        {/* Header */}
        <View style={[styles.cronogramaRow, { backgroundColor: colors.neutral100 }]}>
          <Text style={[styles.cronogramaAtividade, { fontFamily: fonts.bold }]}>atividade</Text>
          <Text style={[styles.cronogramaDias, { fontFamily: fonts.bold }]}>em dias úteis</Text>
        </View>

        {/* Atividades iniciais */}
        {diasPlanejamento > 0 && (
          <View style={styles.cronogramaRow}>
            <Text style={styles.cronogramaAtividade}>planejamento inicial:</Text>
            <Text style={styles.cronogramaDias}>{diasPlanejamento}</Text>
          </View>
        )}
        {diasLogistica > 0 && (
          <View style={styles.cronogramaRow}>
            <Text style={styles.cronogramaAtividade}>Logística e transporte de materiais:</Text>
            <Text style={styles.cronogramaDias}>{diasLogistica}</Text>
          </View>
        )}
        {diasPreparacao > 0 && (
          <View style={styles.cronogramaRow}>
            <Text style={styles.cronogramaAtividade}>Preparação de área de trabalho:</Text>
            <Text style={styles.cronogramaDias}>{diasPreparacao}</Text>
          </View>
        )}

        {/* Execução de obra */}
        <View style={[styles.cronogramaRow, { backgroundColor: colors.neutral100 }]}>
          <Text style={[styles.cronogramaAtividade, { fontFamily: fonts.bold }]}>Execução de obra:</Text>
          <Text style={styles.cronogramaDias}></Text>
        </View>

        {/* Subetapas */}
        {diasSubetapas.map((item, index) => (
          <View key={index} style={styles.cronogramaRow}>
            <Text style={styles.cronogramaAtividade}>{item.nome}</Text>
            <Text style={styles.cronogramaDias}>{item.dias}</Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={styles.prazoTotal}>
        <Text style={styles.prazoTotalLabel}>PRAZO TOTAL:</Text>
        <Text style={styles.prazoTotalValue}>{totalDias} dias úteis</Text>
      </View>
    </View>
  );
}

function Garantia({ garantias }: { garantias?: string[] }) {
  const garantiasPadrao = [
    'Seguro de obra incluso (cobertura de danos materiais causados ao proprietário da obra e erro de projeto);',
    'Serviço garantido por nota fiscal e emissão de ART (anotação de responsabilidade técnica) - CREA-MA;',
    'Garantia conforme NBR 15571-1;',
  ];

  const listaGarantias = garantias && garantias.length > 0 ? garantias : garantiasPadrao;

  return (
    <View style={styles.garantiaContainer}>
      <Text style={styles.garantiaTitle}>4. GARANTIA:</Text>
      {listaGarantias.map((item, index) => (
        <Text key={index} style={styles.garantiaItem}>• {item}</Text>
      ))}
    </View>
  );
}

function Investimentos({ dados, etapas }: { dados: DadosFinanceiros; etapas: Etapa[] }) {
  // Calcular subtotal das etapas
  let subtotal = 0;
  etapas.forEach((etapa) => {
    etapa.subetapas.forEach((sub) => {
      subtotal += Number(sub.total) || 0;
    });
  });

  const precoFinal = Number(dados.precoFinal) || subtotal;
  const percentualImposto = Number(dados.percentualImposto) || 0;
  const impostos = precoFinal * (percentualImposto / 100);
  const totalComImpostos = precoFinal + impostos;

  return (
    <View style={styles.investimentoContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>5. INVESTIMENTOS</Text>
      </View>

      <View style={{ borderWidth: 1, borderColor: colors.neutral300, padding: spacing.sm }}>
        <Text style={{ fontSize: fontSize.xs, fontFamily: fonts.bold, color: colors.neutral600, marginBottom: spacing.sm }}>
          DESCRIÇÃO:{'\n'}ITEM  INCLUSO MATERIAL, MÃO DE OBRA, LOGÍSTICA E EVENTUALIDADES
        </Text>

        <View style={styles.investimentoRow}>
          <Text style={styles.investimentoLabel}>1   Execução de obra e entrega de serviço concluído;</Text>
          <Text style={styles.investimentoValue}>R$ {formatarValor(precoFinal)}</Text>
        </View>

        {percentualImposto > 0 && (
          <View style={styles.impostosRow}>
            <Text style={styles.investimentoTotalLabel}>IMPOSTOS (EMISSÃO DE NOTA FISCAL DE SERVIÇOS):</Text>
            <Text style={styles.investimentoTotalValue}>R$ {formatarValor(impostos)}</Text>
          </View>
        )}

        <View style={styles.investimentoTotalRow}>
          <Text style={styles.investimentoTotalLabel}>INVESTIMENTO + IMPOSTOS:</Text>
          <Text style={styles.investimentoTotalValue}>R$ {formatarValor(totalComImpostos)}</Text>
        </View>
      </View>
    </View>
  );
}

function Pagamento({ dados, quantidadeUnidades }: { dados: DadosFinanceiros; quantidadeUnidades?: number }) {
  const precoFinal = Number(dados.precoFinal) || 0;
  const percentualImposto = Number(dados.percentualImposto) || 0;
  const impostos = precoFinal * (percentualImposto / 100);
  const totalComImpostos = precoFinal + impostos;

  const percentualEntrada = Number(dados.percentualEntrada) || 40;
  const numeroParcelas = Number(dados.numeroParcelas) || 2;

  const valorEntrada = totalComImpostos * (percentualEntrada / 100);
  const valorRestante = totalComImpostos - valorEntrada;
  const valorParcela = valorRestante / numeroParcelas;

  // Calcular por unidade (se aplicável)
  const unidades = quantidadeUnidades || 1;
  const entradaPorUnidade = valorEntrada / unidades;
  const parcelaPorUnidade = valorParcela / unidades;

  return (
    <View style={styles.pagamentoContainer}>
      <Text style={styles.pagamentoTitle}>6. PAGAMENTO</Text>
      <Text style={{ fontSize: fontSize.sm, fontFamily: fonts.bold, color: colors.neutral700, marginBottom: spacing.sm }}>
        6.1 PARCELAMENTO:
      </Text>

      <View style={styles.pagamentoRow}>
        <Text style={styles.pagamentoLabel}>R$ {formatarValor(valorEntrada)} {percentualEntrada}% de entrada</Text>
        <Text style={styles.pagamentoValue}>7 dias após assinatura de contrato</Text>
      </View>

      <View style={styles.pagamentoRow}>
        <Text style={styles.pagamentoLabel}>R$ {formatarValor(valorRestante)} {numeroParcelas} parcelas mensais</Text>
        <Text style={styles.pagamentoValue}>Execução de obra e entrega de serviço concluído;</Text>
      </View>

      {quantidadeUnidades && quantidadeUnidades > 1 && (
        <View style={styles.unidadeBox}>
          <Text style={styles.unidadeTitle}>INVESTIMENTO POR UNIDADE AUTÔNOMA</Text>
          <View style={styles.pagamentoRow}>
            <Text style={styles.pagamentoLabel}>entrada</Text>
            <Text style={styles.pagamentoValue}>R$ {formatarValor(entradaPorUnidade)}</Text>
          </View>
          <View style={styles.pagamentoRow}>
            <Text style={styles.pagamentoLabel}>cada parcela</Text>
            <Text style={styles.pagamentoValue}>R$ {formatarValor(parcelaPorUnidade)}</Text>
          </View>
        </View>
      )}

      <Text style={styles.validadeText}>Validade da Proposta: 30 dias</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Documento de autoria própria, ficando proibido sua replicabilidade, assim como exposição desta para demais empresas concorrentes, como rege o conselho de ética.
      </Text>
    </View>
  );
}

// ============================================
// UTILITÁRIOS
// ============================================

function formatarValor(valor: string | number): string {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(num)) return '0,00';
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============================================
// TEMPLATE PRINCIPAL
// ============================================

export function PropostaTemplate({ data }: { data: PropostaData }) {
  const etapas = data.dadosCronograma?.etapasPrincipais || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header data={data} />
        <DadosCliente data={data} />
        <TituloProposta titulo={data.tituloProposta} />
        <Objetivo objetivo={data.objetivo} />
        <EspecificacoesTecnicas etapas={etapas} />
        <CronogramaObra dados={data.dadosCronograma} etapas={etapas} />
        <Garantia garantias={data.garantias} />
        <Investimentos dados={data.dadosFinanceiros} etapas={etapas} />
        <Pagamento dados={data.dadosFinanceiros} quantidadeUnidades={data.quantidadeUnidades} />
        <Footer />
      </Page>
    </Document>
  );
}