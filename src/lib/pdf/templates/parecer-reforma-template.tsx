/**
 * Template de Parecer Técnico de Reforma (OS-07) em React PDF
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { colors, spacing, fonts, fontSize, commonStyles } from '../shared-styles';
import { SharedHeader } from '../components/shared-header';
import { SharedFooter } from '../components/shared-footer';
import { Table, TableRow, TableCell, TableHeaderRow, TableHeaderCell } from '../components/table-components';

export interface ParecerReformaData {
    codigoOS: string;
    dataEmissao: string;
    cliente: {
        nome: string;
        cpfCnpj: string;
        endereco: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
    };
    obra: {
        tipo: string;
        descricao: string;
        local: string;
    };
    parecer: {
        analiseTecnica: string;
        conclusao: string;
        recomendacoes: string[];
        responsavelTecnico: string;
        creaResponsavel: string;
    };
    fotos?: Array<{
        url: string;
        legenda: string;
    }>;
}

const styles = StyleSheet.create({
    ...commonStyles,

    sectionTitle: {
        fontSize: fontSize.lg,
        fontFamily: fonts.bold,
        color: colors.primary,
        marginBottom: spacing.xs,
        marginTop: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral300,
        paddingBottom: 2,
    },

    textJustified: {
        fontSize: fontSize.sm,
        fontFamily: fonts.regular,
        textAlign: 'justify',
        marginBottom: spacing.sm,
        lineHeight: 1.5,
    },

    listContainer: {
        marginLeft: spacing.md,
        marginBottom: spacing.sm,
    },

    listItem: {
        flexDirection: 'row',
        marginBottom: 4,
    },

    bullet: {
        width: 10,
        fontSize: fontSize.sm,
    },

    listText: {
        flex: 1,
        fontSize: fontSize.sm,
        fontFamily: fonts.regular,
    },

    signatureBlock: {
        marginTop: spacing['2xl'],
        alignItems: 'center',
    },

    signatureLine: {
        width: 200,
        borderTopWidth: 1,
        borderTopColor: colors.black,
        marginBottom: spacing.xs,
    },

    signatureName: {
        fontSize: fontSize.sm,
        fontFamily: fonts.bold,
    },

    signatureRole: {
        fontSize: fontSize.xs,
        fontFamily: fonts.regular,
        color: colors.neutral600,
    },

    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.md,
        gap: 10,
    },

    photoContainer: {
        width: '48%',
        marginBottom: spacing.md,
    },

    photo: {
        width: '100%',
        height: 150,
        objectFit: 'cover',
        borderRadius: 4,
        marginBottom: 4,
    },

    photoCaption: {
        fontSize: fontSize.xs,
        fontFamily: fonts.italic,
        textAlign: 'center',
        color: colors.neutral600,
    },
});

export const ParecerReformaTemplate = ({ data }: { data: ParecerReformaData }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <SharedHeader
                    documentTitle="PARECER TÉCNICO DE REFORMA"
                    documentSubtitle={`OS Nº ${data.codigoOS}`}
                    documentDate={data.dataEmissao} // Assuming already formatted or string
                />

                <View>
                    {/* 1. DADOS DO CLIENTE */}
                    <Text style={styles.sectionTitle}>1. DADOS DO SOLICITANTE</Text>
                    <Table>
                        <TableRow>
                            <TableCell flexValue={0.3} style={{ fontFamily: fonts.bold }}>Nome/Razão Social:</TableCell>
                            <TableCell flexValue={0.7}>{data.cliente.nome}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell flexValue={0.3} style={{ fontFamily: fonts.bold }}>CPF/CNPJ:</TableCell>
                            <TableCell flexValue={0.7}>{data.cliente.cpfCnpj}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell flexValue={0.3} style={{ fontFamily: fonts.bold }}>Endereço:</TableCell>
                            <TableCell flexValue={0.7}>{data.cliente.endereco} - {data.cliente.bairro}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell flexValue={0.3} style={{ fontFamily: fonts.bold }}>Cidade/UF:</TableCell>
                            <TableCell flexValue={0.7}>{data.cliente.cidade}/{data.cliente.estado} - CEP: {data.cliente.cep}</TableCell>
                        </TableRow>
                    </Table>

                    {/* 2. DADOS DA OBRA */}
                    <Text style={styles.sectionTitle}>2. DADOS DA OBRA/REFORMA</Text>
                    <Table>
                        <TableRow>
                            <TableCell flexValue={0.3} style={{ fontFamily: fonts.bold }}>Tipo de Intervenção:</TableCell>
                            <TableCell flexValue={0.7}>{data.obra.tipo}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell flexValue={0.3} style={{ fontFamily: fonts.bold }}>Local da Obra:</TableCell>
                            <TableCell flexValue={0.7}>{data.obra.local}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell flexValue={0.3} style={{ fontFamily: fonts.bold }}>Descrição Sumária:</TableCell>
                            <TableCell flexValue={0.7}>{data.obra.descricao}</TableCell>
                        </TableRow>
                    </Table>

                    {/* 3. ANÁLISE TÉCNICA */}
                    <Text style={styles.sectionTitle}>3. ANÁLISE TÉCNICA</Text>
                    <Text style={styles.textJustified}>
                        {data.parecer.analiseTecnica}
                    </Text>

                    {/* 4. RECOMENDAÇÕES */}
                    <Text style={styles.sectionTitle}>4. RECOMENDAÇÕES TÉCNICAS</Text>
                    <View style={styles.listContainer}>
                        {data.parecer.recomendacoes.map((rec, i) => (
                            <View key={i} style={styles.listItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.listText}>{rec}</Text>
                            </View>
                        ))}
                    </View>

                    {/* 5. CONCLUSÃO */}
                    <Text style={styles.sectionTitle}>5. CONCLUSÃO</Text>
                    <Text style={styles.textJustified}>
                        {data.parecer.conclusao}
                    </Text>

                    {/* REGISTRO FOTOGRÁFICO (Se houver) */}
                    {data.fotos && data.fotos.length > 0 && (
                        <View wrap={false}>
                            <Text style={styles.sectionTitle}>6. REGISTRO FOTOGRÁFICO</Text>
                            <View style={styles.photoGrid}>
                                {data.fotos.map((foto, i) => (
                                    <View key={i} style={styles.photoContainer}>
                                        <Image src={foto.url} style={styles.photo} />
                                        <Text style={styles.photoCaption}>Foto {i + 1}: {foto.legenda}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ASSINATURA */}
                    <View style={styles.signatureBlock} wrap={false}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureName}>{data.parecer.responsavelTecnico}</Text>
                        <Text style={styles.signatureRole}>Engenheiro Civil - CREA: {data.parecer.creaResponsavel}</Text>
                    </View>
                </View>

                <SharedFooter
                    leftText={`Parecer Técnico - ${data.codigoOS}`}
                    rightText="Página 1"
                    centerText="Minerva Engenharia"
                />
            </Page>
        </Document>
    );
};

export default ParecerReformaTemplate;
