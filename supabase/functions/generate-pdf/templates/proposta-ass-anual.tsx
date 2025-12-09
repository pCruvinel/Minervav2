/**
 * Template de Proposta de Assessoria Anual (OS 05)
 *
 * Estrutura baseada no documento de referência:
 * - Header com divisória AZUL (SharedHeader)
 * - 1. OBJETIVO (bullets dinâmicos)
 * - 2. ESPECIFICAÇÕES TÉCNICAS (tabela ITEM | DESCRIÇÃO)
 * - METODOLOGIA (texto editável)
 * - 3. PRAZO (horário de funcionamento + suporte emergencial)
 * - 4. GARANTIA (texto editável)
 * - 5. INVESTIMENTOS (execução + impostos = total)
 * - 6. PAGAMENTO (desconto por pagamento antecipado)
 * - Footer com assinatura
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, fontSize, commonStyles } from './shared-styles.ts';
import { formatarData, formatarCpfCnpj, formatarMoeda } from '../utils/pdf-formatter.ts';
import { SharedHeader } from './components/shared-header.tsx';
import { SharedFooter } from './components/shared-footer.tsx';

// ============================================
// INTERFACES
// ============================================

export interface EspecificacaoTecnica {
  descricao: string;
}

export interface DadosPrazoAnual {
  horarioFuncionamento: string; // Ex: "Segunda a sexta de 8h às 18h"
  suporteEmergencial: string;   // Ex: "Suporte técnico emergencial - atuação máxima de 2h"
}

export interface DadosPrecificacao {
  valorParcial: number;
  percentualImposto: number;
}

export interface DadosPagamento {
  percentualDesconto: number;
  diaVencimento: number;
}

export interface PropostaAssAnualData {
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
  prazo: DadosPrazoAnual;
  garantia: string;
  precificacao: DadosPrecificacao;
  pagamento: DadosPagamento;
}

// Textos padrão (usados como fallback)
const METODOLOGIA_PADRAO = `• Acompanhamento semanal in loco
• Relatório mensal de acompanhamento de plano de manutenção
• Mais de 35 equipamentos de diagnóstico`;

const GARANTIA_PADRAO = `A qualidade do serviço prestado é garantida integralmente na responsabilidade técnica de empresa habilitada para exercício da função, com corpo técnico formado por engenheiros especialistas na área, devidamente registrados no órgão da classe CREA-MA.`;

const PRAZO_PADRAO: DadosPrazoAnual = {
  horarioFuncionamento: 'Segunda a sexta de 8h às 18h',
  suporteEmergencial: 'Suporte técnico emergencial - atuação máxima de 2h',
};

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

  // Seção
  section: {
    marginBottom: spacing.lg,
  },

  sectionTitleContainer: {
    backgroundColor: colors.info,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },

  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  sectionContent: {
    paddingHorizontal: spacing.sm,
  },

  // Bullets
  bulletItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },

  bulletPoint: {
    width: 12,
    fontSize: fontSize.sm,
    color: colors.neutral700,
  },

  bulletText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral700,
    lineHeight: 1.4,
  },

  // Tabela de Especificações
  table: {
    borderWidth: 1,
    borderColor: colors.neutral300,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.info,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral300,
  },

  tableHeaderCell: {
    padding: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.neutral400,
  },

  tableHeaderText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },

  tableRowAlternate: {
    backgroundColor: colors.neutral50,
  },

  tableCell: {
    padding: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.neutral200,
  },

  tableCellText: {
    fontSize: fontSize.sm,
    color: colors.neutral800,
  },

  // Metodologia
  metodologiaContainer: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },

  metodologiaTitle: {
    fontSize: fontSize.md,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.sm,
  },

  // Prazo
  prazoRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },

  prazoLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral700,
  },

  // Garantia
  garantiaTitleContainer: {
    backgroundColor: colors.info,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },

  garantiaTitle: {
    fontSize: fontSize.md,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  garantiaText: {
    fontSize: fontSize.sm,
    color: colors.neutral700,
    lineHeight: 1.5,
    paddingHorizontal: spacing.sm,
    textAlign: 'justify',
  },

  // Investimentos
  investimentoTable: {
    borderWidth: 1,
    borderColor: colors.neutral300,
    marginTop: spacing.sm,
  },

  investimentoRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },

  investimentoDescricao: {
    flex: 3,
    padding: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.neutral200,
  },

  investimentoValor: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'flex-end',
  },

  investimentoTotalRow: {
    flexDirection: 'row',
    backgroundColor: colors.success,
  },

  investimentoTotalLabel: {
    flex: 3,
    padding: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.neutral300,
  },

  investimentoTotalValue: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'flex-end',
  },

  investimentoImpostoRow: {
    flexDirection: 'row',
    backgroundColor: colors.warning,
  },

  // Pagamento
  pagamentoContainer: {
    marginTop: spacing.lg,
  },

  pagamentoSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  pagamentoText: {
    fontSize: fontSize.sm,
    color: colors.neutral700,
  },

  // Assinatura
  assinaturaContainer: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
  },

  assinaturaLinha: {
    width: '60%',
    borderTopWidth: 1,
    borderTopColor: colors.neutral400,
    paddingTop: spacing.sm,
    marginTop: spacing.xl,
    alignItems: 'center',
  },

  assinaturaTexto: {
    fontSize: fontSize.sm,
    color: colors.neutral700,
  },
});

// ============================================
// COMPONENTES
// ============================================

function Objetivo({ objetivo }: { objetivo: string }) {
  // Dividir objetivo em bullets por quebra de linha ou ponto e vírgula
  const bullets = objetivo
    .split(/[;\n]/)
    .map(item => item.replace(/^[•\-*]\s*/, '').trim())
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
        {/* Header */}
        <View style={styles.tableHeader}>
          <View style={[styles.tableHeaderCell, { width: 40 }]}>
            <Text style={styles.tableHeaderText}>ITEM</Text>
          </View>
          <View style={[styles.tableHeaderCell, { flex: 1, borderRightWidth: 0 }]}>
            <Text style={styles.tableHeaderText}>DESCRIÇÃO</Text>
          </View>
        </View>

        {/* Rows */}
        {especificacoes.map((especificacao, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index % 2 === 1 && styles.tableRowAlternate,
              index === especificacoes.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={[styles.tableCell, { width: 40 }]}>
              <Text style={styles.tableCellText}>{index + 1}</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}>
              <Text style={styles.tableCellText}>{especificacao.descricao}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function Metodologia({ texto }: { texto: string }) {
  const textoFinal = texto || METODOLOGIA_PADRAO;

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

function Prazo({ prazo }: { prazo: DadosPrazoAnual }) {
  const prazoFinal = {
    horarioFuncionamento: prazo?.horarioFuncionamento || PRAZO_PADRAO.horarioFuncionamento,
    suporteEmergencial: prazo?.suporteEmergencial || PRAZO_PADRAO.suporteEmergencial,
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>3. PRAZO:</Text>
      </View>
      <View style={styles.sectionContent}>
        <View style={styles.prazoRow}>
          <Text style={styles.prazoLabel}>• {prazoFinal.horarioFuncionamento}</Text>
        </View>
        <View style={styles.prazoRow}>
          <Text style={styles.prazoLabel}>• {prazoFinal.suporteEmergencial}</Text>
        </View>
      </View>
    </View>
  );
}

function Garantia({ texto }: { texto: string }) {
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
        {/* Header */}
        <View style={[styles.investimentoRow, { backgroundColor: colors.info }]}>
          <View style={[styles.investimentoDescricao]}>
            <Text style={[styles.tableCellText, { color: colors.white, fontFamily: fonts.bold }]}>
              DESCRIÇÃO
            </Text>
            <Text style={[styles.tableCellText, { color: colors.white, fontSize: fontSize.xs }]}>
              ITEM INCLUSO MATERIAL, MÃO DE OBRA, LOGÍSTICA E EVENTUALIDADES
            </Text>
          </View>
          <View style={[styles.investimentoValor]}>
            <Text style={[styles.tableCellText, { color: colors.white, fontFamily: fonts.bold }]}>
              TOTAL
            </Text>
          </View>
        </View>

        {/* Valor Parcial */}
        <View style={styles.investimentoRow}>
          <View style={styles.investimentoDescricao}>
            <Text style={styles.tableCellText}>1</Text>
            <Text style={styles.tableCellText}>Execução de obra e entrega de serviço concluído;</Text>
          </View>
          <View style={styles.investimentoValor}>
            <Text style={styles.tableCellText}>{formatarMoeda(precificacao.valorParcial)}</Text>
          </View>
        </View>

        {/* Impostos */}
        <View style={styles.investimentoImpostoRow}>
          <View style={styles.investimentoDescricao}>
            <Text style={[styles.tableCellText, { fontFamily: fonts.bold }]}>
              IMPOSTOS (EMISSÃO DE NOTA FISCAL DE SERVIÇOS):
            </Text>
          </View>
          <View style={styles.investimentoValor}>
            <Text style={styles.tableCellText}>{formatarMoeda(valorImposto)}</Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.investimentoTotalRow}>
          <View style={styles.investimentoTotalLabel}>
            <Text style={[styles.tableCellText, { color: colors.white, fontFamily: fonts.bold }]}>
              INVESTIMENTO + IMPOSTOS:
            </Text>
          </View>
          <View style={styles.investimentoTotalValue}>
            <Text style={[styles.tableCellText, { color: colors.white, fontFamily: fonts.bold }]}>
              {formatarMoeda(valorTotal)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function Pagamento({ pagamento, valorTotal }: { pagamento: DadosPagamento; valorTotal: number }) {
  const valorComDesconto = valorTotal * (1 - pagamento.percentualDesconto / 100);

  return (
    <View style={styles.pagamentoContainer}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>6. PAGAMENTO</Text>
      </View>

      <View style={styles.sectionContent}>
        <Text style={styles.pagamentoSubtitle}>6.1 PROPOSTAS:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs }}>
          <Text style={[styles.tableCellText, { fontFamily: fonts.bold, marginRight: spacing.sm }]}>
            R$
          </Text>
          <Text style={[styles.tableCellText, { fontSize: fontSize.lg, fontFamily: fonts.bold }]}>
            {formatarMoeda(valorComDesconto).replace('R$', '').trim()}
          </Text>
          <Text style={[styles.pagamentoText, { marginLeft: spacing.md }]}>
            {pagamento.percentualDesconto}% de desconto para pagamento no quinto dia útil do Mês
          </Text>
        </View>
      </View>
    </View>
  );
}

function Assinatura({ clienteNome, dataEmissao }: { clienteNome: string; dataEmissao: string }) {
  return (
    <View style={styles.assinaturaContainer}>
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

export function PropostaAssAnualTemplate({ data }: { data: PropostaAssAnualData }) {
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
          leftText={`Proposta de Assessoria Anual - OS ${data.codigoOS}`}
          rightText={formatarData(data.dataEmissao)}
          borderColor="info"
          fixed={true}
        />
      </Page>
    </Document>
  );
}
