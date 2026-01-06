/**
 * Template de Proposta de Assessoria Pontual (OS 06)
 * Design Premium (Match OS 05)
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { colors, fonts, commonStyles } from './shared-styles.ts';
import { formatarData, formatarMoeda } from '../utils/pdf-formatter.ts';
import { LOGO_BASE64 } from './assets.ts';

// ============================================
// INTERFACES
// ============================================

export interface EspecificacaoTecnica {
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
  valorParcial: number;
  percentualImposto: number;
}

export interface DadosPagamento {
  percentualEntrada: number;
  numeroParcelas: number;
  percentualDesconto?: number;
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
  clienteResponsavel?: string; // Novo

  // Dados Quantitativos (Novo)
  quantidadeUnidades: number;
  quantidadeBlocos: number;

  // Conteúdo Dinâmico
  objetivo: string;
  especificacoesTecnicas: EspecificacaoTecnica[];
  metodologia: string;
  prazo: DadosPrazo;
  garantia: string;
  precificacao: DadosPrecificacao;
  pagamento: DadosPagamento;
}

// Textos padrão
const METODOLOGIA_PADRAO = `• Investigação in loco com auxílio de equipamentos de diagnóstico
• Análise de dados colhidos entre equipe técnica
• Elaboração de laudo técnico com o diagnóstico
• Apresentação de laudo para cliente`;

const GARANTIA_PADRAO = `A qualidade do serviço prestado é garantida integralmente na responsabilidade técnica de empresa habilitada para exercício da função, com corpo técnico formado por engenheiros especialistas na área, devidamente registrados no órgão da classe CREA-MA.`;

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  ...commonStyles,

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

  // --- HEADER PREMIUM ---
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
    fontSize: 8,
    textAlign: 'right',
    color: colors.black,
    marginBottom: 1,
  },
  goldBar: {
    height: 4,
    backgroundColor: colors.primary,
    width: '100%',
    marginBottom: 10,
    marginTop: 5,
  },

  // --- CLIENTE GRID ---
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
    fontSize: 8,
    color: colors.black,
    marginLeft: 4,
  },

  // --- TITLE ---
  proposalTitleContainer: {
    backgroundColor: '#E0E0E0', // Cinza claro
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  proposalTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.black,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  // --- SECTIONS ---
  section: {
    marginBottom: 15,
  },
  sectionTitleContainer: {
    backgroundColor: colors.minervaBlue, // Azul escuro
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 5,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.white,
    textTransform: 'uppercase',
  },
  sectionContent: {

  },

  // --- TABELAS ---
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    padding: 4,
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.black,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    padding: 4,
  },
  tableCell: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.black,
  },

  // --- LISTAS ---
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 5,
  },
  bulletPoint: {
    width: 10,
    fontSize: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 1.4,
  },

  // --- INVESTIMENTOS ---
  investRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  investTotalRow: {
    flexDirection: 'row',
    backgroundColor: '#FFCCBC', // Laranja claro para impostos
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  investFinalRow: {
    flexDirection: 'row',
    backgroundColor: '#C8E6C9', // Verde claro para total
    paddingVertical: 4,
    paddingHorizontal: 4,
  },

  // --- FOOTER ---
  footerContainer: {
    marginTop: 20,
    borderTopWidth: 4,
    borderTopColor: colors.primary,
    paddingTop: 10,
  },
});

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function Header() {
  return (
    <View style={{ width: '100%' }}>
      <View style={styles.headerContainer}>
        {/* LOGO */}
        <Image src={LOGO_BASE64} style={styles.headerLogo} />

        {/* INFO */}
        <View style={styles.headerInfoContainer}>
          <Text style={styles.headerAddress}>Av. Colares Moreira, Edifício Los Angeles, Nº100, Loja 01</Text>
          <Text style={styles.headerAddress}>Renascença, São Luís - MA, CEP: 65075-144</Text>
          <Text style={styles.headerAddress}>(98) 98226-7909 / (98) 98151-3355</Text>
          <Text style={styles.headerAddress}>www.minerva-eng.com.br / contato@minerva-eng.com.br</Text>
        </View>
      </View>
      <View style={styles.goldBar} />
    </View>
  );
}

function ClientInfo({ data }: { data: PropostaAssPontualData }) {
  return (
    <View style={styles.clientGridContainer}>
      {/* DATA */}
      <View style={styles.clientDateRow}>
        <Text style={styles.clientDateText}>{formatarData(data.dataEmissao)}</Text>
      </View>

      {/* LINHA 1: Cliente e Email */}
      <View style={styles.gridRow}>
        <View style={{ width: '55%', flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>CLIENTE:</Text>
          <Text style={[styles.gridCellValue, { flex: 1 }]}>{data.clienteNome.toUpperCase()}</Text>
        </View>
        <View style={{ width: '45%', flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>E-MAIL:</Text>
          <Text style={[styles.gridCellValue, { flex: 1 }]}>{data.clienteEmail || '-'}</Text>
        </View>
      </View>

      {/* LINHA 2: Responsável, CNPJ, Endereço */}
      <View style={styles.gridRow}>
        <View style={{ width: '30%', flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>RESPONSÁVEL:</Text>
          <Text style={[styles.gridCellValue, { flex: 1 }]}>{data.clienteResponsavel || '-'}</Text>
        </View>
        <View style={{ width: '25%', flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>CPF/CNPJ:</Text>
          <Text style={[styles.gridCellValue, { flex: 1 }]}>{data.clienteCpfCnpj || '-'}</Text>
        </View>
        <View style={{ width: '45%', flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>END.:</Text>
          <Text style={[styles.gridCellValue, { flex: 1 }]}>{data.clienteEndereco}, {data.clienteBairro}</Text>
        </View>
      </View>

      {/* LINHA 3: Tel, Cidade, Código, Unidades, Blocos */}
      <View style={styles.gridRow}>
        <View style={{ width: '20%', flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>TEL:</Text>
          <Text style={[styles.gridCellValue, { flex: 1 }]}>{data.clienteTelefone || '-'}</Text>
        </View>
        <View style={{ width: '35%', flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>CIDADE/ESTADO:</Text>
          <Text style={[styles.gridCellValue, { flex: 1 }]}>{data.clienteCidade}/{data.clienteEstado}</Text>
        </View>
      </View>

      {/* LINHA 4: Código, Unidades, Blocos (Destaque) */}
      <View style={[styles.gridRow, { marginTop: 2 }]}>
        <View style={{ width: '30%', flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>CÓDIGO DA PROPOSTA:</Text>
          <Text style={[styles.gridCellValue, { fontFamily: 'Helvetica-Bold' }]}>{data.codigoOS}</Text>
        </View>
        <View style={{ width: '30%', flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>QUANTIDADE DE UNIDADES:</Text>
          <Text style={[styles.gridCellValue, { fontFamily: 'Helvetica-Bold' }]}>{data.quantidadeUnidades}</Text>
        </View>
        <View style={{ width: '30%', flexDirection: 'row' }}>
          <Text style={styles.gridCellLabel}>QUANTIDADE DE BLOCOS:</Text>
          <Text style={[styles.gridCellValue, { fontFamily: 'Helvetica-Bold' }]}>{data.quantidadeBlocos}</Text>
        </View>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footerContainer}>
      {/* Barra Dourada apenas */}
    </View>
  );
}

// ============================================
// TEMPLATE PRINCIPAL
// ============================================

export function PropostaAssPontualTemplate({ data }: { data: PropostaAssPontualData }) {
  const valorImposto = (data.precificacao.valorParcial * data.precificacao.percentualImposto) / 100;
  const valorTotal = data.precificacao.valorParcial + valorImposto;

  const prazoTotal = data.prazo.planejamentoInicial +
    data.prazo.logisticaTransporte +
    data.prazo.levantamentoCampo +
    data.prazo.composicaoLaudo +
    data.prazo.apresentacaoCliente;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header />

        <ClientInfo data={data} />

        <View style={styles.proposalTitleContainer}>
          <Text style={styles.proposalTitle}>PROPOSTA PARA LAUDO PONTUAL DE ASSESSORIA TÉCNICA DE ENGENHARIA</Text>
        </View>

        <Section title="1. OBJETIVO:">
          <View style={{ paddingLeft: 5 }}>
            <Text style={{ fontSize: 9, lineHeight: 1.4 }}>
              {data.objetivo}
            </Text>
          </View>
        </Section>

        <Section title="2. ESPECIFICAÇÕES TÉCNICAS:">
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: 30, textAlign: 'center' }]}>ITEM</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>DESCRIÇÃO</Text>
            </View>
            {data.especificacoesTecnicas.map((esp, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: 30, textAlign: 'center' }]}>{i + 1}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{esp.descricao}</Text>
              </View>
            ))}
          </View>
        </Section>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 5 }}>METODOLOGIA:</Text>
          {data.metodologia.split('\n').map((line, i) => (
            <View key={i} style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>{line.replace(/^• /, '')}</Text>
            </View>
          ))}
        </View>

        <Section title="3. PRAZO:">
          <View style={{ paddingLeft: 5 }}>
            <View style={styles.bulletItem}><Text style={styles.bulletPoint}>•</Text><Text style={styles.bulletText}>Planejamento inicial: {data.prazo.planejamentoInicial} dias úteis;</Text></View>
            <View style={styles.bulletItem}><Text style={styles.bulletPoint}>•</Text><Text style={styles.bulletText}>Logística e transporte de materiais: {data.prazo.logisticaTransporte} dia útil;</Text></View>
            <View style={styles.bulletItem}><Text style={styles.bulletPoint}>•</Text><Text style={styles.bulletText}>Levantamento em campo: {data.prazo.levantamentoCampo} dias úteis;</Text></View>
            <View style={styles.bulletItem}><Text style={styles.bulletPoint}>•</Text><Text style={styles.bulletText}>Composição de laudo técnico: {data.prazo.composicaoLaudo} dias úteis;</Text></View>
            <View style={styles.bulletItem}><Text style={styles.bulletPoint}>•</Text><Text style={styles.bulletText}>Apresentação de laudo técnico para cliente: {data.prazo.apresentacaoCliente} dia útil;</Text></View>

            <View style={{ marginTop: 5, flexDirection: 'row' }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>PRAZO TOTAL ESTIMADO DOS SERVIÇOS: </Text>
              <Text style={{ fontSize: 9 }}>{prazoTotal} DIAS ÚTEIS</Text>
            </View>
          </View>
        </Section>

        <Section title="4. GARANTIA:">
          <Text style={{ fontSize: 9, lineHeight: 1.4 }}>
            {data.garantia}
          </Text>
        </Section>

        <Section title="5. INVESTIMENTOS">
          <View style={{ flexDirection: 'row', backgroundColor: '#F0F0F0', padding: 4 }}>
            <Text style={{ width: 30, fontSize: 8, fontFamily: 'Helvetica-Bold' }}>ITEM</Text>
            <Text style={{ flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold' }}>DESCRIÇÃO: INCLUSO MATERIAL, MÃO DE OBRA, LOGISTICA E EVENTUALIDADES</Text>
            <Text style={{ width: 80, fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>TOTAL</Text>
          </View>

          <View style={{ flexDirection: 'row', padding: 4, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
            <Text style={{ width: 30, fontSize: 8, textAlign: 'center' }}>1</Text>
            <Text style={{ flex: 1, fontSize: 8 }}>Investimento, diagnóstico e composição de laudo;</Text>
            <Text style={{ width: 80, fontSize: 8, textAlign: 'right' }}>{formatarMoeda(data.precificacao.valorParcial)}</Text>
          </View>

          <View style={{ flexDirection: 'row', backgroundColor: '#FFCCBC', padding: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginRight: 10 }}>IMPOSTOS (EMISSÃO DE NOTA FISCAL DE SERVIÇOS):</Text>
            <Text style={{ width: 80, fontSize: 8, textAlign: 'right', fontFamily: 'Helvetica-Bold' }}>{formatarMoeda(valorImposto)}</Text>
          </View>

          <View style={{ flexDirection: 'row', backgroundColor: '#4CAF50', padding: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: 'white', marginRight: 10 }}>INVESTIMENTO + IMPOSTOS:</Text>
            <Text style={{ width: 80, fontSize: 8, textAlign: 'right', fontFamily: 'Helvetica-Bold', color: 'white' }}>{formatarMoeda(valorTotal)}</Text>
          </View>
        </Section>

        <Section title="6. PAGAMENTO">
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 5 }}>6.1 PARCELAMENTO</Text>
          <View style={{ marginLeft: 10 }}>
            <View style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={{ width: 80, fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{formatarMoeda((valorTotal * data.pagamento.percentualEntrada) / 100)}</Text>
              <Text style={{ fontSize: 9 }}>{data.pagamento.percentualEntrada}% entrada</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ width: 80, fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{formatarMoeda((valorTotal - (valorTotal * data.pagamento.percentualEntrada) / 100) / data.pagamento.numeroParcelas)}</Text>
              <Text style={{ fontSize: 9 }}>{data.pagamento.numeroParcelas} parcelas mensais</Text>
            </View>
          </View>
        </Section>

        <Footer />
      </Page>
    </Document>
  );
}
