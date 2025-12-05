/**
 * Template de Proposta de Laudo Pontual (OS 11)
 *
 * Estrutura:
 * - Header com divisória AZUL
 * - Dados do Cliente
 * - Escopo Técnico
 * - Tabela de Entregáveis (Header Azul)
 * - Prazo de Entrega
 * - Investimento
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

export interface Entregavel {
  nome: string;
  prazo: string;
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
  clienteResponsavel?: string;

  // Escopo Técnico
  objetoAvaliacao: string;
  metodologia?: string;

  // Entregáveis
  entregaveis?: Entregavel[];

  // Prazo
  prazoDias?: number; // Ex: 10

  // Investimento
  valorTotal: string | number;

  // Pagamento
  percentualEntrada?: number; // Ex: 40 (%)
  percentualEntrega?: number; // Ex: 60 (%)
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
    padding: spacing.md,
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral300,
  },

  investimentoValue: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
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
    marginBottom: spacing.xs,
  },
});

// ============================================
// COMPONENTES
// ============================================

function DadosCliente({ data }: { data: PropostaAssPontualData }) {
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

function EscopoTecnico({
  objetoAvaliacao,
  metodologia,
}: {
  objetoAvaliacao: string;
  metodologia?: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ESCOPO TÉCNICO</Text>

      <Text style={styles.sectionContent}>
        <Text style={{ fontFamily: fonts.bold }}>Objeto da Avaliação:</Text>
        {'\n'}
        {objetoAvaliacao}
      </Text>

      {metodologia && (
        <Text style={styles.sectionContent}>
          <Text style={{ fontFamily: fonts.bold }}>Metodologia:</Text>
          {'\n'}
          {metodologia}
        </Text>
      )}
    </View>
  );
}

function TabelaEntregaveis({
  entregaveis = [
    { nome: 'Laudo Técnico Completo', prazo: '10 dias úteis' },
    { nome: 'ART / RRT', prazo: '3 dias após laudo' },
    { nome: 'Fotos Técnicas', prazo: 'Junto com laudo' },
    { nome: 'Recomendações Técnicas', prazo: 'Incluído no laudo' },
  ],
}: {
  entregaveis?: Entregavel[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ENTREGÁVEIS</Text>

      <Table>
        <TableHeaderRow>
          <TableHeaderCell flexValue={1}>ITEM</TableHeaderCell>
          <TableHeaderCell flexValue={3}>ENTREGÁVEL</TableHeaderCell>
          <TableHeaderCell flexValue={2}>PRAZO</TableHeaderCell>
        </TableHeaderRow>

        {entregaveis.map((entregavel, index) => (
          <TableRow key={index} alternate={index % 2 === 1}>
            <TableCell flexValue={1}>{index + 1}</TableCell>
            <TableCell flexValue={3}>{entregavel.nome}</TableCell>
            <TableCell flexValue={2} textAlign="center">
              {entregavel.prazo}
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </View>
  );
}

function Investimento({ valor }: { valor: string | number }) {
  const numValor = typeof valor === 'string' ? parseFloat(valor) : valor;

  return (
    <View style={styles.investimentoContainer}>
      <Text style={styles.investimentoValue}>Investimento Total: R$ {formatarMoeda(numValor)}</Text>
    </View>
  );
}

function Pagamento({
  valor,
  percentualEntrada = 40,
  percentualEntrega = 60,
}: {
  valor: string | number;
  percentualEntrada?: number;
  percentualEntrega?: number;
}) {
  const numValor = typeof valor === 'string' ? parseFloat(valor) : valor;
  const entrada = (numValor * percentualEntrada) / 100;
  const entrega = (numValor * percentualEntrega) / 100;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>FORMA DE PAGAMENTO</Text>

      <Text style={styles.pagamentoLabel}>{percentualEntrada}% na Assinatura da Proposta</Text>
      <Text style={styles.pagamentoValue}>R$ {formatarMoeda(entrada)}</Text>

      <Text style={styles.pagamentoLabel}>{percentualEntrega}% na Entrega do Laudo</Text>
      <Text style={styles.pagamentoValue}>R$ {formatarMoeda(entrega)}</Text>

      <Text style={[styles.pagamentoValue, { marginTop: spacing.md, borderTop: `1 solid ${colors.neutral300}`, paddingTop: spacing.md }]}>
        Total: R$ {formatarMoeda(numValor)}
      </Text>
    </View>
  );
}

// ============================================
// TEMPLATE PRINCIPAL
// ============================================

export function PropostaAssPontualTemplate({ data }: { data: PropostaAssPontualData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <SharedHeader
          documentTitle="PROPOSTA DE LAUDO TÉCNICO"
          documentSubtitle="Laudo Pontual / Assessoria Técnica"
          documentDate={formatarData(data.dataEmissao)}
          dividerColor="info"
        />

        <DadosCliente data={data} />
        <EscopoTecnico objetoAvaliacao={data.objetoAvaliacao} metodologia={data.metodologia} />
        <TabelaEntregaveis entregaveis={data.entregaveis} />
        <Investimento valor={data.valorTotal} />
        <Pagamento
          valor={data.valorTotal}
          percentualEntrada={data.percentualEntrada}
          percentualEntrega={data.percentualEntrega}
        />

        <SharedFooter
          leftText={`Proposta de Laudo - OS ${data.codigoOS}`}
          rightText={formatarData(data.dataEmissao)}
          borderColor="info"
          fixed={true}
        />
      </Page>
    </Document>
  );
}
