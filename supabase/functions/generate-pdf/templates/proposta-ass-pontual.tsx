/**
 * Template de Proposta de Assessoria Pontual (OS 06)
 *
 * Estrutura baseada no documento de referência:
 * - Header com divisória AZUL (SharedHeader)
 * - 1. OBJETIVO (bullets dinâmicos)
 * - 2. ESPECIFICAÇÕES TÉCNICAS (tabela ITEM | DESCRIÇÃO)
 * - METODOLOGIA (texto fixo)
 * - 3. PRAZO (5 campos dinâmicos)
 * - 4. GARANTIA (texto fixo)
 * - 5. INVESTIMENTOS (valor + impostos)
 * - 6. PAGAMENTO (entrada + parcelas)
 * - Footer com assinatura
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, fontSize, commonStyles } from './shared-styles.ts';
import { formatarData, formatarMoeda } from '../utils/pdf-formatter.ts';
import { SharedHeader } from './components/shared-header.tsx';
import { SharedFooter } from './components/shared-footer.tsx';

// ============================================
// INTERFACES
// ============================================

export interface EspecificacaoTecnica {
  descricao: string;
}

export interface DadosPrazo {
  planejamentoInicial: number;
  logisticaTransporte: number;
  levantamentoCampo: number;
  composicaoLaudo: number;
  apresentacaoCliente: number;
}

export interface DadosPrecificacao {
  valorParcial: number;
  percentualImposto: number;
}

export interface DadosPagamento {
  percentualEntrada: number;
  numeroParcelas: number;
  percentualDesconto?: number;
}

export interface PropostaAssPontualData {
  // Dados da OS
  codigoOS: string;
  dataEmissao: string;

  // Cliente
  clienteNome: string;
  clienteCpfCnpj: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  clienteEndereco?: string;
  clienteBairro?: string;
  clienteCidade?: string;
  clienteEstado?: string;

  // Conteúdo Dinâmico
  objetivo: string;
  especificacoesTecnicas: EspecificacaoTecnica[];
  metodologia: string;
  prazo: DadosPrazo;
  garantia: string;
  precificacao: DadosPrecificacao;
  pagamento: DadosPagamento;
}

// Textos padrão (usados como fallback)
const METODOLOGIA_PADRAO = `• Acompanhamento semanal in loco
• Relatório mensal de acompanhamento de plano de manutenção
• Mais de 35 equipamentos de diagnóstico`;

const GARANTIA_PADRAO = `A qualidade do serviço prestado é garantida integralmente na responsabilidade técnica de empresa habilitada para exercício da função, com corpo técnico formado por engenheiros especialistas na área, devidamente registrados no órgão da classe CREA-MA.`;

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  ...commonStyles,

  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.neutral900,
  },

  // Seção com título azul
  section: {
    marginBottom: spacing.lg,
  },

  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },

  sectionTitle: {
    fontSize: fontSize.base,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  sectionContent: {
    padding: spacing.sm,
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },

  // Objetivo - bullet list
  bulletItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },

  bulletPoint: {
    fontSize: fontSize.sm,
    marginRight: spacing.sm,
  },

  bulletText: {
    fontSize: fontSize.sm,
    color: colors.neutral800,
    flex: 1,
    lineHeight: 1.4,
  },

  // Tabela de Especificações
  table: {
    marginTop: spacing.xs,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.info,
    padding: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.info,
  },

  tableHeaderCell: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },

  tableRowAlt: {
    backgroundColor: colors.neutral50,
  },

  tableCell: {
    fontSize: fontSize.sm,
    color: colors.neutral800,
  },

  // Metodologia
  metodologiaContainer: {
    backgroundColor: colors.neutral100,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  metodologiaTitle: {
    fontSize: fontSize.base,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.sm,
  },

  // Prazo
  prazoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },

  prazoLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral700,
    flex: 1,
  },

  prazoValue: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral900,
    textAlign: 'right',
  },

  // Garantia
  garantiaContainer: {
    backgroundColor: colors.warning,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  garantiaTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info,
    padding: spacing.sm,
    marginBottom: 0,
  },

  garantiaTitle: {
    fontSize: fontSize.base,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  garantiaText: {
    fontSize: fontSize.sm,
    color: colors.neutral800,
    lineHeight: 1.5,
    padding: spacing.sm,
    backgroundColor: colors.warning,
    borderWidth: 1,
    borderColor: colors.warning,
  },

  // Investimentos
  investimentoTable: {
    marginTop: spacing.sm,
  },

  investimentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },

  investimentoTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.success,
  },

  investimentoImpostoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.error,
  },

  investimentoLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral700,
    flex: 1,
  },

  investimentoValue: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral900,
  },

  investimentoTotalLabel: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.white,
    flex: 1,
  },

  investimentoTotalValue: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  // Pagamento
  pagamentoContainer: {
    padding: spacing.md,
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },

  pagamentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },

  pagamentoLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral700,
  },

  pagamentoValue: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral900,
  },

  // Assinatura
  assinaturaContainer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },

  assinaturaLinha: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral400,
    marginTop: spacing['2xl'],
    paddingTop: spacing.sm,
    alignItems: 'center',
  },

  assinaturaTexto: {
    fontSize: fontSize.sm,
    color: colors.neutral600,
    textAlign: 'center',
  },
});

// ============================================
// COMPONENTES
// ============================================

function Objetivo({ objetivo }: { objetivo: string }) {
  // Dividir objetivo em bullets (por ponto-e-vírgula ou quebra de linha)
  const bullets = objetivo
    .split(/[;\n]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>1. OBJETIVO:</Text>
      </View>
      <View style={styles.sectionContent}>
        {bullets.map((item, index) => (
          <View key={index} style={styles.bulletItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EspecificacoesTecnicas({ especificacoes }: { especificacoes: EspecificacaoTecnica[] }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>2. ESPECIFICAÇÕES TÉCNICAS:</Text>
      </View>
      <View style={styles.table}>
        {/* Cabeçalho da tabela */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: 40 }]}>ITEM</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>DESCRIÇÃO</Text>
        </View>
        {/* Linhas */}
        {especificacoes.map((esp, index) => (
          <View
            key={index}
            style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
          >
            <Text style={[styles.tableCell, { width: 40, textAlign: 'center' }]}>
              {index + 1}
            </Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{esp.descricao}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Metodologia({ texto }: { texto: string }) {
  // Usar texto dinâmico ou fallback para padrão
  const textoFinal = texto || METODOLOGIA_PADRAO;

  // Dividir texto em bullets (por quebra de linha)
  const bullets = textoFinal
    .split('\n')
    .map(item => item.replace(/^[•\-*]\s*/, '').trim())
    .filter(item => item.length > 0);

  return (
    <View style={styles.metodologiaContainer}>
      <Text style={styles.metodologiaTitle}>METODOLOGIA:</Text>
      {bullets.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Prazo({ prazo }: { prazo: DadosPrazo }) {
  const prazoTotal =
    prazo.planejamentoInicial +
    prazo.logisticaTransporte +
    prazo.levantamentoCampo +
    prazo.composicaoLaudo +
    prazo.apresentacaoCliente;

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>3. PRAZO:</Text>
      </View>
      <View style={styles.sectionContent}>
        <View style={styles.prazoRow}>
          <Text style={styles.prazoLabel}>• Planejamento inicial:</Text>
          <Text style={styles.prazoValue}>{prazo.planejamentoInicial} dias úteis</Text>
        </View>
        <View style={styles.prazoRow}>
          <Text style={styles.prazoLabel}>• Logística e transporte de materiais:</Text>
          <Text style={styles.prazoValue}>{prazo.logisticaTransporte} dia útil</Text>
        </View>
        <View style={styles.prazoRow}>
          <Text style={styles.prazoLabel}>• Levantamento em campo:</Text>
          <Text style={styles.prazoValue}>{prazo.levantamentoCampo} dias úteis</Text>
        </View>
        <View style={styles.prazoRow}>
          <Text style={styles.prazoLabel}>• Composição de laudo técnico:</Text>
          <Text style={styles.prazoValue}>{prazo.composicaoLaudo} dias úteis</Text>
        </View>
        <View style={[styles.prazoRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.prazoLabel}>• Apresentação de laudo técnico para cliente:</Text>
          <Text style={styles.prazoValue}>{prazo.apresentacaoCliente} dia útil</Text>
        </View>
        <View style={[styles.prazoRow, { marginTop: spacing.sm, backgroundColor: colors.primary, padding: spacing.sm }]}>
          <Text style={[styles.prazoLabel, { color: colors.white, fontFamily: fonts.bold }]}>PRAZO TOTAL:</Text>
          <Text style={[styles.prazoValue, { color: colors.white }]}>{prazoTotal} dias úteis</Text>
        </View>
      </View>
    </View>
  );
}

function Garantia({ texto }: { texto: string }) {
  // Usar texto dinâmico ou fallback para padrão
  const textoFinal = texto || GARANTIA_PADRAO;

  return (
    <View style={styles.section}>
      <View style={styles.garantiaTitleContainer}>
        <Text style={styles.garantiaTitle}>4. GARANTIA:</Text>
      </View>
      <Text style={styles.garantiaText}>{textoFinal}</Text>
    </View>
  );
}

function Investimentos({ precificacao }: { precificacao: DadosPrecificacao }) {
  const valorImposto = (precificacao.valorParcial * precificacao.percentualImposto) / 100;
  const valorTotal = precificacao.valorParcial + valorImposto;

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>5. INVESTIMENTOS</Text>
      </View>
      <View style={styles.investimentoTable}>
        {/* Cabeçalho */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: 40 }]}>ITEM</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>DESCRIÇÃO: INCLUSO MATERIAL, MÃO DE OBRA, LOGÍSTICA E EVENTUALIDADES</Text>
          <Text style={[styles.tableHeaderCell, { width: 80, textAlign: 'right' }]}>TOTAL</Text>
        </View>

        {/* Valor parcial */}
        <View style={styles.investimentoRow}>
          <Text style={[styles.investimentoLabel, { width: 40, textAlign: 'center' }]}>1</Text>
          <Text style={[styles.investimentoLabel, { flex: 1 }]}>Execução de obra e entrega de serviço concluído;</Text>
          <Text style={[styles.investimentoValue, { width: 80, textAlign: 'right' }]}>
            {formatarMoeda(precificacao.valorParcial)}
          </Text>
        </View>

        {/* Impostos */}
        <View style={styles.investimentoImpostoRow}>
          <Text style={[styles.investimentoTotalLabel, { width: 40 }]}></Text>
          <Text style={styles.investimentoTotalLabel}>
            IMPOSTOS (EMISSÃO DE NOTA FISCAL DE SERVIÇOS):
          </Text>
          <Text style={[styles.investimentoTotalValue, { width: 80, textAlign: 'right' }]}>
            {formatarMoeda(valorImposto)}
          </Text>
        </View>

        {/* Total */}
        <View style={styles.investimentoTotalRow}>
          <Text style={[styles.investimentoTotalLabel, { width: 40 }]}></Text>
          <Text style={styles.investimentoTotalLabel}>INVESTIMENTO + IMPOSTOS:</Text>
          <Text style={[styles.investimentoTotalValue, { width: 80, textAlign: 'right' }]}>
            {formatarMoeda(valorTotal)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function Pagamento({ pagamento, valorTotal }: { pagamento: DadosPagamento; valorTotal: number }) {
  const valorComDesconto = pagamento.percentualDesconto
    ? valorTotal * (1 - pagamento.percentualDesconto / 100)
    : valorTotal;
  const valorEntrada = (valorTotal * pagamento.percentualEntrada) / 100;
  const valorRemanescente = valorTotal - valorEntrada;
  const valorParcela = pagamento.numeroParcelas > 0 ? valorRemanescente / pagamento.numeroParcelas : 0;

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>6. PAGAMENTO</Text>
      </View>
      <View style={styles.pagamentoContainer}>
        <Text style={[styles.metodologiaTitle, { marginBottom: spacing.md }]}>6.1 PROPOSTAS:</Text>

        {pagamento.percentualDesconto && (
          <View style={styles.pagamentoRow}>
            <Text style={styles.pagamentoLabel}>
              {formatarMoeda(valorComDesconto)}
            </Text>
            <Text style={styles.pagamentoValue}>
              {pagamento.percentualDesconto}% de desconto para pagamento no quinto dia útil do Mês
            </Text>
          </View>
        )}

        <View style={[styles.pagamentoRow, { marginTop: spacing.md }]}>
          <Text style={styles.pagamentoLabel}>Entrada ({pagamento.percentualEntrada}%):</Text>
          <Text style={styles.pagamentoValue}>{formatarMoeda(valorEntrada)}</Text>
        </View>

        {pagamento.numeroParcelas > 0 && (
          <View style={styles.pagamentoRow}>
            <Text style={styles.pagamentoLabel}>
              Parcelamento ({pagamento.numeroParcelas}x):
            </Text>
            <Text style={styles.pagamentoValue}>
              {pagamento.numeroParcelas}x de {formatarMoeda(valorParcela)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function Assinatura({ clienteNome, dataEmissao }: { clienteNome: string; dataEmissao: string }) {
  return (
    <View style={styles.assinaturaContainer}>
      <Text style={[styles.bulletText, { textAlign: 'center', marginBottom: spacing.lg }]}>
        São Luís - MA, {formatarData(dataEmissao)}
      </Text>

      <View style={styles.assinaturaLinha}>
        <Text style={styles.assinaturaTexto}>{clienteNome}</Text>
        <Text style={[styles.assinaturaTexto, { fontSize: fontSize.xs }]}>Contratante</Text>
      </View>

      <View style={styles.assinaturaLinha}>
        <Text style={styles.assinaturaTexto}>Minerva Engenharia e Representações</Text>
        <Text style={[styles.assinaturaTexto, { fontSize: fontSize.xs }]}>Contratada</Text>
      </View>
    </View>
  );
}

// ============================================
// TEMPLATE PRINCIPAL
// ============================================

export function PropostaAssPontualTemplate({ data }: { data: PropostaAssPontualData }) {
  const valorImposto = (data.precificacao.valorParcial * data.precificacao.percentualImposto) / 100;
  const valorTotal = data.precificacao.valorParcial + valorImposto;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <SharedHeader
          documentTitle="PROPOSTA PARA ASSESSORIA E SUPERVISÃO TÉCNICA DE ENGENHARIA"
          documentSubtitle={`Proposta Nº ${data.codigoOS}`}
          documentDate={formatarData(data.dataEmissao)}
          dividerColor="info"
        />

        <Objetivo objetivo={data.objetivo} />
        <EspecificacoesTecnicas especificacoes={data.especificacoesTecnicas} />
        <Metodologia texto={data.metodologia} />
        <Prazo prazo={data.prazo} />
        <Garantia texto={data.garantia} />
        <Investimentos precificacao={data.precificacao} />
        <Pagamento pagamento={data.pagamento} valorTotal={valorTotal} />
        <Assinatura clienteNome={data.clienteNome} dataEmissao={data.dataEmissao} />

        <SharedFooter
          leftText={`Proposta de Assessoria Pontual - OS ${data.codigoOS}`}
          rightText={formatarData(data.dataEmissao)}
          borderColor="info"
          fixed={true}
        />
      </Page>
    </Document>
  );
}
