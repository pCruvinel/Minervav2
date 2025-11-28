/**
 * Template de Parecer Técnico de Reforma (OS 07) em React PDF
 *
 * Estrutura:
 * - Header com logo e dados da empresa
 * - Dados da OS e Cliente
 * - Informações do Solicitante
 * - Alterações Propostas (tabela)
 * - Executores da Obra (tabela)
 * - Plano de Descarte de Resíduos
 * - Tipos de Obra e Necessidade de ART
 * - Análise do Engenheiro (APROVADO/REPROVADO)
 * - Footer
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, fontSize, commonStyles } from './shared-styles.ts';
import { formatarData } from '../utils/pdf-formatter.ts';

// ============================================
// INTERFACES
// ============================================

export interface Alteracao {
  tipo: string;
  descricao: string;
  local?: string;
}

export interface Executor {
  nome: string;
  cpf: string;
  funcao: string;
}

export interface AnaliseEngenheiro {
  aprovado: boolean;
  comentario: string;
  dataAnalise: string;
  analista: string;
}

export interface ParecerReformaData {
  // Dados da OS
  codigoOS: string;
  dataEmissao: string;

  // Cliente
  clienteNome: string;
  clienteCpfCnpj: string;
  condominio: string;
  bloco: string;
  unidade: string;

  // Solicitante
  solicitacao: {
    nomeSolicitante: string;
    contato: string;
    email: string;
  };

  // Alterações propostas
  alteracoes: Alteracao[];

  // Executores
  executores: Executor[];

  // Plano de descarte
  planoDescarte: string;

  // Tipos de obra
  tiposObra: string[];
  precisaART: boolean;

  // Análise do engenheiro
  analise: AnaliseEngenheiro;

  // Dados da Empresa
  empresaNome: string;
  empresaEndereco: string;
  empresaTelefone: string;
  empresaEmail: string;
  empresaSite: string;
}

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  ...commonStyles,

  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    padding: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.neutral900,
  },

  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottom: `3 solid ${colors.primary}`,
  },

  headerLeft: {
    flexDirection: 'column',
  },

  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },

  empresaNome: {
    fontSize: fontSize['2xl'],
    fontFamily: fonts.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },

  empresaInfo: {
    fontSize: fontSize.xs,
    color: colors.neutral600,
    marginBottom: 2,
  },

  documentTitle: {
    fontSize: fontSize['3xl'],
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.xs,
  },

  documentSubtitle: {
    fontSize: fontSize.base,
    color: colors.neutral600,
  },

  // Info Section
  infoSection: {
    marginBottom: spacing.lg,
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  infoItem: {
    width: '48%',
    marginBottom: spacing.sm,
  },

  infoLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: colors.neutral600,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: fontSize.sm,
    color: colors.neutral900,
  },

  // Table
  table: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.neutral100,
    padding: spacing.sm,
    borderBottom: `2 solid ${colors.neutral300}`,
  },

  tableHeaderCell: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral800,
  },

  tableRow: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderBottom: `1 solid ${colors.neutral200}`,
  },

  tableCell: {
    fontSize: fontSize.xs,
    color: colors.neutral700,
  },

  // Análise Section (Destaque)
  analiseSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.neutral50,
    borderRadius: 4,
    borderLeft: `4 solid ${colors.primary}`,
  },

  analiseTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  analiseTitle: {
    fontSize: fontSize.xl,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginRight: spacing.md,
  },

  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
  },

  statusBadgeAprovado: {
    backgroundColor: colors.success,
  },

  statusBadgeReprovado: {
    backgroundColor: colors.error,
  },

  statusText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing['2xl'],
    right: spacing['2xl'],
    paddingTop: spacing.md,
    borderTop: `1 solid ${colors.neutral200}`,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  footerText: {
    fontSize: fontSize.xs,
    color: colors.neutral500,
  },
});

// ============================================
// COMPONENTES
// ============================================

function Header({ data }: { data: ParecerReformaData }) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <Text style={styles.empresaNome}>{data.empresaNome}</Text>
        <Text style={styles.empresaInfo}>{data.empresaEndereco}</Text>
        <Text style={styles.empresaInfo}>{data.empresaTelefone}</Text>
        <Text style={styles.empresaInfo}>{data.empresaEmail}</Text>
        <Text style={styles.empresaInfo}>{data.empresaSite}</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.documentTitle}>PARECER TÉCNICO</Text>
        <Text style={styles.documentSubtitle}>Termo de Comunicação de Reforma</Text>
        <Text style={styles.documentSubtitle}>OS: {data.codigoOS}</Text>
        <Text style={styles.documentSubtitle}>
          Data: {formatarData(data.dataEmissao)}
        </Text>
      </View>
    </View>
  );
}

function DadosCliente({ data }: { data: ParecerReformaData }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>DADOS DO CLIENTE</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Nome/Razão Social</Text>
          <Text style={styles.infoValue}>{data.clienteNome}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>CPF/CNPJ</Text>
          <Text style={styles.infoValue}>{data.clienteCpfCnpj}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Condomínio</Text>
          <Text style={styles.infoValue}>{data.condominio}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Bloco</Text>
          <Text style={styles.infoValue}>{data.bloco}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Unidade</Text>
          <Text style={styles.infoValue}>{data.unidade}</Text>
        </View>
      </View>
    </View>
  );
}

function DadosSolicitante({ data }: { data: ParecerReformaData }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>SOLICITANTE</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Nome</Text>
          <Text style={styles.infoValue}>{data.solicitacao.nomeSolicitante}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Contato</Text>
          <Text style={styles.infoValue}>{data.solicitacao.contato}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{data.solicitacao.email}</Text>
        </View>
      </View>
    </View>
  );
}

function AlteracoesPropostas({ alteracoes }: { alteracoes: Alteracao[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ALTERAÇÕES PROPOSTAS</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Tipo</Text>
          <Text style={[styles.tableHeaderCell, { width: '50%' }]}>Descrição</Text>
          <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Local</Text>
        </View>
        {alteracoes.map((alt, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '25%' }]}>{alt.tipo}</Text>
            <Text style={[styles.tableCell, { width: '50%' }]}>{alt.descricao}</Text>
            <Text style={[styles.tableCell, { width: '25%' }]}>{alt.local || '-'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ExecutoresObra({ executores }: { executores: Executor[] }) {
  if (!executores || executores.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>EXECUTORES DA OBRA</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Nome</Text>
          <Text style={[styles.tableHeaderCell, { width: '30%' }]}>CPF</Text>
          <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Função</Text>
        </View>
        {executores.map((exec, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '40%' }]}>{exec.nome}</Text>
            <Text style={[styles.tableCell, { width: '30%' }]}>{exec.cpf}</Text>
            <Text style={[styles.tableCell, { width: '30%' }]}>{exec.funcao}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PlanoDescarte({ plano }: { plano: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>PLANO DE DESCARTE DE RESÍDUOS</Text>
      <Text style={styles.text}>{plano}</Text>
    </View>
  );
}

function TiposObra({ tipos, precisaART }: { tipos: string[]; precisaART: boolean }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>TIPOS DE OBRA</Text>
      {tipos.map((tipo, index) => (
        <Text key={index} style={[styles.text, { marginBottom: spacing.xs }]}>
          • {tipo}
        </Text>
      ))}
      <Text style={[styles.text, { marginTop: spacing.sm, fontFamily: fonts.bold }]}>
        Necessita ART: {precisaART ? 'SIM' : 'NÃO'}
      </Text>
    </View>
  );
}

function AnaliseEngenheiro({ analise }: { analise: AnaliseEngenheiro }) {
  return (
    <View style={styles.analiseSection}>
      <View style={styles.analiseTitleContainer}>
        <Text style={styles.analiseTitle}>ANÁLISE DO ENGENHEIRO</Text>
        <View
          style={[
            styles.statusBadge,
            analise.aprovado ? styles.statusBadgeAprovado : styles.statusBadgeReprovado,
          ]}
        >
          <Text style={styles.statusText}>
            {analise.aprovado ? 'APROVADO' : 'REPROVADO'}
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: spacing.sm }}>
        <Text style={styles.infoLabel}>Parecer:</Text>
        <Text style={styles.text}>{analise.comentario}</Text>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Data da Análise</Text>
          <Text style={styles.infoValue}>{formatarData(analise.dataAnalise)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Responsável Técnico</Text>
          <Text style={styles.infoValue}>{analise.analista}</Text>
        </View>
      </View>
    </View>
  );
}

function Footer({ data }: { data: ParecerReformaData }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        {data.empresaNome} - {data.empresaTelefone}
      </Text>
      <Text style={styles.footerText}>{data.empresaEmail}</Text>
    </View>
  );
}

// ============================================
// DOCUMENTO PRINCIPAL
// ============================================

export function ParecerReformaTemplate({ data }: { data: ParecerReformaData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header data={data} />
        <DadosCliente data={data} />
        <DadosSolicitante data={data} />
        <AlteracoesPropostas alteracoes={data.alteracoes} />
        <ExecutoresObra executores={data.executores} />
        <PlanoDescarte plano={data.planoDescarte} />
        <TiposObra tipos={data.tiposObra} precisaART={data.precisaART} />
        <AnaliseEngenheiro analise={data.analise} />
        <Footer data={data} />
      </Page>
    </Document>
  );
}
