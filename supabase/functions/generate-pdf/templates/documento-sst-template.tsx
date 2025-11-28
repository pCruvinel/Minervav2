/**
 * Template de Documento de Segurança do Trabalho (SST) em React PDF
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, fontSize, commonStyles } from './shared-styles.ts';
import { formatarData } from '../utils/pdf-formatter.ts';

export interface DocumentoSSTData {
  codigoOS: string;
  tipoDocumento: string; // Ex: "Análise Preliminar de Risco", "Checklist de Segurança"
  dataEmissao: string;
  clienteNome: string;
  local: string;
  responsavelTecnico?: string;

  // Itens do checklist ou análise
  itens: Array<{
    categoria?: string;
    descricao: string;
    status?: 'conforme' | 'nao-conforme' | 'n/a';
    observacao?: string;
  }>;

  // Conclusão
  conclusao?: string;
}

const styles = StyleSheet.create({
  ...commonStyles,

  sstTitle: {
    fontSize: fontSize['2xl'],
    fontFamily: fonts.bold,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  alertBanner: {
    backgroundColor: colors.error,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    borderRadius: 4,
  },

  alertText: {
    fontSize: fontSize.sm,
    color: colors.white,
    textAlign: 'center',
    fontFamily: fonts.bold,
  },

  itemContainer: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.neutral50,
    borderLeft: `3 solid ${colors.neutral400}`,
  },

  itemConformeContainer: {
    borderLeft: `3 solid ${colors.success}`,
  },

  itemNaoConformeContainer: {
    borderLeft: `3 solid ${colors.error}`,
  },

  itemCategoria: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: colors.neutral500,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },

  itemDescricao: {
    fontSize: fontSize.base,
    color: colors.neutral800,
    marginBottom: spacing.xs,
  },

  itemStatus: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
  },

  statusConforme: {
    color: colors.success,
  },

  statusNaoConforme: {
    color: colors.error,
  },

  statusNA: {
    color: colors.neutral500,
  },

  itemObservacao: {
    fontSize: fontSize.sm,
    color: colors.neutral600,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },

  conclusaoContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.neutral100,
    borderRadius: 4,
  },

  conclusaoTitle: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.sm,
  },

  conclusaoText: {
    fontSize: fontSize.base,
    color: colors.neutral700,
    lineHeight: 1.6,
    textAlign: 'justify',
  },
});

export function DocumentoSSTTemplate({ data }: { data: DocumentoSSTData }) {
  const renderStatus = (status?: string) => {
    if (!status) return null;

    const statusMap = {
      'conforme': { text: '✓ CONFORME', style: styles.statusConforme },
      'nao-conforme': { text: '✗ NÃO CONFORME', style: styles.statusNaoConforme },
      'n/a': { text: 'N/A', style: styles.statusNA },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap];
    if (!statusInfo) return null;

    return (
      <Text style={[styles.itemStatus, statusInfo.style]}>
        {statusInfo.text}
      </Text>
    );
  };

  const getBorderStyle = (status?: string) => {
    if (status === 'conforme') return styles.itemConformeContainer;
    if (status === 'nao-conforme') return styles.itemNaoConformeContainer;
    return {};
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <Text style={styles.sstTitle}>{data.tipoDocumento}</Text>

        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>
            ⚠ DOCUMENTO DE SEGURANÇA DO TRABALHO ⚠
          </Text>
        </View>

        {/* Info básica */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>OS Nº:</Text>
            <Text style={styles.value}>{data.codigoOS}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{data.clienteNome}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Local:</Text>
            <Text style={styles.value}>{data.local}</Text>
          </View>
          {data.responsavelTecnico && (
            <View style={styles.row}>
              <Text style={styles.label}>Responsável Técnico:</Text>
              <Text style={styles.value}>{data.responsavelTecnico}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Data:</Text>
            <Text style={styles.value}>{formatarData(data.dataEmissao)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Itens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ITENS VERIFICADOS</Text>

          {data.itens.map((item, index) => (
            <View
              key={index}
              style={[styles.itemContainer, getBorderStyle(item.status)]}
            >
              {item.categoria && (
                <Text style={styles.itemCategoria}>{item.categoria}</Text>
              )}
              <Text style={styles.itemDescricao}>{item.descricao}</Text>
              {renderStatus(item.status)}
              {item.observacao && (
                <Text style={styles.itemObservacao}>
                  Obs: {item.observacao}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Conclusão */}
        {data.conclusao && (
          <View style={styles.conclusaoContainer}>
            <Text style={styles.conclusaoTitle}>CONCLUSÃO</Text>
            <Text style={styles.conclusaoText}>{data.conclusao}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {data.tipoDocumento} - OS Nº {data.codigoOS}
          </Text>
          <Text style={styles.footerText}>Página 1</Text>
        </View>
      </Page>
    </Document>
  );
}
