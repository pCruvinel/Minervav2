/**
 * Componentes de Tabela Padronizados para PDFs
 *
 * Implementa tabelas com:
 * - Cabeçalho azul (#3B82F6) com texto branco
 * - Linhas de dados com estilo consistente
 * - Linhas de categoria (cinza) para agrupamento
 * - Linhas de resumo/total (dourado) para valores finais
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, fontSize } from '../shared-styles';

/**
 * Estilos para componentes de tabela
 */
const styles = StyleSheet.create({
    table: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.neutral300,
    },

    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: colors.tableHeaderBg,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.md,
        borderTop: `3 solid ${colors.tableHeaderBg}`,
        borderBottom: `2 solid ${colors.tableHeaderBg}`,
    },

    tableHeaderCell: {
        fontSize: fontSize.sm,
        fontFamily: fonts.bold,
        color: colors.tableHeaderText,
        flex: 1,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },

    tableRow: {
        flexDirection: 'row',
        padding: spacing.sm,
        borderBottom: `1 solid ${colors.neutral200}`,
        backgroundColor: colors.white,
    },

    tableRowAlternate: {
        backgroundColor: colors.neutral50,
    },

    tableCell: {
        fontSize: fontSize.sm,
        color: colors.neutral700,
        flex: 1,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },

    categoryRow: {
        flexDirection: 'row',
        backgroundColor: colors.neutral100,
        padding: spacing.sm,
        borderBottom: `1 solid ${colors.neutral300}`,
        borderTop: `1 solid ${colors.neutral300}`,
        marginTop: spacing.sm,
    },

    categoryText: {
        fontSize: fontSize.sm,
        fontFamily: fonts.bold,
        color: colors.neutral800,
    },

    summaryRow: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        padding: spacing.sm,
        borderBottom: `1 solid ${colors.primary}`,
        marginTop: spacing.sm,
    },

    summaryLabel: {
        fontSize: fontSize.sm,
        fontFamily: fonts.bold,
        color: colors.white,
        flex: 1,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },

    summaryValue: {
        fontSize: fontSize.sm,
        fontFamily: fonts.bold,
        color: colors.white,
        flex: 1,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        textAlign: 'right' as const,
    },
});

/**
 * Componente Table
 *
 * Container para tabelas. Envolve headerRow, dataRows, categoryRows e summaryRows.
 */
export function Table({ children }: { children: React.ReactNode }) {
    return <View style={styles.table}>{children}</View>;
}

/**
 * Componente TableHeaderRow
 *
 * Linha de cabeçalho com fundo azul (#3B82F6) e texto branco.
 * Use TableHeaderCell dentro para definir colunas.
 */
export function TableHeaderRow({ children }: { children: React.ReactNode }) {
    return <View style={styles.tableHeaderRow}>{children}</View>;
}

/**
 * Componente TableHeaderCell
 *
 * Célula de cabeçalho. Pode receber flexValue para controlar largura da coluna.
 *
 * @param flexValue - Peso da coluna (padrão: 1)
 * @example
 * ```tsx
 * <TableHeaderCell flexValue={2}>Item</TableHeaderCell>
 * <TableHeaderCell flexValue={5}>Descrição</TableHeaderCell>
 * <TableHeaderCell flexValue={1}>Unidade</TableHeaderCell>
 * <TableHeaderCell flexValue={2}>Valor</TableHeaderCell>
 * ```
 */
export function TableHeaderCell({
    children,
    flexValue = 1,
    textAlign = 'left',
    style,
}: {
    children: React.ReactNode;
    flexValue?: number;
    textAlign?: 'left' | 'center' | 'right';
    style?: any;
}) {
    return (
        <Text
            style={[
                styles.tableHeaderCell,
                {
                    flex: flexValue,
                    textAlign: textAlign as any,
                },
                style,
            ]}
        >
            {children}
        </Text>
    );
}

/**
 * Componente TableRow
 *
 * Linha de dados em tabela.
 *
 * @param alternate - Se true, usa fundo cinza claro para melhor leitura
 */
export function TableRow({
    children,
    alternate = false,
}: {
    children: React.ReactNode;
    alternate?: boolean;
}) {
    const rowStyle = alternate
        ? { ...styles.tableRow, ...styles.tableRowAlternate }
        : styles.tableRow;

    return <View style={rowStyle}>{children}</View>;
}

/**
 * Componente TableCell
 *
 * Célula de dados em tabela. Deve estar dentro de TableRow.
 *
 * @param flexValue - Peso da coluna (deve corresponder ao header)
 * @example
 * ```tsx
 * <TableRow>
 *   <TableCell flexValue={2}>1.1</TableCell>
 *   <TableCell flexValue={5}>Fundação da edificação</TableCell>
 *   <TableCell flexValue={1}>m²</TableCell>
 *   <TableCell flexValue={2} textAlign="right">R$ 1.500,00</TableCell>
 * </TableRow>
 * ```
 */
export function TableCell({
    children,
    flexValue = 1,
    textAlign = 'left',
    style,
}: {
    children: React.ReactNode;
    flexValue?: number;
    textAlign?: 'left' | 'center' | 'right';
    style?: any;
}) {
    return (
        <Text
            style={[
                styles.tableCell,
                {
                    flex: flexValue,
                    textAlign: textAlign as any,
                },
                style,
            ]}
        >
            {children}
        </Text>
    );
}

/**
 * Componente CategoryRow
 *
 * Linha cinza para agrupar itens de categoria (ex: Etapa 1, Etapa 2).
 * Geralmente span completo da tabela.
 *
 * @example
 * ```tsx
 * <CategoryRow>1. FUNDAÇÕES E ESTRUTURA</CategoryRow>
 * ```
 */
export function CategoryRow({ children }: { children: React.ReactNode }) {
    return (
        <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>{children}</Text>
        </View>
    );
}

/**
 * Componente SummaryRow
 *
 * Linha com fundo dourado para resumos e totais.
 *
 * @param label - Texto do lado esquerdo (ex: "TOTAL")
 * @param value - Valor do lado direito (ex: "R$ 10.000,00")
 * @example
 * ```tsx
 * <SummaryRow label="TOTAL GERAL" value="R$ 10.000,00" />
 * ```
 */
export function SummaryRow({
    label,
    value,
}: {
    label: React.ReactNode;
    value: React.ReactNode;
}) {
    return (
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summaryValue}>{value}</Text>
        </View>
    );
}

/**
 * Componente SimpleSummaryRow
 *
 * Variante simples de SummaryRow para conteúdo livre.
 * Use para linhas de resumo com múltiplas colunas.
 */
export function SimpleSummaryRow({ children }: { children: React.ReactNode }) {
    return <View style={styles.summaryRow}>{children}</View>;
}
