/**
 * Template de Proposta para Laudo Pontual de Assessoria Técnica de Engenharia (OS-06)
 * Design Premium (Baseado no Layout v2.0 e proposta-template.tsx)
 */

import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../shared-styles';
import { LOGO_BASE64 } from '../assets';
import { formatarMoeda, formatarData, formatarCpfCnpj, formatarTelefone } from '../utils/pdf-formatter';

// ============================================
// INTERFACES
// ============================================

export interface EspecificacaoTecnica {
    item: number;
    descricao: string;
}

export interface DadosPrazo {
    planejamentoInicial: number;
    logisticaTransporte: number;
    levantamentoCampo: number;
    composicaoLaudo: number;
    apresentacaoCliente: number;
}

export interface DadosPrecificacao {
    valorMaterialMaoDeObra: number;
    percentualImposto: number;
    valorImposto?: number;
    valorTotal?: number;
}

export interface DadosPagamento {
    percentualEntrada: number;
    valorEntrada?: number;
    numeroParcelas: number;
    valorParcela?: number;
}

export interface PropostaAssPontualData {
    // Dados da OS
    codigoOS: string;
    dataEmissao: string;

    // Cliente
    clienteNome: string;
    clienteCpfCnpj: string;
    clienteEmail?: string;
    clienteTelefone?: string;
    clienteEndereco?: string;
    clienteBairro?: string;
    clienteCidade?: string;
    clienteEstado?: string;
    clienteResponsavel?: string;

    // Dados Quantitativos
    quantidadeUnidades: number;
    quantidadeBlocos: number;

    // Conteúdo Dinâmico
    objetivo: string;
    especificacoesTecnicas: EspecificacaoTecnica[];
    metodologia: string[];
    prazo: DadosPrazo;
    garantia: string;
    precificacao: DadosPrecificacao;
    pagamento: DadosPagamento;
}

// ============================================
// ESTILOS PREMIUM
// ============================================

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: colors.white,
        paddingTop: 30,
        paddingBottom: 40,
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

    // --- DADOS DO CLIENTE ---
    clientGridContainer: {
        width: '100%',
        marginBottom: 10,
    },
    clientDateRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 5,
    },
    clientDateText: {
        fontSize: 8,
        color: colors.black,
    },
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
    },
    gridCellValue: {
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: colors.black,
        marginLeft: 4,
    },
    colLeft: { width: '45%' },
    colCenter: { width: '25%' },
    colRight: { width: '30%' },

    // --- TÍTULO DESTAQUE (CINZA) ---
    greyBar: {
        backgroundColor: colors.neutral200,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.white,
    },
    greyBarText: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        color: colors.black,
    },

    // --- CABEÇALHOS DE SEÇÃO (AZUL) ---
    blueHeader: {
        backgroundColor: colors.minervaBlue,
        paddingVertical: 4,
        paddingHorizontal: 6,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    blueHeaderText: {
        color: colors.white,
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        textTransform: 'uppercase',
    },

    // --- TABELAS ---
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.neutral200,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral400,
        paddingVertical: 4,
        alignItems: 'center',
    },
    tableHeaderCell: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: colors.black,
        textAlign: 'center',
    },
    colItem: { width: '8%', textAlign: 'center' },
    colDesc: { width: '92%', textAlign: 'left', paddingLeft: 5 },

    rowItem: {
        backgroundColor: colors.white,
        flexDirection: 'row',
        paddingVertical: 3,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.tableRowGray,
        minHeight: 14,
        alignItems: 'flex-start',
    },
    cellText: { fontSize: 8, color: colors.black },
    cellTextBold: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: colors.black },

    // --- BULLETS ---
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 2,
        paddingLeft: 10,
    },
    bulletText: {
        fontSize: 8,
        flexShrink: 1,
    },

    // --- INVESTIMENTOS ---
    investContainer: {
        marginTop: 5,
        borderWidth: 1,
        borderColor: colors.neutral300,
    },
    investRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: colors.neutral200,
        paddingVertical: 4,
        paddingHorizontal: 5,
    },
    investLabel: { width: '75%', fontSize: 8 },
    investValue: { width: '25%', textAlign: 'right', fontSize: 8 },
    investLabelBold: { width: '75%', fontSize: 8, fontFamily: 'Helvetica-Bold' },
    investValueBold: { width: '25%', textAlign: 'right', fontSize: 8, fontFamily: 'Helvetica-Bold' },

    // Linha Impostos (Laranja)
    taxRow: {
        flexDirection: 'row',
        backgroundColor: colors.warning,
        paddingVertical: 4,
        paddingHorizontal: 5,
    },

    // Linha Total (Verde)
    totalRow: {
        flexDirection: 'row',
        backgroundColor: colors.success,
        paddingVertical: 4,
        paddingHorizontal: 5,
    },
    totalLabel: { width: '75%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: colors.white },
    totalValue: { width: '25%', textAlign: 'right', fontSize: 8, fontFamily: 'Helvetica-Bold', color: colors.white },

    // --- PAGAMENTO ---
    paymentContainer: {
        marginTop: 5,
        padding: 5,
        backgroundColor: colors.neutral50,
    },
    paymentRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    paymentLabel: { fontSize: 8 },
    paymentValue: { fontSize: 8, marginLeft: 10 },

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
});

// ============================================
// COMPONENTES
// ============================================

const Header = () => (
    <View>
        <View style={styles.headerContainer}>
            <Image
                style={styles.headerLogo}
                src={LOGO_BASE64}
            />
            <View style={styles.headerInfoContainer}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10, color: colors.black, textAlign: 'right', marginBottom: 4 }}>
                    MINERVA ENGENHARIA E REPRESENTAÇÕES
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

const ClientInfo = ({ data }: { data: PropostaAssPontualData }) => (
    <View style={styles.clientGridContainer}>
        <View style={styles.clientDateRow}>
            <Text style={styles.clientDateText}>{formatarData(data.dataEmissao)}</Text>
        </View>

        {/* Linha 1 */}
        <View style={styles.gridRow}>
            <View style={styles.colLeft}>
                <Text>
                    <Text style={styles.gridCellLabel}>CLIENTE: </Text>
                    <Text style={styles.gridCellValue}>{data.clienteNome?.toUpperCase()}</Text>
                </Text>
            </View>
            <View style={{ width: '55%' }}>
                <Text>
                    <Text style={styles.gridCellLabel}>E-MAIL: </Text>
                    <Text style={styles.gridCellValue}>{data.clienteEmail}</Text>
                </Text>
            </View>
        </View>

        {/* Linha 2 */}
        <View style={styles.gridRow}>
            <View style={styles.colLeft}>
                <Text>
                    <Text style={styles.gridCellLabel}>RESPONSÁVEL: </Text>
                    <Text style={styles.gridCellValue}>{data.clienteResponsavel}</Text>
                </Text>
            </View>
            <View style={styles.colCenter}>
                <Text>
                    <Text style={styles.gridCellLabel}>CPF/CNPJ: </Text>
                    <Text style={styles.gridCellValue}>{formatarCpfCnpj(data.clienteCpfCnpj)}</Text>
                </Text>
            </View>
            <View style={styles.colRight}>
                <Text>
                    <Text style={styles.gridCellLabel}>END.: </Text>
                    <Text style={styles.gridCellValue}>{data.clienteEndereco}</Text>
                </Text>
            </View>
        </View>

        {/* Linha 3 */}
        <View style={styles.gridRow}>
            <View style={styles.colLeft}>
                <Text>
                    <Text style={styles.gridCellLabel}>TEL: </Text>
                    <Text style={styles.gridCellValue}>{formatarTelefone(data.clienteTelefone || '')}</Text>
                </Text>
            </View>
            <View style={styles.colCenter}>
                <Text>
                    <Text style={styles.gridCellLabel}>BAIRRO: </Text>
                    <Text style={styles.gridCellValue}>{data.clienteBairro}</Text>
                </Text>
            </View>
            <View style={styles.colRight}>
                <Text>
                    <Text style={styles.gridCellLabel}>CIDADE/ESTADO: </Text>
                    <Text style={styles.gridCellValue}>{data.clienteCidade}/{data.clienteEstado}</Text>
                </Text>
            </View>
        </View>

        {/* Linha 4 */}
        <View style={[styles.gridRow, { marginTop: 5 }]}>
            <View style={styles.colLeft}>
                <Text>
                    <Text style={styles.gridCellLabel}>CÓDIGO DA PROPOSTA: </Text>
                    <Text style={styles.gridCellValue}>{data.codigoOS}</Text>
                </Text>
            </View>
            <View style={styles.colCenter}>
                <Text>
                    <Text style={styles.gridCellLabel}>QUANTIDADE DE UNIDADES: </Text>
                    <Text style={styles.gridCellValue}>{data.quantidadeUnidades || '-'}</Text>
                </Text>
            </View>
            <View style={styles.colRight}>
                <Text>
                    <Text style={styles.gridCellLabel}>QUANTIDADE DE BLOCOS: </Text>
                    <Text style={styles.gridCellValue}>{data.quantidadeBlocos || '-'}</Text>
                </Text>
            </View>
        </View>

        {/* Título da Proposta */}
        <View style={[styles.greyBar, { marginTop: 10 }]}>
            <Text style={styles.greyBarText}>
                PROPOSTA PARA LAUDO PONTUAL DE ASSESSORIA TÉCNICA DE ENGENHARIA
            </Text>
        </View>
    </View>
);

const Objetivo = ({ texto }: { texto: string }) => (
    <View wrap={false}>
        <View style={styles.blueHeader}>
            <Text style={styles.blueHeaderText}>1. OBJETIVO:</Text>
        </View>
        <View style={{ padding: 5, marginBottom: 5 }}>
            <Text style={{ fontSize: 8, textAlign: 'justify', lineHeight: 1.4 }}>
                {texto || 'Diagnosticar estado atual estrutural de edificação condominial após minunciosa vistoria por meio de equipe de engenharia com vasto conhecimento e experiência na área, com auxílio de equipamentos de diagnóstico, a fim de nortear eventual necessidade de intervenção de reforço estrutural necessário.'}
            </Text>
        </View>
    </View>
);

const EspecificacoesTable = ({ items }: { items: EspecificacaoTecnica[] }) => {
    // 🛡️ Defensive check: ensure items is an array
    const safeItems = Array.isArray(items) ? items : [];

    return (
        <View>
            <View style={styles.blueHeader}>
                <Text style={styles.blueHeaderText}>2. ESPECIFICAÇÕES TÉCNICAS;</Text>
            </View>

            {/* Header Tabela */}
            <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colItem]}>ITEM</Text>
                <Text style={[styles.tableHeaderCell, styles.colDesc]}>DESCRIÇÃO</Text>
            </View>

            {/* Itens */}
            {safeItems.map((item, idx) => (
                <View key={idx} style={styles.rowItem}>
                    <Text style={[styles.cellText, styles.colItem]}>{item.item}</Text>
                    <Text style={[styles.cellText, styles.colDesc]}>{item.descricao}</Text>
                </View>
            ))}
        </View>
    );
};

const Metodologia = ({ items }: { items: string[] }) => {
    // 🛡️ Defensive check: ensure items is an array
    const safeItems = Array.isArray(items) ? items : [];

    return (
        <View wrap={false} style={{ marginTop: 10 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 3 }}>METODOLOGIA:</Text>
            {safeItems.map((item, idx) => (
                <View key={idx} style={styles.bulletPoint}>
                    <Text style={styles.bulletText}>• {item}</Text>
                </View>
            ))}
        </View>
    );
};

const Prazo = ({ dados }: { dados: DadosPrazo }) => (
    <View wrap={false}>
        <View style={styles.blueHeader}>
            <Text style={styles.blueHeaderText}>3. PRAZO:</Text>
        </View>
        <View style={{ padding: 5 }}>
            <View style={styles.bulletPoint}>
                <Text style={styles.bulletText}>• Planejamento inicial: {dados.planejamentoInicial} dias úteis;</Text>
            </View>
            <View style={styles.bulletPoint}>
                <Text style={styles.bulletText}>• Logística e transporte de materiais: {dados.logisticaTransporte} dia útil;</Text>
            </View>
            <View style={styles.bulletPoint}>
                <Text style={styles.bulletText}>• Levantamento em campo: {dados.levantamentoCampo} dias úteis;</Text>
            </View>
            <View style={styles.bulletPoint}>
                <Text style={styles.bulletText}>• Composição de laudo técnico: {dados.composicaoLaudo} dias úteis;</Text>
            </View>
            <View style={styles.bulletPoint}>
                <Text style={styles.bulletText}>• Apresentação de laudo técnico para cliente: {dados.apresentacaoCliente} dia útil;</Text>
            </View>
        </View>
    </View>
);

const Garantia = ({ texto }: { texto: string }) => (
    <View wrap={false}>
        <View style={styles.blueHeader}>
            <Text style={styles.blueHeaderText}>4. GARANTIA:</Text>
        </View>
        <View style={{ padding: 5 }}>
            <Text style={{ fontSize: 8, textAlign: 'justify', lineHeight: 1.4 }}>
                {texto || 'A qualidade do serviço prestado é garantida integralmente na responsabilidade técnica de empresa habilitada para exercício da função, com corpo técnico formado por engenheiros especialistas na área, devidamente registrados no órgão da classe CREA-MA.'}
            </Text>
        </View>
    </View>
);

const Investimentos = ({ precificacao }: { precificacao: DadosPrecificacao }) => {
    const valorMaterial = Number(precificacao.valorMaterialMaoDeObra) || 0;
    const percentualImposto = Number(precificacao.percentualImposto) || 0;
    const valorImposto = precificacao.valorImposto ?? (valorMaterial * (percentualImposto / 100));
    const valorTotal = precificacao.valorTotal ?? (valorMaterial + valorImposto);

    return (
        <View wrap={false}>
            <View style={styles.blueHeader}>
                <Text style={styles.blueHeaderText}>5. INVESTIMENTOS</Text>
            </View>

            {/* Sub-header cinza */}
            <View style={[styles.tableHeader, { paddingVertical: 2 }]}>
                <Text style={[styles.tableHeaderCell, { width: '8%' }]}>ITEM</Text>
                <Text style={[styles.tableHeaderCell, { width: '67%', textAlign: 'left', paddingLeft: 5 }]}>INCLUSO MATERIAL, MÃO DE OBRA, LOGÍSTICA E EVENTUALIDADES</Text>
                <Text style={[styles.tableHeaderCell, { width: '25%' }]}>TOTAL</Text>
            </View>

            <View style={styles.investContainer}>
                {/* Material + Mão de Obra */}
                <View style={styles.investRow}>
                    <Text style={[styles.investLabel, { width: '8%', textAlign: 'center' }]}>1</Text>
                    <Text style={[styles.investLabel, { width: '67%' }]}>Investigação, diagnóstico e composição de laudo.</Text>
                    <Text style={styles.investValue}>{formatarMoeda(valorMaterial)}</Text>
                </View>

                {/* Impostos */}
                <View style={styles.taxRow}>
                    <Text style={[styles.investLabelBold, { color: colors.black }]}>IMPOSTOS (EMISSÃO DE NOTA FISCAL DE SERVIÇOS):</Text>
                    <Text style={[styles.investValueBold, { color: colors.black }]}>{formatarMoeda(valorImposto)}</Text>
                </View>

                {/* Total */}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>INVESTIMENTO + IMPOSTOS:</Text>
                    <Text style={styles.totalValue}>{formatarMoeda(valorTotal)}</Text>
                </View>
            </View>
        </View>
    );
};

const Pagamento = ({ pagamento, precificacao }: { pagamento: DadosPagamento; precificacao: DadosPrecificacao }) => {
    const valorTotal = precificacao.valorTotal ?? (Number(precificacao.valorMaterialMaoDeObra) + (Number(precificacao.valorMaterialMaoDeObra) * (Number(precificacao.percentualImposto) / 100)));
    const valorEntrada = pagamento.valorEntrada ?? (valorTotal * (Number(pagamento.percentualEntrada) / 100));
    const valorParcela = pagamento.valorParcela ?? ((valorTotal - valorEntrada) / Number(pagamento.numeroParcelas || 1));

    return (
        <View wrap={false}>
            <View style={styles.blueHeader}>
                <Text style={styles.blueHeaderText}>6. PAGAMENTO</Text>
            </View>

            <View style={styles.paymentContainer}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 5 }}>6.1 PARCELAMENTO</Text>

                <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>R$</Text>
                    <Text style={[styles.paymentValue, { fontFamily: 'Helvetica-Bold' }]}>{formatarMoeda(valorEntrada).replace('R$ ', '')}</Text>
                    <Text style={[styles.paymentLabel, { marginLeft: 20 }]}>{pagamento.percentualEntrada}% entrada</Text>
                </View>

                <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>R$</Text>
                    <Text style={[styles.paymentValue, { fontFamily: 'Helvetica-Bold' }]}>{formatarMoeda(valorParcela).replace('R$ ', '')}</Text>
                    <Text style={[styles.paymentLabel, { marginLeft: 20 }]}>{pagamento.numeroParcelas} parcelas mensais</Text>
                </View>
            </View>
        </View>
    );
};

const Footer = () => (
    <View fixed style={styles.footerContainer}>
        <View style={styles.footerPageWrapper}>
            <View style={styles.pagePill}>
                <Text style={styles.pageText} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => (
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

export const PropostaAssPontualTemplate = ({ data }: { data: PropostaAssPontualData }) => {
    // Defaults para metodologia se não fornecida
    const metodologiaDefault = [
        'Investigação in loco com auxílio de equipamentos de diagnóstico',
        'Análise de dados colhidos entre equipe técnica',
        'Elaboração de laudo técnico com o diagnóstico',
        'Apresentação de laudo para cliente',
    ];

    const metodologia = data.metodologia?.length > 0 ? data.metodologia : metodologiaDefault;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Fixo */}
                <View fixed>
                    <Header />
                </View>

                {/* Dados do Cliente */}
                <ClientInfo data={data} />

                {/* 1. Objetivo */}
                <Objetivo texto={data.objetivo} />

                {/* 2. Especificações Técnicas */}
                <EspecificacoesTable items={data.especificacoesTecnicas || []} />

                {/* Metodologia (após especificações) */}
                <Metodologia items={metodologia} />

                {/* 3. Prazo */}
                <Prazo dados={data.prazo} />

                {/* 4. Garantia */}
                <Garantia texto={data.garantia} />

                {/* 5. Investimentos */}
                <Investimentos precificacao={data.precificacao} />

                {/* 6. Pagamento */}
                <Pagamento pagamento={data.pagamento} precificacao={data.precificacao} />

                {/* Footer */}
                <Footer />
            </Page>
        </Document>
    );
};

export default PropostaAssPontualTemplate;
