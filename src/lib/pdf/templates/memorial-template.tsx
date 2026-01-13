/**
 * Template de Memorial Descritivo em React PDF
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, fontSize, commonStyles } from '../shared-styles';
import { formatarData } from '../utils/pdf-formatter';

export interface MemorialData {
    codigoOS: string;
    titulo: string;
    dataEmissao: string;
    clienteNome: string;
    local?: string;

    // Seções do memorial
    secoes: Array<{
        titulo: string;
        conteudo: string;
    }>;
}

const styles = StyleSheet.create({
    ...commonStyles,

    memorialTitle: {
        fontSize: fontSize['3xl'],
        fontFamily: fonts.bold,
        color: colors.primary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },

    subtitle: {
        fontSize: fontSize.base,
        textAlign: 'center',
        color: colors.neutral600,
        marginBottom: spacing.xl,
    },

    secaoContainer: {
        marginBottom: spacing.lg,
    },

    secaoTitulo: {
        fontSize: fontSize.lg,
        fontFamily: fonts.bold,
        color: colors.neutral800,
        marginBottom: spacing.sm,
        paddingBottom: spacing.xs,
        borderBottom: `2 solid ${colors.primary}`,
    },

    secaoConteudo: {
        fontSize: fontSize.base,
        color: colors.neutral700,
        lineHeight: 1.6,
        textAlign: 'justify',
    },
});

export function MemorialTemplate({ data }: { data: MemorialData }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Cabeçalho */}
                <Text style={styles.memorialTitle}>MEMORIAL DESCRITIVO</Text>
                <Text style={styles.subtitle}>{data.titulo}</Text>
                <Text style={styles.subtitle}>OS Nº {data.codigoOS}</Text>

                {/* Info básica */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Cliente:</Text>
                        <Text style={styles.value}>{data.clienteNome}</Text>
                    </View>
                    {data.local && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Local:</Text>
                            <Text style={styles.value}>{data.local}</Text>
                        </View>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.label}>Data:</Text>
                        <Text style={styles.value}>{formatarData(data.dataEmissao)}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Seções */}
                {data.secoes.map((secao, index) => (
                    <View key={index} style={styles.secaoContainer}>
                        <Text style={styles.secaoTitulo}>{secao.titulo}</Text>
                        <Text style={styles.secaoConteudo}>{secao.conteudo}</Text>
                    </View>
                ))}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Memorial Descritivo - OS Nº {data.codigoOS}</Text>
                    <Text style={styles.footerText}>Página 1</Text>
                </View>
            </Page>
        </Document>
    );
}
