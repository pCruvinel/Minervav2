/**
 * Template de Proposta Comercial em React PDF
 * Design Premium Refinado (Minerva V2)
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { colors } from './shared-styles.ts';
import { LOGO_BASE64 } from './assets.ts';
import { formatarMoeda, formatarData, formatarCpfCnpj, formatarTelefone } from '../utils/pdf-formatter.ts';

// ============================================
// INTERFACES
// ============================================

export interface Subetapa {
  nome: string;
  m2?: string;
  unidade?: string;
  quantidade?: number;
  total: string | number;
  diasUteis?: string | number;
}

export interface Etapa {
  nome: string;
  subetapas: Subetapa[];
}

export interface DadosFinanceiros {
  precoFinal: string | number;
  numeroParcelas?: string | number;
  percentualLucro?: string | number;
  percentualEntrada?: string | number;
  percentualImposto?: string | number;
  percentualImprevisto?: string | number;
}

export interface DadosCronograma {
  objetivo?: string;
  preparacaoArea?: string | number;
  planejamentoInicial?: string | number;
  logisticaTransporte?: string | number;
  etapasPrincipais: Etapa[];
}

export interface PropostaData {
  codigoOS: string;
  codigoProposta?: string;
  dataEmissao: string;
  validadeProposta?: number;

  clienteNome: string;
  clienteCpfCnpj: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  clienteEndereco?: string;
  clienteBairro?: string;
  clienteCidade?: string;
  clienteEstado?: string;
  clienteResponsavel?: string;

  quantidadeUnidades?: number;
  quantidadeBlocos?: number;

  objetivo: string;
  tituloProposta?: string;

  dadosCronograma: DadosCronograma;
  dadosFinanceiros: DadosFinanceiros;
  garantias?: string[];

  empresaNome?: string;
  empresaCnpj?: string;
  empresaEndereco?: string;
  empresaTelefone?: string;
  empresaEmail?: string;
  empresaSite?: string;
}

// ============================================
// ESTILOS PREMIUM
// ============================================

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    paddingTop: 30, // Margem superior
    paddingBottom: 40, // Espaço footer
    paddingHorizontal: 30, // Margens laterais
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.black,
  },

  // --- HEADER EXCLUSIVO ---
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  headerLogo: {
    width: 120, // Ajuste conforme a logo real
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
    backgroundColor: colors.primary, // MINERVA GOLD
    width: '100%',
    marginBottom: 10,
    marginTop: 5,
  },

  // --- DADOS DO CLIENTE (GRID DENSO) ---
  clientGridContainer: {
    width: '100%',
    marginBottom: 15,
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
  // Linhas do grid
  gridRow: {
    flexDirection: 'row',
    width: '100%',
  },
  // Células sem bordas explícitas, apenas alinhamento limpo conforme foto
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
  // Layout específico das colunas
  colLeft: { width: '45%' },
  colCenter: { width: '25%' },
  colRight: { width: '30%' }, // Ajustado

  // --- SESSÃO TITULO DESTAQUE (CINZA) ---
  greyBar: {
    backgroundColor: colors.neutral200, // Cinza claro #E5E7EB
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
    backgroundColor: colors.minervaBlue, // MINERVA BLUE
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
  whiteTextRegular: {
    color: colors.white,
    fontFamily: 'Helvetica',
    fontSize: 9,
    marginLeft: 4,
  },

  // --- TABELAS ---
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.neutral200, // Cinza claro para header de tabela interna
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
  // Colunas ESPECIFICAÇÕES
  colItem: { width: '8%', textAlign: 'center' },
  colDesc: { width: '62%', textAlign: 'left', paddingLeft: 5 },
  colUnit: { width: '10%', textAlign: 'center' },
  colTotal: { width: '20%', textAlign: 'right', paddingRight: 5 },

  // Linhas da tabela
  rowSection: {
    backgroundColor: colors.tableRowGray, // Cinza bem claro para etapas
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.neutral200,
  },
  rowItem: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.tableRowGray,
    minHeight: 14,
    alignItems: 'center',
  },
  cellText: { fontSize: 8, color: colors.black },
  cellTextBold: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: colors.black },

  // --- CRONOGRAMA (AMARELO) ---
  yellowHeader: {
    backgroundColor: colors.tableRowYellow, // Amarelo/Gold claro
    borderBottomWidth: 1,
    borderBottomColor: colors.warning, // Gold mais escuro
  },
  rowYellow: {
    backgroundColor: '#FEF3C7', // Amarelo muito claro (keeping specific hex for row bg not in shared)
    flexDirection: 'row',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.tableRowYellow,
  },
  // Colunas Cronograma
  colCronAtiv: { width: '75%', paddingLeft: 5 },
  colCronDias: { width: '25%', textAlign: 'center' },

  // --- GARANTIA ---
  garantiaBox: {
    marginTop: 0,
    padding: 5,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletText: {
    fontSize: 8,
  },

  // --- INVESTIMENTOS ---
  investRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.neutral200,
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  investLabel: { width: '75%', fontSize: 9 },
  investValue: { width: '25%', textAlign: 'right', fontSize: 9 },

  // Linha Impostos (Laranja)
  taxRow: {
    flexDirection: 'row',
    backgroundColor: colors.warning, // Laranja
    paddingVertical: 4,
    paddingHorizontal: 5,
    marginTop: 0,
  },
  taxLabel: { width: '75%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.black }, // Preto no laranja para contraste

  // Linha Total (Verde/Escura)
  totalRow: {
    flexDirection: 'row',
    backgroundColor: colors.success, // Verde Sucesso
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  totalLabel: { width: '75%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.white },
  totalValue: { width: '25%', textAlign: 'right', fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.white },

  // --- PAGAMENTO ---
  paymentTerms: {
    flexDirection: 'row',
    padding: 5,
    backgroundColor: colors.neutral50,
    marginBottom: 5,
  },
  paymentColLeft: { width: '50%' },
  paymentColRight: { width: '50%' },
  paymentText: { fontSize: 8, marginBottom: 2 },

  // Box Investimento Unitário (Cinza Escuro)
  unitBox: {
    backgroundColor: colors.neutral400, // Cinza médio/escuro
    padding: 5,
    marginTop: 5,
    alignSelf: 'flex-start',
    width: '40%',
  },
  unitTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 3, color: colors.black },
  unitRow: { flexDirection: 'row', justifyContent: 'space-between' },
  unitLabel: { fontSize: 8, color: colors.black },
  unitVal: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: colors.black },

  validityText: {
    textAlign: 'right',
    fontSize: 8,
    marginTop: 10,
    color: colors.black,
  },

  legalText: {
    fontSize: 7,
    textAlign: 'center',
    color: colors.neutral500,
    marginTop: 15,
    fontStyle: 'italic',
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
    backgroundColor: colors.black, // Pílula preta estilo print
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
    height: 10, // Barra grossa dourada no final
    backgroundColor: colors.primary,
    width: '100%',
  }
});

// ============================================
// COMPONENTES DO TEMPLATE
// ============================================

const Header = ({ data }: { data: PropostaData }) => (
  <View>
    <View style={styles.headerContainer}>
      <Image
        style={styles.headerLogo}
        src={LOGO_BASE64}
      />
      <View style={styles.headerInfoContainer}>
        <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10, color: colors.black, textAlign: 'right', marginBottom: 4 }}>
          {data.empresaNome || 'MINERVA ENGENHARIA E REPRESENTAÇÕES'}
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

const ClientInfo = ({ data }: { data: PropostaData }) => (
  <View style={styles.clientGridContainer}>
    <View style={styles.clientDateRow}>
      <Text style={styles.clientDateText}>{formatarData(data.dataEmissao)}</Text>
    </View>

    {/* Linha 1 */}
    <View style={styles.gridRow}>
      <View style={styles.colLeft}>
        <Text style={{ flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>CLIENTE: </Text>
          <Text style={styles.gridCellValue}>{data.clienteNome?.toUpperCase()}</Text>
        </Text>
      </View>
      <View style={{ width: '55%' }}>
        <Text style={{ flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>E-MAIL: </Text>
          <Text style={styles.gridCellValue}>{data.clienteEmail}</Text>
        </Text>
      </View>
    </View>

    {/* Linha 2 */}
    <View style={styles.gridRow}>
      <View style={styles.colLeft}>
        <Text style={{ flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>RESPO: </Text>
          <Text style={styles.gridCellValue}>{data.clienteResponsavel}</Text>
        </Text>
      </View>
      <View style={styles.colCenter}>
        <Text style={{ flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>CPF/CNPJ: </Text>
          <Text style={styles.gridCellValue}>{formatarCpfCnpj(data.clienteCpfCnpj)}</Text>
        </Text>
      </View>
      <View style={styles.colRight}>
        <Text style={{ flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>END.: </Text>
          <Text style={styles.gridCellValue}>{data.clienteEndereco}</Text>
        </Text>
      </View>
    </View>

    {/* Linha 3 */}
    <View style={styles.gridRow}>
      <View style={styles.colLeft}>
        <Text style={{ flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>TEL: </Text>
          <Text style={styles.gridCellValue}>{formatarTelefone(data.clienteTelefone || '')}</Text>
        </Text>
      </View>
      <View style={styles.colCenter}>
        <Text style={{ flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>BAIRRO: </Text>
          <Text style={styles.gridCellValue}>{data.clienteBairro}</Text>
        </Text>
      </View>
      <View style={styles.colRight}>
        <Text style={{ flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>CIDADE/ESTADO: </Text>
          <Text style={styles.gridCellValue}>{data.clienteCidade}/{data.clienteEstado}</Text>
        </Text>
      </View>
    </View>

    {/* Linha 4 */}
    <View style={[styles.gridRow, { marginTop: 5 }]}>
      <View style={styles.colLeft}>
        <Text style={{ flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>CODIGO DA PROPOSTA: </Text>
          <Text style={styles.gridCellValue}>{data.codigoProposta || data.codigoOS}</Text>
        </Text>
      </View>
      <View style={styles.colCenter}>
        <Text style={{ flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>QUANTIDADE DE UNIDADES: </Text>
          <Text style={styles.gridCellValue}>{data.quantidadeUnidades || '-'}</Text>
        </Text>
      </View>
      <View style={styles.colRight}>
        <Text style={{ flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>QUANTIDADE DE BLOCOS: </Text>
          <Text style={styles.gridCellValue}>{data.quantidadeBlocos || '-'}</Text>
        </Text>
      </View>
    </View>

    {/* Título da Proposta - sempre exibido em UPPERCASE */}
    <View style={[styles.greyBar, { marginTop: 10 }]}>
      <Text style={styles.greyBarText}>
        PROPOSTA PARA {(data.tituloProposta || 'SERVIÇOS DE ENGENHARIA').toUpperCase()}
      </Text>
    </View>
  </View>
);

/**
 * SpecsTable - Tabela de Especificações Técnicas
 * @param etapas - Etapas e subetapas do escopo
 * @param fatorMultiplicador - Fator para converter custo em valor de venda
 *                             Fórmula: 1 + %Imprevisto + %Lucro + %Imposto
 */
const SpecsTable = ({ etapas, fatorMultiplicador = 1 }: { etapas: Etapa[], fatorMultiplicador?: number }) => (
  <View>
    <View style={[styles.blueHeader, { justifyContent: 'space-between', marginTop: 15 }]}>
      <Text style={styles.blueHeaderText}>2. ESPECIFICAÇÕES TÉCNICAS;</Text>
    </View>

    {/* Header Tabela */}
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderCell, styles.colItem]}>ITEM</Text>
      <Text style={[styles.tableHeaderCell, styles.colDesc]}>DESCRIÇÃO DE SERVIÇOS</Text>
      <Text style={[styles.tableHeaderCell, styles.colUnit]}>UNID.</Text>
      <Text style={[styles.tableHeaderCell, styles.colTotal]}>VALOR</Text>
    </View>

    {etapas.map((etapa, idx) => (
      <View key={idx} wrap={false}>
        {/* Linha da Etapa */}
        <View style={styles.rowSection}>
          <Text style={[styles.cellTextBold, styles.colItem]}>{idx + 1}</Text>
          <Text style={[styles.cellTextBold, styles.colDesc]}>{etapa.nome.toUpperCase()}</Text>
          <Text style={[styles.cellTextBold, styles.colUnit]}></Text>
          <Text style={[styles.cellTextBold, styles.colTotal]}></Text>
        </View>

        {/* Subetapas - Valor = Custo × Fator */}
        {etapa.subetapas.map((sub, sIdx) => {
          const valorFinal = Number(sub.total || 0) * fatorMultiplicador;
          return (
            <View key={sIdx} style={styles.rowItem}>
              <Text style={[styles.cellText, styles.colItem]}>{idx + 1}.{sIdx + 1}</Text>
              <Text style={[styles.cellText, styles.colDesc]}>{sub.nome}</Text>
              <Text style={[styles.cellText, styles.colUnit]}>{sub.quantidade || sub.m2 || 1}</Text>
              <Text style={[styles.cellText, styles.colTotal]}>{formatarMoeda(valorFinal)}</Text>
            </View>
          );
        })}
      </View>
    ))}
  </View>
);

/**
 * Cronograma - Tabela de Prazo e Cronograma de Obra
 * Estrutura hierárquica:
 * 1. Planejamento Inicial
 * 2. Logística e Transporte
 * 3. Preparação da Área de Trabalho
 * 4. Execução da Obra
 *    > Etapas
 *      > Subetapas
 */
const Cronograma = ({ dados }: { dados: DadosCronograma }) => {
  // Valores gerais (Tópico 3 do Memorial)
  const planejamento = Number(dados.planejamentoInicial) || 0;
  const logistica = Number(dados.logisticaTransporte) || 0;
  const preparacao = Number(dados.preparacaoArea) || 0;

  // Cálculo de dias de execução (soma de todas as subetapas)
  let diasExecucao = 0;
  if (dados.etapasPrincipais) {
    dados.etapasPrincipais.forEach((e: Etapa) => {
      e.subetapas.forEach((s: Subetapa) => {
        diasExecucao += Number(s.diasUteis) || 0;
      });
    });
  }

  // Total geral
  const totalDias = planejamento + logistica + preparacao + diasExecucao;

  return (
    <View wrap={false} style={{ marginTop: 15 }}>
      <View style={styles.blueHeader}>
        <Text style={styles.blueHeaderText}>3. PRAZO - CRONOGRAMA DE OBRA:</Text>
        <Text style={[styles.whiteTextRegular, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>
          {totalDias} dias úteis
        </Text>
      </View>

      {/* Tabela Cronograma */}
      <View style={{ borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: colors.neutral300 }}>
        {/* Header */}
        <View style={[styles.rowSection, { backgroundColor: colors.neutral300 }]}>
          <Text style={[styles.cellTextBold, styles.colCronAtiv, { textAlign: 'center' }]}>ATIVIDADE</Text>
          <Text style={[styles.cellTextBold, styles.colCronDias]}>DIAS ÚTEIS</Text>
        </View>

        {/* 1. Planejamento Inicial */}
        <View style={styles.rowYellow}>
          <Text style={[styles.cellTextBold, styles.colCronAtiv]}>1. Planejamento Inicial</Text>
          <Text style={[styles.cellTextBold, styles.colCronDias]}>{planejamento || '-'}</Text>
        </View>

        {/* 2. Logística e Transporte */}
        <View style={styles.rowYellow}>
          <Text style={[styles.cellTextBold, styles.colCronAtiv]}>2. Logística e Transporte</Text>
          <Text style={[styles.cellTextBold, styles.colCronDias]}>{logistica || '-'}</Text>
        </View>

        {/* 3. Preparação da Área de Trabalho */}
        <View style={styles.rowYellow}>
          <Text style={[styles.cellTextBold, styles.colCronAtiv]}>3. Preparação da Área de Trabalho</Text>
          <Text style={[styles.cellTextBold, styles.colCronDias]}>{preparacao || '-'}</Text>
        </View>

        {/* 4. Execução da Obra (Header) */}
        <View style={[styles.rowYellow, { backgroundColor: colors.tableRowYellow }]}>
          <Text style={[styles.cellTextBold, styles.colCronAtiv]}>4. Execução da Obra</Text>
          <Text style={[styles.cellTextBold, styles.colCronDias]}>{diasExecucao || '-'}</Text>
        </View>

        {/* Etapas e Subetapas da Execução */}
        {dados.etapasPrincipais && dados.etapasPrincipais.map((etapa: Etapa, etapaIdx: number) => {
          const diasEtapa = etapa.subetapas.reduce((acc: number, s: Subetapa) => acc + (Number(s.diasUteis) || 0), 0);

          return (
            <View key={etapaIdx}>
              {/* Linha da Etapa Principal (indentada) */}
              <View style={[styles.rowItem, { backgroundColor: colors.neutral100 }]}>
                <Text style={[styles.cellTextBold, styles.colCronAtiv, { paddingLeft: 15 }]}>
                  4.{etapaIdx + 1}. {etapa.nome}
                </Text>
                <Text style={[styles.cellTextBold, styles.colCronDias]}>{diasEtapa || '-'}</Text>
              </View>

              {/* Subetapas (mais indentadas) */}
              {etapa.subetapas.map((sub: Subetapa, subIdx: number) => (
                <View key={subIdx} style={styles.rowItem}>
                  <Text style={[styles.cellText, styles.colCronAtiv, { paddingLeft: 30 }]}>
                    • {sub.nome}
                  </Text>
                  <Text style={[styles.cellText, styles.colCronDias]}>{sub.diasUteis || '-'}</Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const Investimento = ({ financeiro, data }: { financeiro: DadosFinanceiros, data: PropostaData }) => {
  const preco = Number(financeiro.precoFinal);
  const valImposto = Number(financeiro.percentualImposto || 0); // Se for valor absoluto, ou calcular se for %
  // Se percentualImposto for string com %, tratar. Aqui assumindo valor monetário já calculado ou simples.
  // simplificação: assumindo que financeiro.precoFinal já é o total.

  const valEntrada = (Number(financeiro.percentualEntrada || 30) / 100) * preco;
  const pcEntrada = financeiro.percentualEntrada || 30;

  const parcelas = Number(financeiro.numeroParcelas || 1);
  const valParcela = (preco - valEntrada) / parcelas;

  const qtdUnidades = data.quantidadeUnidades || 1;
  const unitario = preco / qtdUnidades;

  return (
    <View wrap={false} style={{ marginTop: 15 }}>
      <View style={styles.blueHeader}>
        <Text style={styles.blueHeaderText}>5. INVESTIMENTO:</Text>
      </View>

      {/* Tabela de Investimento */}
      <View style={{ marginTop: 5 }}>
        {/* Linha Investimento Obra */}
        <View style={styles.investRow}>
          <Text style={[styles.investLabel, { fontFamily: 'Helvetica-Bold' }]}>INVESTIMENTO PARA EXECUÇÃO DA OBRA:</Text>
          <Text style={styles.investValue}>{formatarMoeda(preco)}</Text>
        </View>

        {/* Linha Impostos */}
        <View style={styles.taxRow}>
          <Text style={styles.taxLabel}>IMPOSTOS (Nota Fiscal): {financeiro.percentualImposto}% (já incluso)</Text>
          <Text style={styles.investValue}> - </Text>
        </View>

        {/* Linha Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>VALOR TOTAL DA PROPOSTA:</Text>
          <Text style={styles.totalValue}>{formatarMoeda(preco)}</Text>
        </View>

        {/* Box Unitário se houver mais de 1 unidade */}
        {qtdUnidades > 1 && (
          <View style={styles.unitBox}>
            <Text style={styles.unitTitle}>Valor por Unidade</Text>
            <View style={styles.unitRow}>
              <Text style={styles.unitLabel}>Material + Mão de Obra:</Text>
              <Text style={styles.unitVal}>{formatarMoeda(unitario)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Condições de Pagamento */}
      <View style={[styles.blueHeader, { marginTop: 15 }]}>
        <Text style={styles.blueHeaderText}>6. FORMA DE PAGAMENTO:</Text>
      </View>
      <View style={styles.paymentTerms}>
        <View style={styles.paymentColLeft}>
          <Text style={[styles.paymentText, { fontFamily: 'Helvetica-Bold' }]}>• ENTRADA ({pcEntrada}%) NO INÍCIO:</Text>
          <Text style={[styles.paymentText, { fontFamily: 'Helvetica-Bold' }]}>• SALDO EM {parcelas}x SEM JUROS:</Text>
        </View>
        <View style={styles.paymentColRight}>
          <Text style={styles.paymentText}>{formatarMoeda(valEntrada)}</Text>
          <Text style={styles.paymentText}>{formatarMoeda(valParcela)} (boletos/pix quinzenais)</Text>
        </View>
      </View>
    </View>
  );
};

const Footer = () => (
  <View fixed style={styles.footerContainer}>
    {/* Page X of Y */}
    <View style={styles.footerPageWrapper}>
      <View style={styles.pagePill}>
        <Text style={styles.pageText} render={({ pageNumber, totalPages }: { pageNumber: number, totalPages: number }) => (
          `PÁGINA ${pageNumber} / ${totalPages}`
        )} />
      </View>
    </View>

    {/* Barra Dourada Final */}
    <View style={styles.footerGoldBar} />
  </View>
);

// --- COMPONENTE PRINCIPAL ---
export const PropostaTemplate = ({ data }: { data: PropostaData }) => {
  // Calcular fator multiplicador para converter custos em valores de venda
  // Fórmula: fator = 1 + (%Imprevisto/100) + (%Lucro/100) + (%Imposto/100)
  const percentualImprevisto = Number(data.dadosFinanceiros?.percentualImprevisto) || 0;
  const percentualLucro = Number(data.dadosFinanceiros?.percentualLucro) || 0;
  const percentualImposto = Number(data.dadosFinanceiros?.percentualImposto) || 0;
  const fatorMultiplicador = 1 + (percentualImprevisto / 100) + (percentualLucro / 100) + (percentualImposto / 100);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* 1. Header Fixo */}
        <View fixed>
          <Header data={data} />
        </View>

        {/* 2. Dados do Cliente e Título */}
        <ClientInfo data={data} />

        {/* 3. Objetivo */}
        <View wrap={false}>
          <View style={styles.blueHeader}>
            <Text style={styles.blueHeaderText}>1. OBJETIVO:</Text>
          </View>
          <View style={{ padding: 5, marginBottom: 10 }}>
            <Text style={{ fontSize: 9, textAlign: 'justify', lineHeight: 1.4 }}>
              {data.objetivo || 'Execução de serviços de engenharia conforme especificações abaixo.'}
            </Text>
          </View>
        </View>

        {/* 4. Especificações (Etapas) - Valores já com margens aplicadas */}
        <SpecsTable
          etapas={data.dadosCronograma.etapasPrincipais}
          fatorMultiplicador={fatorMultiplicador}
        />

        {/* 5. Cronograma */}
        <Cronograma dados={data.dadosCronograma} />

        {/* 6. Garantias (Item 4) */}
        <View wrap={false} style={{ marginTop: 15 }}>
          <View style={styles.blueHeader}>
            <Text style={styles.blueHeaderText}>4. GARANTIA:</Text>
          </View>
          <View style={styles.garantiaBox}>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletText}>• Seguro de obra incluso (cobertura de danos materiais causados ao proprietário da obra e erro de projeto);</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletText}>• Serviço garantido por nota fiscal e emissão de ART (Anotação de Responsabilidade Técnica) - CREA-MA;</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletText}>• Garantia conforme NBR 15575-1 - Edificações Habitacionais - Desempenho;</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletText}>• 05 (cinco) anos para solidez e segurança da obra;</Text>
            </View>
          </View>
        </View>

        {/* 7. Investimento */}
        <Investimento financeiro={data.dadosFinanceiros} data={data} />

        {/* Validade */}
        <Text style={styles.validityText}>
          Validade desta proposta: {data.validadeProposta || 15} dias.
        </Text>

        {/* Texto Legal */}
        <Text style={styles.legalText}>
          Este documento é de propriedade intelectual da Minerva Engenharia. Sua reprodução parcial ou total é proibida.
        </Text>

        {/* Footer Fixo */}
        <Footer />

      </Page>
    </Document>
  );
};

export default PropostaTemplate;