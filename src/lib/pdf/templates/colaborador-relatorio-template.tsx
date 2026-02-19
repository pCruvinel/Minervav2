// @ts-ignore - React is needed for JSX in @react-pdf/renderer templates
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Colaborador } from '@/types/colaborador';
import { FATOR_ENCARGOS_CLT } from '@/lib/constants/colaboradores';
import { getColaboradorStatus } from '@/lib/utils/colaborador-status';

// ============================================================
// TYPES
// ============================================================

interface RegistroPresenca {
    id: string;
    data: string;
    status: 'OK' | 'ATRASADO' | 'FALTA';
    performance?: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM';
    minutos_atraso?: number;
    justificativa?: string;
}

interface ColaboradorRelatorioProps {
    colaborador: Colaborador;
    registros: RegistroPresenca[];
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#1a1a1a',
    },
    headerSection: {
        marginBottom: 24,
        borderBottom: '2px solid #2563eb',
        paddingBottom: 16,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 11,
        color: '#6b7280',
    },
    statusBadge: {
        fontSize: 9,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
        marginBottom: 10,
        marginTop: 20,
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: 6,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    label: {
        width: 140,
        color: '#6b7280',
        fontSize: 9,
    },
    value: {
        flex: 1,
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
    },
    kpiGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
        marginBottom: 8,
    },
    kpiCard: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 6,
        padding: 12,
        border: '1px solid #e5e7eb',
    },
    kpiLabel: {
        fontSize: 8,
        color: '#6b7280',
        marginBottom: 4,
    },
    kpiValue: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#9ca3af',
        borderTop: '1px solid #e5e7eb',
        paddingTop: 8,
    },
});

// ============================================================
// COMPONENT
// ============================================================

export function ColaboradorRelatorioTemplate({ colaborador, registros }: ColaboradorRelatorioProps) {
    const status = getColaboradorStatus(colaborador);
    const now = new Date();
    const dataGeracao = now.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    // Calcular KPIs
    const totalRegistros = registros.length;
    const presentes = registros.filter(r => r.status !== 'FALTA').length;
    const faltas = registros.filter(r => r.status === 'FALTA').length;
    const atrasos = registros.filter(r => r.status === 'ATRASADO').length;
    const taxaPresenca = totalRegistros > 0 ? ((presentes / totalRegistros) * 100).toFixed(1) : '0.0';

    // Financeiro
    const salarioBase = colaborador.salario_base || 0;
    const custoDia = colaborador.tipo_contratacao === 'CLT'
        ? salarioBase * FATOR_ENCARGOS_CLT / 22
        : (colaborador.custo_dia || 0);
    const custoMensal = colaborador.tipo_contratacao === 'CLT'
        ? salarioBase * FATOR_ENCARGOS_CLT
        : (colaborador.custo_dia || 0) * 22;

    const formatCurrency = (value: number) =>
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerSection}>
                    <Text style={styles.title}>
                        {colaborador.nome_completo || colaborador.nome}
                    </Text>
                    <Text style={styles.subtitle}>
                        {colaborador.funcao?.replace(/_/g, ' ') || 'Sem Função'} • {colaborador.setor || 'Sem Setor'}
                    </Text>
                    <View style={[styles.statusBadge, {
                        backgroundColor: status.type === 'ATIVO' ? '#dcfce7' :
                            status.type === 'INATIVO' ? '#fecaca' :
                                status.type === 'PENDENTE' ? '#fef08a' : '#fed7aa',
                        color: status.type === 'ATIVO' ? '#166534' :
                            status.type === 'INATIVO' ? '#991b1b' :
                                status.type === 'PENDENTE' ? '#854d0e' : '#9a3412',
                    }]}>
                        <Text>{status.label}</Text>
                    </View>
                </View>

                {/* Dados Cadastrais */}
                <Text style={styles.sectionTitle}>Dados Cadastrais</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>CPF</Text>
                    <Text style={styles.value}>{colaborador.cpf || '-'}</Text>
                    <Text style={styles.label}>Tipo Contratação</Text>
                    <Text style={styles.value}>{colaborador.tipo_contratacao || '-'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{colaborador.email_profissional || colaborador.email || '-'}</Text>
                    <Text style={styles.label}>Telefone</Text>
                    <Text style={styles.value}>{colaborador.telefone_profissional || colaborador.telefone || '-'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Data Admissão</Text>
                    <Text style={styles.value}>
                        {colaborador.data_admissao
                            ? new Date(colaborador.data_admissao as string).toLocaleDateString('pt-BR')
                            : '-'}
                    </Text>
                    <Text style={styles.label}>Setor</Text>
                    <Text style={styles.value}>{colaborador.setor || '-'}</Text>
                </View>

                {/* Resumo Financeiro */}
                <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
                <View style={styles.kpiGrid}>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>
                            {colaborador.tipo_contratacao === 'CLT' ? 'Salário Base' : 'Custo Dia'}
                        </Text>
                        <Text style={styles.kpiValue}>
                            {formatCurrency(colaborador.tipo_contratacao === 'CLT' ? salarioBase : (colaborador.custo_dia || 0))}
                        </Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Custo/Dia</Text>
                        <Text style={styles.kpiValue}>{formatCurrency(custoDia)}</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Custo Mensal Est.</Text>
                        <Text style={styles.kpiValue}>{formatCurrency(custoMensal)}</Text>
                    </View>
                </View>

                {/* KPIs Presença */}
                {totalRegistros > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Presença & Performance</Text>
                        <View style={styles.kpiGrid}>
                            <View style={styles.kpiCard}>
                                <Text style={styles.kpiLabel}>Taxa Presença</Text>
                                <Text style={styles.kpiValue}>{taxaPresenca}%</Text>
                            </View>
                            <View style={styles.kpiCard}>
                                <Text style={styles.kpiLabel}>Dias Trabalhados</Text>
                                <Text style={styles.kpiValue}>{presentes}</Text>
                            </View>
                            <View style={styles.kpiCard}>
                                <Text style={styles.kpiLabel}>Faltas</Text>
                                <Text style={[styles.kpiValue, { color: faltas > 0 ? '#dc2626' : '#111827' }]}>
                                    {faltas}
                                </Text>
                            </View>
                            <View style={styles.kpiCard}>
                                <Text style={styles.kpiLabel}>Atrasos</Text>
                                <Text style={[styles.kpiValue, { color: atrasos > 0 ? '#d97706' : '#111827' }]}>
                                    {atrasos}
                                </Text>
                            </View>
                        </View>
                    </>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    Relatório gerado em {dataGeracao} • Minerva ERP
                </Text>
            </Page>
        </Document>
    );
}
