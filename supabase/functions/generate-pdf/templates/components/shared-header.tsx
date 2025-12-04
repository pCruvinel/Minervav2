/**
 * Componente de Cabeçalho Compartilhado para Templates PDF
 *
 * Implementa layout padronizado com:
 * - Logo da Minerva (esquerda)
 * - Dados da empresa hardcoded (centro-esquerda)
 * - Título e informações do documento (direita)
 * - Divisória grossa em cor primária ou azul
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, fontSize } from '../shared-styles.ts';

export interface SharedHeaderProps {
  logoUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
  documentTitle: string;
  documentSubtitle?: string;
  documentDate: string;
  dividerColor?: 'primary' | 'info';
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'column',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottom: `3 solid ${colors.primary}`,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },

  logoSection: {
    width: 150,
  },

  logo: {
    width: 150,
    height: 80,
  },

  documentInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    flex: 1,
  },

  documentTitle: {
    fontSize: fontSize['2xl'],
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },

  documentSubtitle: {
    fontSize: fontSize.base,
    color: colors.neutral600,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },

  documentDate: {
    fontSize: fontSize.sm,
    color: colors.neutral500,
  },

  empresaContainer: {
    flexDirection: 'column',
    width: '100%',
  },

  empresaName: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.xs,
  },

  empresaInfo: {
    fontSize: fontSize.xs,
    color: colors.neutral600,
    lineHeight: 1.3,
    marginBottom: 2,
  },
});

/**
 * Componente SharedHeader
 *
 * Renderiza cabeçalho padronizado com logo Minerva, dados da empresa e informações do documento.
 *
 * @example
 * ```tsx
 * <SharedHeader
 *   documentTitle="PROPOSTA COMERCIAL"
 *   documentSubtitle="Proposta Nº 2025-001"
 *   documentDate="01/12/2025"
 *   dividerColor="primary"
 * />
 * ```
 */
export function SharedHeader({
  logoUrl = 'https://zxfevlkssljndqqhxkjb.supabase.co/storage/v1/object/public/uploads/logo.png',
  logoWidth = 150,
  logoHeight = 80,
  documentTitle,
  documentSubtitle,
  documentDate,
  dividerColor = 'primary',
}: SharedHeaderProps) {
  const dividerColorValue = dividerColor === 'info' ? colors.info : colors.primary;

  const headerContainerStyle = {
    ...styles.headerContainer,
    borderBottom: `3 solid ${dividerColorValue}`,
  };

  return (
    <View style={headerContainerStyle}>
      {/* Topo: Logo (esquerda) + Título (direita) */}
      <View style={styles.topRow}>
        <View style={styles.logoSection}>
          {logoUrl && (
            <Image
              style={styles.logo}
              src={logoUrl}
            />
          )}
        </View>

        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{documentTitle}</Text>
          {documentSubtitle && (
            <Text style={styles.documentSubtitle}>{documentSubtitle}</Text>
          )}
          <Text style={styles.documentDate}>{documentDate}</Text>
        </View>
      </View>

      {/* Dados da Empresa: alinhados à esquerda abaixo do logo/título */}
      <View style={styles.empresaContainer}>
        <Text style={styles.empresaName}>Minerva Engenharia e Representações</Text>
        <Text style={styles.empresaInfo}>
          Av. Colares Moreira, Edifício Los Angeles, Nº100, Loja 01
        </Text>
        <Text style={styles.empresaInfo}>
          Renascença, São Luís - MA, CEP: 65075-144
        </Text>
        <Text style={styles.empresaInfo}>
          (98) 98226-7909 / (98) 98151-3355
        </Text>
        <Text style={styles.empresaInfo}>
          www.minerva-eng.com.br / contato@minerva-eng.com.br
        </Text>
      </View>
    </View>
  );
}
