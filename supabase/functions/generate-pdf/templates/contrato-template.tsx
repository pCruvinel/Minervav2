/**
 * Template de Contrato em React PDF
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, fontSize, commonStyles } from './shared-styles.ts';
import { formatarMoeda, formatarData, formatarCpfCnpj } from '../utils/pdf-formatter.ts';

export interface ContratoData {
  // Dados da OS
  codigoOS: string;
  numeroContrato: string;
  dataEmissao: string;
  dataInicio: string;
  dataTermino?: string;

  // Dados do Contratante (Cliente)
  contratanteNome: string;
  contratanteCpfCnpj: string;
  contratanteEndereco?: string;
  contratanteCidade?: string;
  contratanteEstado?: string;

  // Dados do Contratado (Empresa)
  contratadoNome: string;
  contratadoCnpj: string;
  contratadoEndereco?: string;
  contratadoCidade?: string;
  contratadoEstado?: string;

  // Objeto do Contrato
  objetoContrato: string;
  valorContrato: number;
  formaPagamento?: string;

  // Cláusulas
  clausulas?: Array<{
    numero: number;
    titulo: string;
    texto: string;
  }>;
}

const styles = StyleSheet.create({
  ...commonStyles,

  // Título do contrato
  contratoTitle: {
    fontSize: fontSize['3xl'],
    fontFamily: fonts.bold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  numeroContrato: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    color: colors.neutral600,
    marginBottom: spacing.xl,
  },

  // Partes
  parteContainer: {
    marginBottom: spacing.lg,
  },

  parteTitle: {
    fontSize: fontSize.base,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },

  parteInfo: {
    fontSize: fontSize.sm,
    color: colors.neutral700,
    lineHeight: 1.5,
    marginBottom: spacing.xs,
  },

  // Objeto
  objetoContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.neutral50,
    borderLeft: `4 solid ${colors.primary}`,
  },

  objetoTitle: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.sm,
  },

  objetoText: {
    fontSize: fontSize.base,
    color: colors.neutral700,
    lineHeight: 1.6,
    textAlign: 'justify',
  },

  // Valor
  valorContainer: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },

  valorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  valorLabel: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  valorValue: {
    fontSize: fontSize['2xl'],
    fontFamily: fonts.bold,
    color: colors.white,
  },

  // Cláusulas
  clausulaContainer: {
    marginBottom: spacing.lg,
  },

  clausulaHeader: {
    fontSize: fontSize.base,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    marginBottom: spacing.xs,
  },

  clausulaTexto: {
    fontSize: fontSize.sm,
    color: colors.neutral700,
    lineHeight: 1.6,
    textAlign: 'justify',
  },

  // Assinaturas
  assinaturasContainer: {
    marginTop: spacing['3xl'],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  assinaturaBloco: {
    width: '45%',
    alignItems: 'center',
  },

  assinaturaLinha: {
    width: '100%',
    borderTop: `1 solid ${colors.neutral800}`,
    marginBottom: spacing.xs,
  },

  assinaturaNome: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.neutral800,
    textAlign: 'center',
  },

  assinaturaTipo: {
    fontSize: fontSize.xs,
    color: colors.neutral600,
    textAlign: 'center',
  },
});

export function ContratoTemplate({ data }: { data: ContratoData }) {
  const clausulasPadrao: Array<{ numero: number; titulo: string; texto: string }> = [
    {
      numero: 1,
      titulo: 'DO OBJETO',
      texto: data.objetoContrato || 'Definir objeto do contrato'
    },
    {
      numero: 2,
      titulo: 'DO VALOR E FORMA DE PAGAMENTO',
      texto: `O valor total do presente contrato é de ${formatarMoeda(data.valorContrato)}. ${data.formaPagamento || 'Forma de pagamento a ser definida.'}`
    },
    {
      numero: 3,
      titulo: 'DO PRAZO',
      texto: `O presente contrato tem vigência de ${formatarData(data.dataInicio)} até ${data.dataTermino ? formatarData(data.dataTermino) : 'data a definir'}.`
    },
    {
      numero: 4,
      titulo: 'DAS OBRIGAÇÕES DO CONTRATADO',
      texto: 'O CONTRATADO obriga-se a executar os serviços conforme especificado no objeto do contrato, seguindo as normas técnicas e de segurança aplicáveis.'
    },
    {
      numero: 5,
      titulo: 'DAS OBRIGAÇÕES DO CONTRATANTE',
      texto: 'O CONTRATANTE obriga-se a fornecer as informações necessárias e efetuar os pagamentos conforme acordado.'
    },
    {
      numero: 6,
      titulo: 'DA RESCISÃO',
      texto: 'O presente contrato poderá ser rescindido por qualquer das partes mediante comunicação por escrito com antecedência mínima de 30 (trinta) dias.'
    },
    {
      numero: 7,
      titulo: 'DO FORO',
      texto: 'As partes elegem o foro da comarca do CONTRATANTE para dirimir quaisquer dúvidas ou questões oriundas do presente contrato.'
    }
  ];

  const clausulasFinais = data.clausulas && data.clausulas.length > 0
    ? data.clausulas
    : clausulasPadrao;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <Text style={styles.contratoTitle}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</Text>
        <Text style={styles.numeroContrato}>Nº {data.numeroContrato}</Text>

        {/* Partes */}
        <View style={styles.parteContainer}>
          <Text style={styles.parteTitle}>CONTRATANTE:</Text>
          <Text style={styles.parteInfo}>
            <Text style={styles.textBold}>{data.contratanteNome}</Text>,{' '}
            inscrito(a) no CPF/CNPJ sob nº{' '}
            <Text style={styles.textBold}>{formatarCpfCnpj(data.contratanteCpfCnpj)}</Text>
            {data.contratanteEndereco && `, com endereço em ${data.contratanteEndereco}`}
            {data.contratanteCidade && `, ${data.contratanteCidade}`}
            {data.contratanteEstado && `/${data.contratanteEstado}`}.
          </Text>
        </View>

        <View style={styles.parteContainer}>
          <Text style={styles.parteTitle}>CONTRATADO:</Text>
          <Text style={styles.parteInfo}>
            <Text style={styles.textBold}>{data.contratadoNome}</Text>,{' '}
            inscrita no CNPJ sob nº{' '}
            <Text style={styles.textBold}>{formatarCpfCnpj(data.contratadoCnpj)}</Text>
            {data.contratadoEndereco && `, com sede em ${data.contratadoEndereco}`}
            {data.contratadoCidade && `, ${data.contratadoCidade}`}
            {data.contratadoEstado && `/${data.contratadoEstado}`}.
          </Text>
        </View>

        {/* Objeto */}
        <View style={styles.objetoContainer}>
          <Text style={styles.objetoTitle}>OBJETO DO CONTRATO</Text>
          <Text style={styles.objetoText}>{data.objetoContrato}</Text>
        </View>

        {/* Valor */}
        <View style={styles.valorContainer}>
          <View style={styles.valorRow}>
            <Text style={styles.valorLabel}>VALOR DO CONTRATO</Text>
            <Text style={styles.valorValue}>{formatarMoeda(data.valorContrato)}</Text>
          </View>
        </View>

        {/* Cláusulas */}
        {clausulasFinais.map((clausula) => (
          <View key={clausula.numero} style={styles.clausulaContainer}>
            <Text style={styles.clausulaHeader}>
              CLÁUSULA {clausula.numero}ª - {clausula.titulo}
            </Text>
            <Text style={styles.clausulaTexto}>{clausula.texto}</Text>
          </View>
        ))}

        {/* Data e Local */}
        <View style={{ marginTop: spacing.xl, marginBottom: spacing.xl }}>
          <Text style={styles.text}>
            {data.contratadoCidade || '[Cidade]'},{' '}
            {formatarData(data.dataEmissao)}.
          </Text>
        </View>

        {/* Assinaturas */}
        <View style={styles.assinaturasContainer}>
          <View style={styles.assinaturaBloco}>
            <View style={styles.assinaturaLinha} />
            <Text style={styles.assinaturaNome}>{data.contratanteNome}</Text>
            <Text style={styles.assinaturaTipo}>CONTRATANTE</Text>
          </View>

          <View style={styles.assinaturaBloco}>
            <View style={styles.assinaturaLinha} />
            <Text style={styles.assinaturaNome}>{data.contratadoNome}</Text>
            <Text style={styles.assinaturaTipo}>CONTRATADO</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Contrato Nº {data.numeroContrato}</Text>
          <Text style={styles.footerText}>OS Nº {data.codigoOS}</Text>
          <Text style={styles.footerText}>Página 1</Text>
        </View>
      </Page>
    </Document>
  );
}
