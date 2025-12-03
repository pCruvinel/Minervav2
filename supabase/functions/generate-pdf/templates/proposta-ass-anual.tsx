/**
 * Template de Proposta de Assessoria Recorrente (OS 12)
 *
 * Estrutura:
 * - Header com divisória AZUL
 * - Dados do Cliente
 * - Escopo do Serviço
 * - Tabela de SLA (Header Azul)
 * - Investimento (mensal e anual)
 * - Forma de Pagamento
 * - Footer com borda azul
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, fontSize, commonStyles } from './shared-styles.ts';
import { formatarData, formatarCpfCnpj, formatarMoeda } from '../utils/pdf-formatter.ts';
import { SharedHeader } from './components/shared-header.tsx';
import {
  Table,
  TableHeaderRow,
  TableHeaderCell,
  TableRow,
  TableCell,
  SummaryRow,
} from './components/table-components.tsx';
import { SharedFooter } from './components/shared-footer.tsx';

// ============================================
// INTERFACES
// ============================================

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
  clienteResponsavel?: string;

  // Escopo
  escopoServico: string;

  // SLA
  prazoResposta?: string; // Ex: "24 horas"
  frequenciaVisita?: string; // Ex: "Semanal", "Quinzenal", "Mensal"
  visitasMes?: number; // Ex: 4

  // Investimento
  valorMensal: string | number;
  valorAnual?: string | number;

  // Pagamento
  formasPagamento?: string[]; // Ex: ["Boleto", "PIX"]
}

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  ...commonStyles,

  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.neutral900,
  },

  // Dados do Cliente
  clienteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral300,
  },

  clienteRow: {
    flexDirection: 'row',
    width: '100%',
  },

  clienteCell: {
    padding: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.neutral300,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral300,
  },

  clienteLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: colors.neutral700,
    marginBottom: spacing.xs,
  },

  clienteValue: {
    fontSize: fontSize.sm,
    color: colors.neutral900,
  },

  // Seção
  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottom: `2 solid ${colors.info}`,
  },

  sectionContent: {
    fontSize: fontSize.sm,
    color: colors.neutral700,
    lineHeight: 1.5,
    marginTop: spacing.md,
  },

  // Investimento
  investimentoContainer: {
    marginTop: spacing.lg,
  },

  investimentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },

  investimentoLabel: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral800,
  },

  investimentoValue: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.primary,
  },

  // Pagamento
  pagamentoLabel: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },

  pagamentoValue: {
    fontSize: fontSize.sm,
    color: colors.neutral700,
  },
});

// ============================================
// COMPONENTES
// ============================================

function DadosCliente({ data }: { data: PropostaAssAnualData }) {
  return (
    <View style={styles.clienteGrid}>
      <View style={styles.clienteRow}>
        <View style={[styles.clienteCell, { width: '50%' }]}>
          <Text style={styles.clienteLabel}>CLIENTE</Text>
          <Text style={styles.clienteValue}>{data.clienteNome}</Text>
        </View>
        <View style={[styles.clienteCell, { width: '50%', borderRightWidth: 0 }]}>
          <Text style={styles.clienteLabel}>CPF/CNPJ</Text>
          <Text style={styles.clienteValue}>{formatarCpfCnpj(data.clienteCpfCnpj)}</Text>
        </View>
      </View>

      <View style={styles.clienteRow}>
        <View style={[styles.clienteCell, { width: '50%' }]}>
          <Text style={styles.clienteLabel}>EMAIL</Text>
          <Text style={styles.clienteValue}>{data.clienteEmail || '-'}</Text>
        </View>
        <View style={[styles.clienteCell, { width: '50%', borderRightWidth: 0 }]}>
          <Text style={styles.clienteLabel}>TELEFONE</Text>
          <Text style={styles.clienteValue}>{data.clienteTelefone || '-'}</Text>
        </View>
      </View>

      <View style={[styles.clienteRow, { borderBottomWidth: 0 }]}>
        <View style={[styles.clienteCell, { width: '100%', borderRightWidth: 0, borderBottomWidth: 0 }]}>
          <Text style={styles.clienteLabel}>ENDEREÇO</Text>
          <Text style={styles.clienteValue}>{data.clienteEndereco || '-'}</Text>
        </View>
      </View>
    </View>
  );
}

function EscopoServico({ escopo }: { escopo: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ESCOPO DO SERVIÇO</Text>
      <Text style={styles.sectionContent}>{escopo}</Text>
    </View>
  );
}

function TabelaSLA({
  prazoResposta = '24 horas',
  frequenciaVisita = 'Mensal',
  visitasMes = 4,
}: {
  prazoResposta?: string;
  frequenciaVisita?: string;
  visitasMes?: number;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>NÍVEL DE SERVIÇO (SLA)</Text>

      <Table>
        <TableHeaderRow>
          <TableHeaderCell flexValue={1}>ITEM</TableHeaderCell>
          <TableHeaderCell flexValue={2}>DESCRIÇÃO</TableHeaderCell>
          <TableHeaderCell flexValue={2}>COMPROMISSO</TableHeaderCell>
        </TableHeaderRow>

        <TableRow>
          <TableCell flexValue={1}>1</TableCell>
          <TableCell flexValue={2}>Prazo de Resposta</TableCell>
          <TableCell flexValue={2} textAlign="center">
            {prazoResposta}
          </TableCell>
        </TableRow>

        <TableRow alternate>
          <TableCell flexValue={1}>2</TableCell>
          <TableCell flexValue={2}>Frequência de Visita</TableCell>
          <TableCell flexValue={2} textAlign="center">
            {frequenciaVisita}
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell flexValue={1}>3</TableCell>
          <TableCell flexValue={2}>Visitações por Mês</TableCell>
          <TableCell flexValue={2} textAlign="center">
            {visitasMes}
          </TableCell>
        </TableRow>
      </Table>
    </View>
  );
}

function Investimento({
  valorMensal,
  valorAnual,
}: {
  valorMensal: string | number;
  valorAnual?: string | number;
}) {
  const mensal = typeof valorMensal === 'string' ? parseFloat(valorMensal) : valorMensal;
  const anual = valorAnual
    ? typeof valorAnual === 'string'
      ? parseFloat(valorAnual)
      : valorAnual
    : mensal * 12;

  return (
    <View style={styles.investimentoContainer}>
      <Text style={styles.sectionTitle}>INVESTIMENTO</Text>

      <View style={styles.investimentoRow}>
        <Text style={styles.investimentoLabel}>Valor Mensal:</Text>
        <Text style={styles.investimentoValue}>R$ {formatarMoeda(mensal)}</Text>
      </View>

      <View style={[styles.investimentoRow, { borderBottomWidth: 2, borderBottomColor: colors.primary }]}>
        <Text style={styles.investimentoLabel}>Valor Anual (12 meses):</Text>
        <Text style={styles.investimentoValue}>R$ {formatarMoeda(anual)}</Text>
      </View>
    </View>
  );
}

function Pagamento({ formasPagamento = ['Boleto', 'PIX'] }: { formasPagamento?: string[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>FORMA DE PAGAMENTO</Text>
      <Text style={styles.pagamentoLabel}>Recorrência Mensal</Text>
      <Text style={styles.pagamentoValue}>
        Boleto bancário ou PIX, conforme preferência do cliente, com vencimento no 1º dia de cada mês.
      </Text>
    </View>
  );
}

// ============================================
// TEMPLATE PRINCIPAL
// ============================================

export function PropostaAssAnualTemplate({ data }: { data: PropostaAssAnualData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <SharedHeader
          documentTitle="PROPOSTA DE ASSESSORIA"
          documentSubtitle="Assessoria Recorrente Anual"
          documentDate={formatarData(data.dataEmissao)}
          dividerColor="info"
        />

        <DadosCliente data={data} />
        <EscopoServico escopo={data.escopoServico} />
        <TabelaSLA
          prazoResposta={data.prazoResposta}
          frequenciaVisita={data.frequenciaVisita}
          visitasMes={data.visitasMes}
        />
        <Investimento valorMensal={data.valorMensal} valorAnual={data.valorAnual} />
        <Pagamento formasPagamento={data.formasPagamento} />

        <SharedFooter
          leftText={`Proposta de Assessoria - OS ${data.codigoOS}`}
          rightText={formatarData(data.dataEmissao)}
          borderColor="info"
          fixed={true}
        />
      </Page>
    </Document>
  );
}
