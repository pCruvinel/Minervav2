/**
 * Estilos compartilhados para templates de PDF
 * Baseado no design system do MinervaV2
 */

export const colors = {
  // Primary colors - Gold (Minerva Brand)
  primary: '#D3AF37',
  primaryDark: '#B8941E',
  primaryLight: '#E6C866',

  // Neutral colors
  neutral50: '#FAFAFA',
  neutral100: '#F5F5F5',
  neutral200: '#E5E5E5',
  neutral300: '#D4D4D4',
  neutral400: '#A3A3A3',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral700: '#404040',
  neutral800: '#262626',
  neutral900: '#171717',

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Table Header Colors (Blue)
  tableHeaderBg: '#3B82F6',
  tableHeaderText: '#FFFFFF',

  // Background
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

export const fonts = {
  regular: 'Calibri',
  bold: 'Calibri-Bold',
  italic: 'Calibri-Italic',
  boldItalic: 'Calibri-BoldItalic',
};

export const fontSize = {
  xs: 8,
  sm: 9,
  base: 10,
  lg: 11,
  xl: 12,
  '2xl': 14,
  '3xl': 16,
  '4xl': 18,
  '5xl': 20,
};

export const borderRadius = {
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 999,
};

/**
 * Estilos comuns reutilizáveis
 */
export const commonStyles = {
  // Page
  page: {
    flexDirection: 'column' as const,
    backgroundColor: colors.white,
    padding: spacing['2xl'],
    fontFamily: fonts.regular,
    fontSize: fontSize.base,
    color: colors.neutral900,
  },

  // Header
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.xl,
    paddingBottom: spacing.md,
    borderBottom: `2 solid ${colors.neutral200}`,
  },

  // Logo
  logo: {
    width: 120,
    height: 40,
  },

  // Title
  title: {
    fontSize: fontSize['3xl'],
    fontFamily: fonts.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },

  subtitle: {
    fontSize: fontSize.xl,
    fontFamily: fonts.bold,
    color: colors.neutral700,
    marginBottom: spacing.sm,
  },

  // Section
  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottom: `1 solid ${colors.neutral300}`,
  },

  // Text
  text: {
    fontSize: fontSize.base,
    color: colors.neutral700,
    lineHeight: 1.5,
  },

  textBold: {
    fontFamily: fonts.bold,
  },

  textMuted: {
    color: colors.neutral500,
    fontSize: fontSize.sm,
  },

  // Row
  row: {
    flexDirection: 'row' as const,
    marginBottom: spacing.sm,
  },

  // Label
  label: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral600,
    marginBottom: spacing.xs,
  },

  // Value
  value: {
    fontSize: fontSize.base,
    color: colors.neutral900,
  },

  // Table
  table: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },

  tableHeader: {
    flexDirection: 'row' as const,
    backgroundColor: colors.tableHeaderBg,
    padding: spacing.sm,
    borderBottom: `2 solid ${colors.tableHeaderBg}`,
  },

  tableHeaderCell: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.tableHeaderText,
  },

  tableRow: {
    flexDirection: 'row' as const,
    padding: spacing.sm,
    borderBottom: `1 solid ${colors.neutral200}`,
  },

  tableCell: {
    fontSize: fontSize.sm,
    color: colors.neutral700,
  },

  // Footer
  footer: {
    position: 'absolute' as const,
    bottom: spacing.lg,
    left: spacing['2xl'],
    right: spacing['2xl'],
    paddingTop: spacing.md,
    borderTop: `1 solid ${colors.neutral200}`,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },

  footerText: {
    fontSize: fontSize.xs,
    color: colors.neutral500,
  },

  // Badge
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.base,
    alignSelf: 'flex-start' as const,
  },

  badgePrimary: {
    backgroundColor: colors.primary,
    color: colors.white,
  },

  badgeSuccess: {
    backgroundColor: colors.success,
    color: colors.white,
  },

  badgeWarning: {
    backgroundColor: colors.warning,
    color: colors.white,
  },

  // Card
  card: {
    backgroundColor: colors.neutral50,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.neutral200,
    marginVertical: spacing.md,
  },
};

/**
 * Utilitário para mesclar estilos
 */
export function mergeStyles(...styles: Array<Record<string, unknown>>): Record<string, unknown> {
  return Object.assign({}, ...styles);
}
