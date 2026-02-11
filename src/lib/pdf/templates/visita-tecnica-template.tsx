/**
 * Template de Relatório de Visita Técnica (OS-08) em React PDF
 * Design Premium baseado no proposta-template.tsx (Minerva V2)
 * 
 * Suporta 5 tipos de finalidade:
 * - recebimento_unidade → Checklist de 27 itens
 * - escopo_tecnico → Parecer Técnico genérico
 * - parecer_tecnico → Parecer Técnico genérico
 * - laudo_spci → Laudo SPCI
 * - laudo_spda → Laudo SPDA
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../shared-styles';
import { LOGO_BASE64 } from '../assets';
import { formatarData, formatarCpfCnpj, formatarTelefone } from '../utils/pdf-formatter';

// ============================================
// TYPES
// ============================================

export type FinalidadeInspecao =
    | 'recebimento_unidade'
    | 'escopo_tecnico'
    | 'parecer_tecnico'
    | 'laudo_spci'
    | 'laudo_spda';

export type StatusItem = 'C' | 'NC' | 'NA';
export type GravidadeNivel = 'baixa' | 'media' | 'alta' | 'critica';

export interface ChecklistItem {
    id: string;
    bloco: string;
    label: string;
    status: StatusItem;
    observacao?: string;
}

export interface VisitaTecnicaData {
    // Metadados
    codigoOS: string;
    dataVisita: string;
    dataGeracao: string;

    // Título dinâmico
    finalidadeInspecao: FinalidadeInspecao;
    tituloDocumento: string;

    // Cliente (Etapa 2)
    cliente: {
        nome: string;
        cpfCnpj?: string;
        endereco?: string;
        bairro?: string;
        cidade?: string;
        estado?: string;
        sindico?: string;
    };

    // Solicitante (Etapa 1)
    solicitante: {
        nome: string;
        contato: string;
        condominio?: string;
        unidadeBloco?: string;
        cargo?: string;
    };

    // Objetivo da visita
    objetivo: {
        descricaoSolicitacao: string;
        areaVistoriada: string;
        tempoSituacao?: string;
    };

    // Controle de qualidade
    qualidade?: {
        engenheiroPontual: boolean;
        moradorPontual: boolean;
    };

    // Dados técnicos (se NÃO for recebimento)
    parecerTecnico?: {
        manifestacaoPatologica: string;
        recomendacoes: string;
        gravidade: GravidadeNivel;
        origemNBR: string;
        observacoes: string;
        resultadoVisita: string;
        justificativa: string;
    };

    // Checklist (se recebimento_unidade)
    checklistRecebimento?: {
        items: ChecklistItem[];
        estatisticas: {
            total: number;
            conformes: number;
            naoConformes: number;
            naoAplica: number;
        };
    };

    // Fotos
    fotos?: Array<{
        url: string;
        legenda: string;
        isNaoConforme?: boolean;
    }>;

    // Responsável técnico
    responsavelTecnico: {
        nome: string;
        cargo: string;
        crea?: string;
    };

    // Dados da empresa (opcional)
    empresa?: {
        nome: string;
        cnpj: string;
        endereco: string;
        telefone: string;
        email: string;
        site: string;
    };
}

// ============================================
// ESTILOS PREMIUM
// ============================================

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: colors.white,
        paddingTop: 30,
        paddingBottom: 50,
        paddingHorizontal: 30,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: colors.black,
    },

    // --- HEADER ---
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 5,
    },
    headerLogo: {
        width: 120,
        height: 60,
        objectFit: 'contain',
    },
    headerInfoContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginTop: 10,
        width: '60%',
    },
    headerAddress: {
        fontSize: 9,
        textAlign: 'right',
        color: colors.black,
        marginBottom: 2,
    },
    headerContact: {
        fontSize: 9,
        textAlign: 'right',
        color: colors.black,
        marginBottom: 2,
    },
    headerWeb: {
        fontSize: 9,
        textAlign: 'right',
        color: colors.black,
    },
    goldBar: {
        height: 4,
        backgroundColor: colors.primary,
        width: '100%',
        marginBottom: 10,
        marginTop: 5,
    },

    // --- TÍTULO DOCUMENTO ---
    titleBox: {
        backgroundColor: colors.minervaBlue,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 15,
        alignItems: 'center',
    },
    titleText: {
        color: colors.white,
        fontFamily: 'Helvetica-Bold',
        fontSize: 12,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    subtitleText: {
        color: colors.white,
        fontFamily: 'Helvetica',
        fontSize: 9,
        textAlign: 'center',
        marginTop: 3,
    },

    // --- GRID DE DADOS ---
    gridRow: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 2,
    },
    gridCellLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: colors.black,
        textTransform: 'uppercase',
        width: '25%',
    },
    gridCellValue: {
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: colors.black,
        width: '75%',
    },

    // --- SEÇÕES ---
    blueHeader: {
        backgroundColor: colors.minervaBlue,
        paddingVertical: 4,
        paddingHorizontal: 6,
        marginTop: 10,
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    blueHeaderText: {
        color: colors.white,
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        textTransform: 'uppercase',
    },

    sectionContent: {
        padding: 8,
        backgroundColor: colors.neutral50,
        marginBottom: 5,
    },

    textBlock: {
        fontSize: 9,
        textAlign: 'justify',
        lineHeight: 1.4,
        marginBottom: 5,
    },

    // --- GRAVIDADE BADGES ---
    gravidadeBaixa: {
        backgroundColor: '#10B981',
        color: colors.white,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    gravidadeMedia: {
        backgroundColor: '#F59E0B',
        color: colors.white,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    gravidadeAlta: {
        backgroundColor: '#EF4444',
        color: colors.white,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    gravidadeCritica: {
        backgroundColor: '#7C3AED',
        color: colors.white,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },

    // --- CHECKLIST TABLE ---
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.neutral200,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral400,
        paddingVertical: 4,
    },
    tableHeaderCell: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: colors.black,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: colors.neutral200,
        paddingVertical: 3,
        minHeight: 16,
        alignItems: 'center',
    },
    tableRowNC: {
        backgroundColor: '#FEE2E2',
    },
    tableCell: {
        fontSize: 8,
        color: colors.black,
    },
    colBloco: { width: '20%', paddingLeft: 4 },
    colItem: { width: '45%', paddingLeft: 4 },
    colStatus: { width: '10%', textAlign: 'center' },
    colObs: { width: '25%', paddingLeft: 4 },

    // Status badges
    statusC: { color: '#10B981', fontFamily: 'Helvetica-Bold' },
    statusNC: { color: '#EF4444', fontFamily: 'Helvetica-Bold' },
    statusNA: { color: '#6B7280', fontFamily: 'Helvetica-Bold' },

    // --- FOTOS ---
    photoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    photoBox: {
        width: 250,
        borderWidth: 1,
        borderColor: colors.neutral200,
        padding: 4,
    },
    photoImg: {
        height: 120,
        objectFit: 'cover',
        marginBottom: 4,
    },
    photoLabel: {
        fontSize: 7,
        textAlign: 'center',
        color: colors.neutral600,
    },
    photoNC: {
        borderColor: '#EF4444',
        borderWidth: 2,
    },

    // --- ASSINATURA ---
    signatureContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    signatureLine: {
        width: 250,
        borderTopWidth: 1,
        borderColor: colors.black,
        marginBottom: 5,
    },
    signatureName: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },
    signatureCrea: {
        fontSize: 8,
        textAlign: 'center',
        color: colors.neutral600,
    },

    // --- FOOTER ---
    footerContainer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
    },
    footerPageWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    pagePill: {
        backgroundColor: colors.black,
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    pageText: {
        color: colors.white,
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
    },
    footerGoldBar: {
        height: 10,
        backgroundColor: colors.primary,
        width: '100%',
    },

    // Qualidade info
    qualidadeRow: {
        flexDirection: 'row',
        marginTop: 5,
        gap: 20,
    },
    qualidadeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    qualidadeOk: {
        color: '#10B981',
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
    },
    qualidadeNo: {
        color: '#EF4444',
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
    },
});

// ============================================
// COMPONENTES
// ============================================

const Header = ({ data }: { data: VisitaTecnicaData }) => (
    <View>
        <View style={styles.headerContainer}>
            <Image
                style={styles.headerLogo}
                src={LOGO_BASE64}
            />
            <View style={styles.headerInfoContainer}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10, color: colors.black, textAlign: 'right', marginBottom: 4 }}>
                    {data.empresa?.nome || 'MINERVA ENGENHARIA E REPRESENTAÇÕES'}
                </Text>
                <Text style={styles.headerAddress}>
                    Av. Colares Moreira, Edifício Los Angeles, Nº100, Loja 01{'\n'}
                    Renascença, São Luís - MA, CEP: 65075-144
                </Text>
                <Text style={styles.headerContact}>
                    (98) 98226-7909 / (98) 98151-3355
                </Text>
                <Text style={styles.headerWeb}>
                    www.minerva-eng.com.br / contato@minerva-eng.com.br
                </Text>
            </View>
        </View>
        <View style={styles.goldBar} />
    </View>
);

const TituloDocumento = ({ data }: { data: VisitaTecnicaData }) => (
    <View style={styles.titleBox}>
        <Text style={styles.titleText}>{data.tituloDocumento}</Text>
        <Text style={styles.subtitleText}>
            OS Nº {data.codigoOS} | Data da Visita: {formatarData(data.dataVisita)}
        </Text>
    </View>
);

const DadosGerais = ({ data }: { data: VisitaTecnicaData }) => (
    <View>
        <View style={styles.blueHeader}>
            <Text style={styles.blueHeaderText}>1. INFORMAÇÕES GERAIS</Text>
        </View>

        <View style={styles.sectionContent}>
            {/* Cliente */}
            <View style={styles.gridRow}>
                <Text style={styles.gridCellLabel}>Cliente:</Text>
                <Text style={styles.gridCellValue}>{data.cliente.nome?.toUpperCase()}</Text>
            </View>
            {data.cliente.cpfCnpj && (
                <View style={styles.gridRow}>
                    <Text style={styles.gridCellLabel}>CPF/CNPJ:</Text>
                    <Text style={styles.gridCellValue}>{formatarCpfCnpj(data.cliente.cpfCnpj)}</Text>
                </View>
            )}
            {data.cliente.endereco && (
                <View style={styles.gridRow}>
                    <Text style={styles.gridCellLabel}>Endereço:</Text>
                    <Text style={styles.gridCellValue}>
                        {data.cliente.endereco}{data.cliente.bairro ? `, ${data.cliente.bairro}` : ''}
                        {data.cliente.cidade ? ` - ${data.cliente.cidade}` : ''}
                        {data.cliente.estado ? `/${data.cliente.estado}` : ''}
                    </Text>
                </View>
            )}
            {data.cliente.sindico && (
                <View style={styles.gridRow}>
                    <Text style={styles.gridCellLabel}>Síndico:</Text>
                    <Text style={styles.gridCellValue}>{data.cliente.sindico}</Text>
                </View>
            )}

            {/* Solicitante */}
            <View style={[styles.gridRow, { marginTop: 8 }]}>
                <Text style={styles.gridCellLabel}>Solicitante:</Text>
                <Text style={styles.gridCellValue}>{data.solicitante.nome}</Text>
            </View>
            {data.solicitante.cargo && (
                <View style={styles.gridRow}>
                    <Text style={styles.gridCellLabel}>Cargo:</Text>
                    <Text style={styles.gridCellValue}>{data.solicitante.cargo}</Text>
                </View>
            )}
            {data.solicitante.unidadeBloco && (
                <View style={styles.gridRow}>
                    <Text style={styles.gridCellLabel}>Unidade/Bloco:</Text>
                    <Text style={styles.gridCellValue}>{data.solicitante.unidadeBloco}</Text>
                </View>
            )}
            <View style={styles.gridRow}>
                <Text style={styles.gridCellLabel}>Contato:</Text>
                <Text style={styles.gridCellValue}>{formatarTelefone(data.solicitante.contato)}</Text>
            </View>
        </View>
    </View>
);

const ObjetivoVisita = ({ data }: { data: VisitaTecnicaData }) => (
    <View>
        <View style={styles.blueHeader}>
            <Text style={styles.blueHeaderText}>2. OBJETIVO DA VISITA</Text>
        </View>

        <View style={styles.sectionContent}>
            <View style={styles.gridRow}>
                <Text style={styles.gridCellLabel}>Área Vistoriada:</Text>
                <Text style={styles.gridCellValue}>{data.objetivo.areaVistoriada}</Text>
            </View>
            {data.objetivo.tempoSituacao && (
                <View style={styles.gridRow}>
                    <Text style={styles.gridCellLabel}>Tempo da Situação:</Text>
                    <Text style={styles.gridCellValue}>{data.objetivo.tempoSituacao}</Text>
                </View>
            )}
            <View style={{ marginTop: 5 }}>
                <Text style={[styles.textBlock, { fontFamily: 'Helvetica-Bold', fontSize: 8, marginBottom: 3 }]}>
                    Descrição da Solicitação:
                </Text>
                <Text style={styles.textBlock}>
                    {data.objetivo.descricaoSolicitacao}
                </Text>
            </View>

            {/* Controle de Qualidade */}
            {data.qualidade && (
                <View style={styles.qualidadeRow}>
                    <View style={styles.qualidadeItem}>
                        <Text style={{ fontSize: 8 }}>Engenheiro Pontual:</Text>
                        <Text style={data.qualidade.engenheiroPontual ? styles.qualidadeOk : styles.qualidadeNo}>
                            {data.qualidade.engenheiroPontual ? 'SIM' : 'NÃO'}
                        </Text>
                    </View>
                    <View style={styles.qualidadeItem}>
                        <Text style={{ fontSize: 8 }}>Morador Pontual:</Text>
                        <Text style={data.qualidade.moradorPontual ? styles.qualidadeOk : styles.qualidadeNo}>
                            {data.qualidade.moradorPontual ? 'SIM' : 'NÃO'}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    </View>
);

const GravidadeBadge = ({ gravidade }: { gravidade: GravidadeNivel }) => {
    const gravidadeStyles = {
        baixa: styles.gravidadeBaixa,
        media: styles.gravidadeMedia,
        alta: styles.gravidadeAlta,
        critica: styles.gravidadeCritica,
    };
    const labels = {
        baixa: 'BAIXA',
        media: 'MÉDIA',
        alta: 'ALTA',
        critica: 'CRÍTICA',
    };

    return (
        <View style={gravidadeStyles[gravidade]}>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: colors.white }}>
                {labels[gravidade]}
            </Text>
        </View>
    );
};

const ParecerTecnicoSection = ({ data }: { data: VisitaTecnicaData }) => {
    if (!data.parecerTecnico) return null;

    return (
        <View>
            <View style={styles.blueHeader}>
                <Text style={styles.blueHeaderText}>3. PARECER TÉCNICO</Text>
            </View>

            <View style={styles.sectionContent}>
                {/* Manifestações Patológicas */}
                <Text style={[styles.textBlock, { fontFamily: 'Helvetica-Bold', fontSize: 8, marginBottom: 3 }]}>
                    3.1 Manifestações Patológicas Encontradas:
                </Text>
                <Text style={styles.textBlock}>
                    {data.parecerTecnico.manifestacaoPatologica}
                </Text>

                {/* Gravidade */}
                <View style={[styles.gridRow, { marginTop: 8, alignItems: 'center' }]}>
                    <Text style={[styles.gridCellLabel, { width: '20%' }]}>Gravidade:</Text>
                    <GravidadeBadge gravidade={data.parecerTecnico.gravidade} />
                </View>

                {/* NBR */}
                <View style={[styles.gridRow, { marginTop: 5 }]}>
                    <Text style={styles.gridCellLabel}>Embasamento Normativo:</Text>
                    <Text style={styles.gridCellValue}>{data.parecerTecnico.origemNBR}</Text>
                </View>

                {/* Recomendações */}
                <Text style={[styles.textBlock, { fontFamily: 'Helvetica-Bold', fontSize: 8, marginBottom: 3, marginTop: 10 }]}>
                    3.2 Recomendações Técnicas:
                </Text>
                <Text style={styles.textBlock}>
                    {data.parecerTecnico.recomendacoes}
                </Text>

                {/* Observações */}
                {data.parecerTecnico.observacoes && (
                    <>
                        <Text style={[styles.textBlock, { fontFamily: 'Helvetica-Bold', fontSize: 8, marginBottom: 3, marginTop: 10 }]}>
                            3.3 Observações Gerais:
                        </Text>
                        <Text style={styles.textBlock}>
                            {data.parecerTecnico.observacoes}
                        </Text>
                    </>
                )}
            </View>
        </View>
    );
};

const ChecklistSection = ({ data }: { data: VisitaTecnicaData }) => {
    if (!data.checklistRecebimento) return null;

    const { items, estatisticas } = data.checklistRecebimento;
    const groupedByBloco: Record<string, ChecklistItem[]> = {};

    items.forEach(item => {
        if (!groupedByBloco[item.bloco]) {
            groupedByBloco[item.bloco] = [];
        }
        groupedByBloco[item.bloco].push(item);
    });

    // Título dinâmico baseado na finalidade
    const tituloChecklist = data.finalidadeInspecao === 'laudo_spci'
        ? '3. CHECKLIST DE INSPEÇÃO SPCI'
        : data.finalidadeInspecao === 'laudo_spda'
            ? '3. CHECKLIST DE INSPEÇÃO SPDA'
            : '3. CHECKLIST DE RECEBIMENTO DE UNIDADE';

    return (
        <View>
            <View style={styles.blueHeader}>
                <Text style={styles.blueHeaderText}>{tituloChecklist}</Text>
            </View>

            {/* Estatísticas */}
            <View style={[styles.sectionContent, { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }]}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#10B981' }}>
                        {estatisticas.conformes}
                    </Text>
                    <Text style={{ fontSize: 8, color: colors.neutral600 }}>Conformes</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#EF4444' }}>
                        {estatisticas.naoConformes}
                    </Text>
                    <Text style={{ fontSize: 8, color: colors.neutral600 }}>Não Conformes</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: colors.neutral500 }}>
                        {estatisticas.naoAplica}
                    </Text>
                    <Text style={{ fontSize: 8, color: colors.neutral600 }}>N/A</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: colors.black }}>
                        {estatisticas.total}
                    </Text>
                    <Text style={{ fontSize: 8, color: colors.neutral600 }}>Total</Text>
                </View>
            </View>

            {/* Tabela Header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colBloco]}>BLOCO</Text>
                <Text style={[styles.tableHeaderCell, styles.colItem]}>ITEM VERIFICADO</Text>
                <Text style={[styles.tableHeaderCell, styles.colStatus]}>STATUS</Text>
                <Text style={[styles.tableHeaderCell, styles.colObs]}>OBSERVAÇÃO</Text>
            </View>

            {/* Tabela Rows */}
            {Object.entries(groupedByBloco).map(([bloco, blocoItems]) => (
                <View key={bloco}>
                    {blocoItems.map((item, idx) => (
                        <View
                            key={item.id}
                            style={[
                                styles.tableRow,
                                item.status === 'NC' ? styles.tableRowNC : undefined
                            ].filter(Boolean)}
                        >
                            <Text style={[styles.tableCell, styles.colBloco]}>
                                {idx === 0 ? bloco : ''}
                            </Text>
                            <Text style={[styles.tableCell, styles.colItem]}>{item.label}</Text>
                            <Text style={[
                                styles.tableCell,
                                styles.colStatus,
                                item.status === 'C' ? styles.statusC : undefined,
                                item.status === 'NC' ? styles.statusNC : undefined,
                                item.status === 'NA' ? styles.statusNA : undefined,
                            ].filter(Boolean)}>
                                {item.status}
                            </Text>
                            <Text style={[styles.tableCell, styles.colObs]}>
                                {item.observacao || '-'}
                            </Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};

const RegistroFotografico = ({ data }: { data: VisitaTecnicaData }) => {
    if (!data.fotos || data.fotos.length === 0) return null;

    // Priorizar fotos de itens NC
    const fotosOrdenadas = [...data.fotos].sort((a, b) => {
        if (a.isNaoConforme && !b.isNaoConforme) return -1;
        if (!a.isNaoConforme && b.isNaoConforme) return 1;
        return 0;
    });

    // Agrupar fotos em pares para layout 2 colunas
    const fotosPares: Array<typeof fotosOrdenadas> = [];
    for (let i = 0; i < fotosOrdenadas.length; i += 2) {
        fotosPares.push(fotosOrdenadas.slice(i, i + 2));
    }

    return (
        <View break>
            <View style={styles.blueHeader}>
                <Text style={styles.blueHeaderText}>4. REGISTRO FOTOGRÁFICO</Text>
            </View>

            {/* Renderizar fotos em linhas de 2 */}
            {fotosPares.map((par, rowIdx) => (
                <View key={rowIdx} style={styles.photoRow}>
                    {par.map((foto, colIdx) => (
                        <View
                            key={colIdx}
                            style={foto.isNaoConforme ? [styles.photoBox, styles.photoNC] : styles.photoBox}
                        >
                            <Image src={foto.url} style={styles.photoImg} />
                            <Text style={styles.photoLabel}>
                                {foto.isNaoConforme && '⚠️ '}{foto.legenda || `Foto ${rowIdx * 2 + colIdx + 1}`}
                            </Text>
                        </View>
                    ))}
                    {/* Se par tem só 1 foto, adicionar espaço vazio */}
                    {par.length === 1 && <View style={styles.photoBox} />}
                </View>
            ))}
        </View>
    );
};

const Conclusao = ({ data }: { data: VisitaTecnicaData }) => (
    <View wrap={false}>
        <View style={styles.blueHeader}>
            <Text style={styles.blueHeaderText}>5. CONCLUSÃO</Text>
        </View>

        <View style={styles.sectionContent}>
            {data.parecerTecnico && (
                <>
                    <Text style={[styles.textBlock, { fontFamily: 'Helvetica-Bold', fontSize: 8, marginBottom: 3 }]}>
                        Resultado da Visita:
                    </Text>
                    <Text style={styles.textBlock}>
                        {data.parecerTecnico.resultadoVisita}
                    </Text>
                    {data.parecerTecnico.justificativa && (
                        <>
                            <Text style={[styles.textBlock, { fontFamily: 'Helvetica-Bold', fontSize: 8, marginBottom: 3, marginTop: 8 }]}>
                                Justificativa:
                            </Text>
                            <Text style={styles.textBlock}>
                                {data.parecerTecnico.justificativa}
                            </Text>
                        </>
                    )}
                </>
            )}

            {data.checklistRecebimento && (
                <Text style={styles.textBlock}>
                    {data.finalidadeInspecao === 'laudo_spci'
                        ? (data.checklistRecebimento.estatisticas.naoConformes === 0
                            ? 'O sistema de proteção e combate a incêndio foi inspecionado e encontra-se em conformidade com as normas técnicas aplicáveis (NBR 12693, NBR 13434, NBR 10898, NBR 9077, NBR 13714, NBR 17240, NBR 10897, NBR 14276).'
                            : `Foram identificadas ${data.checklistRecebimento.estatisticas.naoConformes} não conformidade(s) no sistema de proteção e combate a incêndio que devem ser corrigidas.`)
                        : data.finalidadeInspecao === 'laudo_spda'
                            ? (data.checklistRecebimento.estatisticas.naoConformes === 0
                                ? 'O sistema de proteção contra descargas atmosféricas foi inspecionado e encontra-se em conformidade com a NBR 5419:2015.'
                                : `Foram identificadas ${data.checklistRecebimento.estatisticas.naoConformes} não conformidade(s) no sistema de proteção contra descargas atmosféricas que devem ser corrigidas.`)
                            : (data.checklistRecebimento.estatisticas.naoConformes === 0
                                ? 'A unidade autônoma foi inspecionada e encontra-se em conformidade com os padrões estabelecidos pela NBR 15575 e PBQP-H.'
                                : `Foram identificadas ${data.checklistRecebimento.estatisticas.naoConformes} não conformidade(s) que devem ser corrigidas antes da entrega da unidade.`)
                    }
                </Text>
            )}
        </View>

        {/* Assinatura */}
        <View style={styles.signatureContainer}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{data.responsavelTecnico.nome}</Text>
            <Text style={styles.signatureCrea}>
                {data.responsavelTecnico.cargo}
                {data.responsavelTecnico.crea && ` | CREA: ${data.responsavelTecnico.crea}`}
            </Text>
            <Text style={{ fontSize: 8, color: colors.neutral500, marginTop: 5 }}>
                Documento gerado em {formatarData(data.dataGeracao)}
            </Text>
        </View>
    </View>
);

const Footer = () => (
    <View fixed style={styles.footerContainer}>
        <View style={styles.footerPageWrapper}>
            <View style={styles.pagePill}>
                <Text style={styles.pageText} render={({ pageNumber, totalPages }: { pageNumber: number, totalPages: number }) => (
                    `PÁGINA ${pageNumber} / ${totalPages}`
                )} />
            </View>
        </View>
        <View style={styles.footerGoldBar} />
    </View>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const VisitaTecnicaTemplate = ({ data }: { data: VisitaTecnicaData }) => {
    const isRecebimento = data.finalidadeInspecao === 'recebimento_unidade';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Fixo */}
                <View fixed>
                    <Header data={data} />
                </View>

                {/* Título do Documento */}
                <TituloDocumento data={data} />

                {/* 1. Informações Gerais */}
                <DadosGerais data={data} />

                {/* 2. Objetivo da Visita */}
                <ObjetivoVisita data={data} />

                {/* 3. Conteúdo Técnico (condicional) */}
                {isRecebimento ? (
                    <ChecklistSection data={data} />
                ) : (
                    <ParecerTecnicoSection data={data} />
                )}

                {/* 4. Registro Fotográfico */}
                <RegistroFotografico data={data} />

                {/* 5. Conclusão e Assinatura */}
                <Conclusao data={data} />

                {/* Footer Fixo */}
                <Footer />
            </Page>
        </Document>
    );
};

export default VisitaTecnicaTemplate;
