/**
 * Template de Proposta de Assessoria Anual (OS 05)
 * Design Premium Refinado (Minerva V2)
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { colors } from './shared-styles.ts';
import { LOGO_BASE64 } from './assets.ts';
import { formatarMoeda, formatarData, formatarCpfCnpj, formatarTelefone } from '../utils/pdf-formatter.ts';

// ============================================
// INTERFACES
// ============================================

export interface EspecificacaoTecnica {
  descricao: string;
}

export interface DadosPrazoAnual {
  horarioFuncionamento: string;
  suporteEmergencial: string;
}

export interface DadosPrecificacao {
  valorParcial: number;
  percentualImposto: number;
}

export interface DadosPagamento {
  percentualDesconto: number;
  diaVencimento: number;
  percentualEntrada?: number;
  numeroParcelas?: number;
}

export interface PropostaAssAnualData {
  codigoOS: string;
  dataEmissao: string;

  clienteNome: string;
  clienteCpfCnpj: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  clienteEndereco?: string;
  clienteBairro?: string;
  clienteCidade?: string;
  clienteEstado?: string;
  clienteResponsavel?: string; // Novo campo

  quantidadeUnidades?: number; // Novo campo
  quantidadeBlocos?: number;   // Novo campo

  objetivo: string;
  especificacoesTecnicas: EspecificacaoTecnica[];
  metodologia: string;
  prazo: DadosPrazoAnual;
  garantia: string;
  precificacao: DadosPrecificacao;
  pagamento: DadosPagamento;
}

// Textos padrão
const METODOLOGIA_PADRAO = `• Acompanhamento semanal in loco
• Relatório mensal de acompanhamento de plano de manutenção
• Mais de 35 equipamentos de diagnóstico`;

const GARANTIA_PADRAO = `A qualidade do serviço prestado é garantida integralmente na responsabilidade técnica de empresa habilitada para exercício da função, com corpo técnico formado por engenheiros especialistas na área, devidamente registrados no órgão da classe CREA-MA.`;

const PRAZO_PADRAO: DadosPrazoAnual = {
  horarioFuncionamento: 'Segunda a sexta de 8h às 18h',
  suporteEmergencial: 'Suporte técnico emergencial - atuação máxima de 2h',
};

// ============================================
// ESTILOS PREMIUM (Baseado em proposta-template.tsx)
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
    fontSize: 9,
    color: colors.black,
    marginLeft: 4,
  },
  // Colunas
  colHalf: { width: '50%' },
  colThird: { width: '33.33%' },

  // --- SEÇÕES ---
  blueHeader: {
    backgroundColor: '#0056b3', // Azul escuro Minerva
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginTop: 10,
    marginBottom: 0,
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
    paddingVertical: 5,
    paddingHorizontal: 5,
  },

  // --- TABELAS ---
  table: {
    borderWidth: 1,
    borderColor: colors.neutral300,
    marginTop: 0,
  },
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
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.neutral200,
    paddingVertical: 3,
  },
  tableRowAlt: {
    backgroundColor: colors.neutral50,
  },
  tableCellText: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: colors.black,
  },

  // --- LISTAS ---
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 5,
  },
  bulletPoint: {
    fontSize: 9,
    marginRight: 5,
    color: colors.black,
  },
  bulletText: {
    fontSize: 9,
    color: colors.black,
    flex: 1,
  },

  // --- INVESTIMENTOS ---
  investTotalRow: {
    flexDirection: 'row',
    backgroundColor: colors.success,
    paddingVertical: 4,
    paddingHorizontal: 5,
  },

  // --- FOOTER ---
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
  },
  footerGoldBar: {
    height: 10,
    backgroundColor: colors.primary,
    width: '100%',
  }
});

// ============================================
// COMPONENTES
// ============================================

const Header = ({ data }: { data: PropostaAssAnualData }) => (
  <View>
    <View style={styles.headerContainer}>
      <Image style={styles.headerLogo} src={LOGO_BASE64} />
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

const ClientInfo = ({ data }: { data: PropostaAssAnualData }) => (
  <View style={styles.clientGridContainer}>
    {/* Data e Hora */}
    <View style={styles.clientDateRow}>
      <Text style={styles.clientDateText}>{formatarData(data.dataEmissao)}</Text>
    </View>

    {/* Linha 1: Cliente | Email */}
    <View style={styles.gridRow}>
      <View style={styles.colHalf}>
        <Text style={styles.gridCellLabel}>CLIENTE: <Text style={styles.gridCellValue}>{data.clienteNome}</Text></Text>
      </View>
      <View style={styles.colHalf}>
        <Text style={styles.gridCellLabel}>E-MAIL: <Text style={styles.gridCellValue}>{data.clienteEmail}</Text></Text>
      </View>
    </View>

    {/* Linha 2: Responsável | CPF/CNPJ | Endereço */}
    <View style={styles.gridRow}>
      <View style={{ width: '30%' }}>
        <Text style={styles.gridCellLabel}>RESPONSÁVEL: <Text style={styles.gridCellValue}>{data.clienteResponsavel || '---'}</Text></Text>
      </View>
      <View style={{ width: '30%' }}>
        <Text style={styles.gridCellLabel}>CPF/CNPJ: <Text style={styles.gridCellValue}>{formatarCpfCnpj(data.clienteCpfCnpj)}</Text></Text>
      </View>
      <View style={{ width: '40%' }}>
        <Text style={styles.gridCellLabel}>END.: <Text style={styles.gridCellValue}>{data.clienteEndereco}</Text></Text>
      </View>
    </View>

    {/* Linha 3: Tel | Bairro | Cidade */}
    <View style={styles.gridRow}>
      <View style={{ width: '30%' }}>
        <Text style={styles.gridCellLabel}>TEL: <Text style={styles.gridCellValue}>{formatarTelefone(data.clienteTelefone || '')}</Text></Text>
      </View>
      <View style={{ width: '30%' }}>
        <Text style={styles.gridCellLabel}>BAIRRO: <Text style={styles.gridCellValue}>{data.clienteBairro}</Text></Text>
      </View>
      <View style={{ width: '40%' }}>
        <Text style={styles.gridCellLabel}>CIDADE/ESTADO: <Text style={styles.gridCellValue}>{data.clienteCidade}/{data.clienteEstado || 'MA'}</Text></Text>
      </View>
    </View>

    {/* Linha 4: Código | Unidades | Blocos */}
    <View style={[styles.gridRow, { backgroundColor: colors.neutral100, paddingVertical: 2, marginTop: 4 }]}>
      <View style={styles.colThird}>
        <Text style={styles.gridCellLabel}>CÓDIGO DA PROPOSTA: <Text style={styles.gridCellValue}>{data.codigoOS}</Text></Text>
      </View>
      <View style={styles.colThird}>
        <Text style={styles.gridCellLabel}>QUANTIDADE DE UNIDADES: <Text style={styles.gridCellValue}>{data.quantidadeUnidades || 0}</Text></Text>
      </View>
      <View style={styles.colThird}>
        <Text style={styles.gridCellLabel}>QUANTIDADE DE BLOCOS: <Text style={styles.gridCellValue}>{data.quantidadeBlocos || 0}</Text></Text>
      </View>
    </View>
  </View>
);

const Objetivo = ({ objetivo }: { objetivo: string }) => {
  const bullets = objetivo ? objetivo.split(/[;\n]/).map(i => i.trim()).filter(i => i) : [];
  return (
    <View>
      <View style={styles.blueHeader}>
        <Text style={styles.blueHeaderText}>1. OBJETIVO:</Text>
      </View>
      <View style={styles.sectionContent}>
        {bullets.map((item, i) => (
          <View key={i} style={styles.bulletItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const Especificacoes = ({ itens }: { itens: EspecificacaoTecnica[] }) => (
  <View>
    <View style={styles.blueHeader}>
      <Text style={styles.blueHeaderText}>2. ESPECIFICAÇÕES TÉCNICAS;</Text>
    </View>
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { width: 40 }]}>ITEM</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'left', paddingLeft: 5 }]}>DESCRIÇÃO</Text>
      </View>
      {itens.map((item, i) => (
        <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
          <Text style={[styles.tableCellText, { width: 40, textAlign: 'center' }]}>{i + 1}</Text>
          <Text style={[styles.tableCellText, { flex: 1, paddingLeft: 5 }]}>{item.descricao}</Text>
        </View>
      ))}
    </View>
  </View>
);

const Metodologia = ({ texto }: { texto: string }) => {
  const final = texto || METODOLOGIA_PADRAO;
  const bullets = final.split('\n').map(i => i.trim()).filter(i => i);
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 4 }}>METODOLOGIA:</Text>
      {bullets.map((item, i) => (
        <View key={i} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item.replace(/^[•\-*]\s*/, '')}</Text>
        </View>
      ))}
    </View>
  );
};

const Prazo = ({ prazo }: { prazo: DadosPrazoAnual }) => (
  <View>
    <View style={styles.blueHeader}>
      <Text style={styles.blueHeaderText}>3. PRAZO:</Text>
    </View>
    <View style={styles.sectionContent}>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}>{prazo.horarioFuncionamento || PRAZO_PADRAO.horarioFuncionamento}</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}>{prazo.suporteEmergencial || PRAZO_PADRAO.suporteEmergencial}</Text>
      </View>
    </View>
  </View>
);

const Garantia = ({ texto }: { texto: string }) => (
  <View>
    <View style={styles.blueHeader}>
      <Text style={styles.blueHeaderText}>4. GARANTIA:</Text>
    </View>
    <View style={styles.sectionContent}>
      <Text style={{ fontSize: 9, textAlign: 'justify', lineHeight: 1.4 }}>
        {texto || GARANTIA_PADRAO}
      </Text>
    </View>
  </View>
);

const Investimentos = ({ precificacao }: { precificacao: DadosPrecificacao }) => {
  const imposto = (precificacao.valorParcial * precificacao.percentualImposto) / 100;
  const total = precificacao.valorParcial + imposto;

  return (
    <View>
      <View style={styles.blueHeader}>
        <Text style={styles.blueHeaderText}>5. INVESTIMENTOS</Text>
      </View>
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.tableHeader, { backgroundColor: colors.neutral200 }]}>
          <View style={{ width: '70%', paddingLeft: 5 }}>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>DESCRIÇÃO:</Text>
            <Text style={{ fontSize: 7 }}>ITEM INCLUSO MATERIAL, MÃO DE OBRA, LOGISTICA E EVENTUALIDADES</Text>
          </View>
          <Text style={[styles.tableHeaderCell, { width: '30%', textAlign: 'right', paddingRight: 5 }]}>TOTAL</Text>
        </View>

        {/* Item 1 */}
        <View style={styles.tableRow}>
          <View style={{ width: '10%', alignItems: 'center' }}><Text style={styles.tableCellText}>1</Text></View>
          <Text style={[styles.tableCellText, { width: '60%' }]}>Execução de obra e entrega de serviço concluído;</Text>
          <Text style={[styles.tableCellText, { width: '30%', textAlign: 'right', paddingRight: 5 }]}>{formatarMoeda(precificacao.valorParcial)}</Text>
        </View>

        {/* Impostos (row laranja) */}
        <View style={{ flexDirection: 'row', backgroundColor: '#FDBA74', paddingVertical: 4 }}>
          <Text style={{ width: '70%', textAlign: 'right', paddingRight: 5, fontSize: 8, fontFamily: 'Helvetica-Bold' }}>IMPOSTOS (EMISSÃO DE NOTA FISCAL DE SERVIÇOS):</Text>
          <Text style={{ width: '30%', textAlign: 'right', paddingRight: 5, fontSize: 9 }}>{formatarMoeda(imposto)}</Text>
        </View>

        {/* Total (row verde) */}
        <View style={{ flexDirection: 'row', backgroundColor: '#22C55E', paddingVertical: 4 }}>
          <Text style={{ width: '70%', textAlign: 'right', paddingRight: 5, fontSize: 8, fontFamily: 'Helvetica-Bold', color: 'white' }}>INVESTIMENTO + IMPOSTOS:</Text>
          <Text style={{ width: '30%', textAlign: 'right', paddingRight: 5, fontSize: 9, fontFamily: 'Helvetica-Bold', color: 'white' }}>{formatarMoeda(total)}</Text>
        </View>
      </View>
    </View>
  );
};

const Pagamento = ({ data, valorTotal }: { data: DadosPagamento; valorTotal: number }) => {
  const imposto = (data.percentualEntrada || 0); // Warning, this mapping might be confusing in props. Using valorTotal calculated outside.
  // Recalculating totals locally
  const valorDesconto = (valorTotal * (data.percentualDesconto || 0)) / 100;
  const totalComDesconto = valorTotal - valorDesconto;

  return (
    <View>
      <View style={styles.blueHeader}>
        <Text style={styles.blueHeaderText}>6. PAGAMENTO</Text>
      </View>
      <View style={{ backgroundColor: colors.neutral100, padding: 5 }}>
        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>6.1 PROPOSTAS:</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF08A', padding: 5, marginBottom: 5 }}>
          <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginRight: 10 }}>{formatarMoeda(totalComDesconto)}</Text>
          <Text style={{ fontSize: 9 }}>{data.percentualDesconto}% de desconto para pagamento no quinto dia útil do Mês</Text>
        </View>
      </View>

      {/* Aviso legal igual a imagem */}
      <View style={{ marginTop: 20, backgroundColor: '#d4af37', height: 20, width: '100%', position: 'absolute', bottom: -30 }}></View>
    </View>
  );
};


// ============================================
// TEMPLATE PRINCIPAL
// ============================================

export function PropostaAssAnualTemplate({ data }: { data: PropostaAssAnualData }) {
  const imposto = (data.precificacao.valorParcial * data.precificacao.percentualImposto) / 100;
  const valorTotal = data.precificacao.valorParcial + imposto;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header data={data} />

        <View style={{ backgroundColor: '#E5E7EB', padding: 4, marginBottom: 10 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10, textAlign: 'center' }}>
            PROPOSTA PARA ASSESSORIA E SUPERVISÃO TÉCNICA DE ENGENHARIA
          </Text>
        </View>

        <ClientInfo data={data} />
        <Objetivo objetivo={data.objetivo} />
        <Especificacoes itens={data.especificacoesTecnicas} />
        <Metodologia texto={data.metodologia} />
        <Prazo prazo={data.prazo} />
        <Garantia texto={data.garantia} />

        {/* Quebra de página se necessário */}
        <View break={false}>
          <Investimentos precificacao={data.precificacao} />
          <Pagamento data={data.pagamento} valorTotal={valorTotal} />
        </View>

        {/* Footer Bar Decoration */}
        <View style={styles.footerContainer}>
          <View style={styles.footerGoldBar} />
        </View>
      </Page>
    </Document>
  );
}
