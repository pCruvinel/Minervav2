/**
 * Componente de Rodapé Compartilhado para Templates PDF
 *
 * Implementa footer padronizado com:
 * - Texto à esquerda, centro e direita
 * - Borda superior em cor primária (dourada) ou azul
 * - Posicionamento fixo na base da página
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, fontSize } from '../shared-styles';

export interface SharedFooterProps {
    leftText: string;
    centerText?: string;
    rightText: string;
    borderColor?: 'primary' | 'info';
    fixed?: boolean;
}

const styles = StyleSheet.create({
    footerContainer: {
        paddingTop: spacing.md,
        borderTop: `2 solid ${colors.primary}`,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    footerContainerFixed: {
        position: 'absolute' as const,
        bottom: spacing.lg,
        left: spacing['2xl'],
        right: spacing['2xl'],
        paddingTop: spacing.md,
        borderTop: `2 solid ${colors.primary}`,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    footerText: {
        fontSize: fontSize.xs,
        color: colors.neutral600,
        fontFamily: fonts.regular,
    },

    footerTextLeft: {
        flex: 1,
        textAlign: 'left' as const,
    },

    footerTextCenter: {
        flex: 1,
        textAlign: 'center' as const,
    },

    footerTextRight: {
        flex: 1,
        textAlign: 'right' as const,
    },
});

/**
 * Componente SharedFooter
 *
 * Renderiza rodapé padronizado com informações em três colunas.
 * Pode ser fixo (position: absolute) ou fluxo normal.
 *
 * @example
 * ```tsx
 * <SharedFooter
 *   leftText="Proposta Comercial - OS 12345"
 *   centerText="Documento Confidencial"
 *   rightText="Página 1"
 *   borderColor="primary"
 *   fixed={true}
 * />
 * ```
 */
export function SharedFooter({
    leftText,
    centerText,
    rightText,
    borderColor = 'primary',
    fixed = true,
}: SharedFooterProps) {
    const borderColorValue = borderColor === 'info' ? colors.info : colors.primary;

    const footerContainerStyle = fixed
        ? {
            ...styles.footerContainerFixed,
            borderTop: `2 solid ${borderColorValue}`,
        }
        : {
            ...styles.footerContainer,
            borderTop: `2 solid ${borderColorValue}`,
        };

    return (
        <View style={footerContainerStyle}>
            <Text style={{ ...styles.footerText, ...styles.footerTextLeft }}>
                {leftText}
            </Text>

            {centerText && (
                <Text style={{ ...styles.footerText, ...styles.footerTextCenter }}>
                    {centerText}
                </Text>
            )}

            <Text style={{ ...styles.footerText, ...styles.footerTextRight }}>
                {rightText}
            </Text>
        </View>
    );
}
