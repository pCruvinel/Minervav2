/**
 * Template de Visita Técnica / Parecer Técnico (OS 08) em React PDF
 *
 * Estrutura:
 * - Header com logo e dados da empresa
 * - Dados da OS e Cliente
 * - Informações do Solicitante
 * - Dados da Visita
 * - Fotos (Grid 2x2 - máximo 10 fotos)
 * - Análise Técnica
 * - Footer
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, fontSize, commonStyles } from './shared-styles.ts';
import { formatarData } from '../utils/pdf-formatter.ts';

// ============================================
// INTERFACES
// ============================================

export interface Foto {
  url: string;
  descricao: string;
}

export interface Solicitante {
  nomeCompleto: string;
  contatoWhatsApp: string;
  condominio: string;
  cargo: string;
}

export interface Visita {
  tipoDocumento: string;
  areaVistoriada: string;
  detalhesSolicitacao: string;
  dataAgendamento: string;
  dataRealizacao: string;
}

export interface Analise {
  pontuacaoEngenheiro: string;
  pontuacaoMorador: string;
  manifestacaoPatologica: string;
  recomendacoesPrevias: string;
  gravidade: 'baixa' | 'media' | 'alta' | 'critica';
  origemNBR?: string;
  resultadoVisita: string;
  justificativa?: string;
}

export interface VisitaTecnicaData {
  // Dados da OS
  codigoOS: string;
  dataEmissao: string;
  clienteNome: string;

  // Solicitante
  solicitante: Solicitante;

  // Visita
  visita: Visita;

  // Fotos (máximo 10 total)
  fotosIniciais: Foto[];
  fotosLocal: Foto[];

  // Análise técnica
  analise: Analise;

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

  infoItemFull: {
    width: '100%',
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

  // Photo Grid (2x2 layout)
  photoSection: {
    marginBottom: spacing.lg,
  },

  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },

  photoItem: {
    width: '48%',
    marginBottom: spacing.md,
  },

  photo: {
    width: '100%',
    height: 150,
    objectFit: 'cover',
    borderRadius: 4,
    marginBottom: spacing.xs,
  },

  photoDescription: {
    fontSize: fontSize.xs,
    color: colors.neutral700,
    textAlign: 'center',
  },

  // Análise Section
  analiseSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },

  analiseCard: {
    padding: spacing.md,
    backgroundColor: colors.neutral50,
    borderRadius: 4,
    marginBottom: spacing.md,
  },

  gravidadeBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },

  gravidadeBaixa: {
    backgroundColor: colors.info,
  },

  gravidadeMedia: {
    backgroundColor: colors.warning,
  },

  gravidadeAlta: {
    backgroundColor: colors.error,
  },

  gravidadeCritica: {
    backgroundColor: colors.black,
  },

  gravidadeText: {
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

function Header({ data }: { data: VisitaTecnicaData }) {
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
        <Text style={styles.documentTitle}>VISITA TÉCNICA</Text>
        <Text style={styles.documentSubtitle}>Parecer Técnico</Text>
        <Text style={styles.documentSubtitle}>OS: {data.codigoOS}</Text>
        <Text style={styles.documentSubtitle}>
          Data: {formatarData(data.dataEmissao)}
        </Text>
      </View>
    </View>
  );
}

function DadosBasicos({ data }: { data: VisitaTecnicaData }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>DADOS BÁSICOS</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Cliente</Text>
          <Text style={styles.infoValue}>{data.clienteNome}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Tipo de Documento</Text>
          <Text style={styles.infoValue}>
            {data.visita.tipoDocumento === 'parecer' ? 'Parecer Técnico' : 'Visita Técnica'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function DadosSolicitante({ solicitante }: { solicitante: Solicitante }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>SOLICITANTE</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Nome Completo</Text>
          <Text style={styles.infoValue}>{solicitante.nomeCompleto}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Contato WhatsApp</Text>
          <Text style={styles.infoValue}>{solicitante.contatoWhatsApp}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Condomínio</Text>
          <Text style={styles.infoValue}>{solicitante.condominio}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Cargo</Text>
          <Text style={styles.infoValue}>{solicitante.cargo}</Text>
        </View>
      </View>
    </View>
  );
}

function DadosVisita({ visita }: { visita: Visita }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>INFORMAÇÕES DA VISITA</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Área Vistoriada</Text>
          <Text style={styles.infoValue}>{visita.areaVistoriada}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Data de Agendamento</Text>
          <Text style={styles.infoValue}>
            {visita.dataAgendamento ? formatarData(visita.dataAgendamento) : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Data de Realização</Text>
          <Text style={styles.infoValue}>
            {visita.dataRealizacao ? formatarData(visita.dataRealizacao) : 'N/A'}
          </Text>
        </View>
      </View>
      <View style={styles.infoItemFull}>
        <Text style={styles.infoLabel}>Detalhes da Solicitação</Text>
        <Text style={styles.infoValue}>{visita.detalhesSolicitacao}</Text>
      </View>
    </View>
  );
}

function FotosGrid({ fotos, titulo }: { fotos: Foto[]; titulo: string }) {
  if (!fotos || fotos.length === 0) {
    return null;
  }

  return (
    <View style={styles.photoSection}>
      <Text style={styles.sectionTitle}>{titulo}</Text>
      <View style={styles.photoGrid}>
        {fotos.map((foto, index) => (
          <View key={index} style={styles.photoItem}>
            <Image src={foto.url} style={styles.photo} />
            <Text style={styles.photoDescription}>
              Foto {index + 1}: {foto.descricao}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function AnaliseTecnica({ analise }: { analise: Analise }) {
  const getGravidadeLabel = (gravidade: string) => {
    const labels: Record<string, string> = {
      baixa: 'BAIXA',
      media: 'MÉDIA',
      alta: 'ALTA',
      critica: 'CRÍTICA',
    };
    return labels[gravidade] || 'NÃO DEFINIDA';
  };

  const getGravidadeStyle = (gravidade: string) => {
    const styleMap: Record<string, any> = {
      baixa: styles.gravidadeBaixa,
      media: styles.gravidadeMedia,
      alta: styles.gravidadeAlta,
      critica: styles.gravidadeCritica,
    };
    return styleMap[gravidade] || styles.gravidadeBaixa;
  };

  return (
    <View style={styles.analiseSection}>
      <Text style={styles.sectionTitle}>ANÁLISE TÉCNICA</Text>

      <View style={styles.analiseCard}>
        <View style={[styles.gravidadeBadge, getGravidadeStyle(analise.gravidade)]}>
          <Text style={styles.gravidadeText}>
            GRAVIDADE: {getGravidadeLabel(analise.gravidade)}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Pontuação do Engenheiro</Text>
            <Text style={styles.infoValue}>
              {analise.pontuacaoEngenheiro === 'sim' ? 'Necessita' : 'Não necessita'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Pontuação do Morador</Text>
            <Text style={styles.infoValue}>
              {analise.pontuacaoMorador === 'sim' ? 'Solicitou' : 'Não solicitou'}
            </Text>
          </View>
        </View>

        {analise.manifestacaoPatologica && (
          <View style={styles.infoItemFull}>
            <Text style={styles.infoLabel}>Manifestação Patológica</Text>
            <Text style={styles.infoValue}>{analise.manifestacaoPatologica}</Text>
          </View>
        )}

        {analise.recomendacoesPrevias && (
          <View style={styles.infoItemFull}>
            <Text style={styles.infoLabel}>Recomendações Prévias</Text>
            <Text style={styles.infoValue}>{analise.recomendacoesPrevias}</Text>
          </View>
        )}

        {analise.origemNBR && (
          <View style={styles.infoItemFull}>
            <Text style={styles.infoLabel}>Referências Normativas (NBR)</Text>
            <Text style={styles.infoValue}>{analise.origemNBR}</Text>
          </View>
        )}

        <View style={styles.infoItemFull}>
          <Text style={styles.infoLabel}>Resultado da Visita</Text>
          <Text style={styles.infoValue}>{analise.resultadoVisita}</Text>
        </View>

        {analise.justificativa && (
          <View style={styles.infoItemFull}>
            <Text style={styles.infoLabel}>Justificativa</Text>
            <Text style={styles.infoValue}>{analise.justificativa}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function Footer({ data }: { data: VisitaTecnicaData }) {
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

export function VisitaTecnicaTemplate({ data }: { data: VisitaTecnicaData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header data={data} />
        <DadosBasicos data={data} />
        <DadosSolicitante solicitante={data.solicitante} />
        <DadosVisita visita={data.visita} />
        <FotosGrid fotos={data.fotosIniciais} titulo="FOTOS INICIAIS" />
        <FotosGrid fotos={data.fotosLocal} titulo="FOTOS DO LOCAL" />
        <AnaliseTecnica analise={data.analise} />
        <Footer data={data} />
      </Page>
    </Document>
  );
}
