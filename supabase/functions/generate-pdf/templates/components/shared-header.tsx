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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottom: `3 solid ${colors.primary}`,
  },

  headerLeft: {
    flexDirection: 'column',
    width: '35%',
  },

  logo: {
    width: 150,
    height: 50,
    marginBottom: spacing.sm,
  },

  empresaContainer: {
    flexDirection: 'column',
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

  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '60%',
  },

  documentTitle: {
    fontSize: fontSize['2xl'],
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.xs,
  },

  documentSubtitle: {
    fontSize: fontSize.base,
    color: colors.neutral600,
    marginBottom: spacing.xs,
  },

  documentDate: {
    fontSize: fontSize.sm,
    color: colors.neutral500,
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
  logoHeight = 50,
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
      {/* Lado Esquerdo: Logo + Dados Empresa */}
      <View style={styles.headerLeft}>
        {logoUrl && (
          <Image
            style={{
              width: logoWidth,
              height: logoHeight,
              marginBottom: spacing.sm,
            }}
            src={logoUrl}
          />
        )}

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

      {/* Lado Direito: Informações do Documento */}
      <View style={styles.headerRight}>
        <Text style={styles.documentTitle}>{documentTitle}</Text>
        {documentSubtitle && (
          <Text style={styles.documentSubtitle}>{documentSubtitle}</Text>
        )}
        <Text style={styles.documentDate}>{documentDate}</Text>
      </View>
    </View>
  );
}
