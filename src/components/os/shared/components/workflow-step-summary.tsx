'use client';

import { cn } from '@/lib/utils';

/**
 * Tipo de formatação do valor
 */
export type SummaryFieldType = 'text' | 'date' | 'datetime' | 'currency' | 'boolean' | 'list' | 'files';

/**
 * Definição de um campo de resumo
 */
export interface SummaryField {
    label: string;
    value: string | number | boolean | null | undefined | any[];
    type?: SummaryFieldType;
    /** Se deve ocupar a linha inteira (largura total) */
    fullWidth?: boolean;
}

interface WorkflowStepSummaryProps {
    /** Lista de campos a exibir */
    fields: SummaryField[];
    /** Classes adicionais */
    className?: string;
    /** Número de colunas (padrão: 2) */
    columns?: 1 | 2 | 3;
}

/**
 * Formatar valor baseado no tipo
 */
function formatValue(value: any, type?: SummaryFieldType): string {
    if (value === undefined || value === null || value === '') return '-';

    switch (type) {
        case 'currency':
            const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.,]/g, '').replace(',', '.'));
            if (isNaN(numValue)) return '-';
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(numValue);

        case 'date':
            try {
                const date = new Date(value);
                if (isNaN(date.getTime())) return String(value);
                return date.toLocaleDateString('pt-BR');
            } catch {
                return String(value);
            }

        case 'datetime':
            try {
                const datetime = new Date(value);
                if (isNaN(datetime.getTime())) return String(value);
                return datetime.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            } catch {
                return String(value);
            }

        case 'boolean':
            return value ? 'Sim' : 'Não';

        case 'list':
            if (!Array.isArray(value)) return String(value);
            if (value.length === 0) return '-';
            return value.join(', ');

        case 'files':
            if (!Array.isArray(value)) return '-';
            if (value.length === 0) return '-';
            return `📎 ${value.length} arquivo(s)`;

        default:
            return String(value);
    }
}

/**
 * Componente para exibir resumo de uma etapa em grid
 * 
 * @example
 * ```tsx
 * <WorkflowStepSummary
 *   fields={[
 *     { label: 'Cliente', value: data.nome },
 *     { label: 'CPF/CNPJ', value: data.cpfCnpj },
 *     { label: 'Valor', value: data.valor, type: 'currency' },
 *     { label: 'Data', value: data.data, type: 'date' },
 *     { label: 'Observações', value: data.obs, fullWidth: true },
 *   ]}
 *   columns={2}
 * />
 * ```
 */
export function WorkflowStepSummary({
    fields,
    className,
    columns = 2,
}: WorkflowStepSummaryProps) {
    const gridClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    }[columns];

    return (
        <div className={cn(`grid ${gridClass} gap-4 text-sm`, className)}>
            {fields.map((field, idx) => (
                <div
                    key={idx}
                    className={cn(
                        'space-y-1',
                        field.fullWidth && 'col-span-full'
                    )}
                >
                    <span className="text-muted-foreground text-xs font-medium">
                        {field.label}
                    </span>
                    <p className="font-medium text-foreground">
                        {formatValue(field.value, field.type)}
                    </p>
                </div>
            ))}
        </div>
    );
}

// ============================================
// CONFIGURAÇÕES DE RESUMO POR TIPO DE OS
// ============================================

/**
 * Configuração de resumo para OS 07 (Termo de Comunicação de Reforma)
 */
export const OS_07_SUMMARY_CONFIG: Record<number, (data: any) => SummaryField[]> = {
    1: (data) => [
        { label: 'Nome/Razão Social', value: data?.identificacao?.nome || data?.nome },
        { label: 'CPF/CNPJ', value: data?.identificacao?.cpfCnpj || data?.cpfCnpj },
        { label: 'Email', value: data?.identificacao?.email || data?.email },
        { label: 'Telefone', value: data?.identificacao?.telefone || data?.telefone },
        { label: 'Tipo de Edificação', value: data?.edificacao?.tipoEdificacao },
        { label: 'Qtd. Blocos', value: data?.edificacao?.qtdBlocos },
        { label: 'Qtd. Unidades', value: data?.edificacao?.qtdUnidades },
        { label: 'Endereço', value: data?.endereco ? `${data.endereco.logradouro}, ${data.endereco.numero}` : '-' },
        { label: 'Cidade/UF', value: data?.endereco ? `${data.endereco.cidade}/${data.endereco.uf}` : '-' },
    ],
    2: (data) => [
        { label: 'OS Criada', value: data?.osId ? 'Sim' : 'Não', type: 'boolean' },
        { label: 'Link do Formulário', value: data?.linkFormulario, fullWidth: true },
    ],
    3: (data) => [
        { label: 'Formulário Recebido', value: data?.formularioRecebido, type: 'boolean' },
        { label: 'Data Recebimento', value: data?.dataRecebimento, type: 'datetime' },
    ],
};

/**
 * Configuração de resumo para OS 08 (Visita Técnica / Parecer)
 */
export const OS_08_SUMMARY_CONFIG: Record<number, (data: any) => SummaryField[]> = {
    1: (data) => [
        { label: 'Nome/Razão Social', value: data?.identificacao?.nome || data?.nome },
        { label: 'CPF/CNPJ', value: data?.identificacao?.cpfCnpj || data?.cpfCnpj },
        { label: 'Email', value: data?.identificacao?.email || data?.email },
        { label: 'Telefone', value: data?.identificacao?.telefone || data?.telefone },
        { label: 'Tipo de Edificação', value: data?.edificacao?.tipoEdificacao },
        { label: 'Qtd. Blocos', value: data?.edificacao?.qtdBlocos },
        { label: 'Qtd. Unidades', value: data?.edificacao?.qtdUnidades },
    ],
    2: (data) => [
        { label: 'Tipo de Área', value: data?.tipoArea },
        { label: 'Unidades a Vistoriar', value: data?.unidadesVistoriar },
        { label: 'Contato Unidades', value: data?.contatoUnidades },
        { label: 'Tipo de Documento', value: data?.tipoDocumento },
        { label: 'Área Vistoriada', value: data?.areaVistoriada },
        { label: 'Tempo da Situação', value: data?.tempoSituacao },
        { label: 'Primeira Visita', value: data?.primeiraVisita },
        { label: 'Detalhes', value: data?.detalhesSolicitacao, fullWidth: true },
        { label: 'Arquivos', value: data?.arquivos, type: 'files' },
    ],
    3: (data) => [
        { label: 'Data Agendamento', value: data?.dataAgendamento, type: 'datetime' },
        { label: 'ID Agendamento', value: data?.agendamentoId },
    ],
    4: (data) => [
        { label: 'Visita Realizada', value: data?.visitaRealizada, type: 'boolean' },
        { label: 'Data Realização', value: data?.dataRealizacao, type: 'datetime' },
    ],
    5: (data) => [
        { label: 'Pontuação Engenheiro', value: data?.pontuacaoEngenheiro },
        { label: 'Pontuação Morador', value: data?.pontuacaoMorador },
        { label: 'Tipo Documento', value: data?.tipoDocumento },
        { label: 'Área Vistoriada', value: data?.areaVistoriada },
        { label: 'Manifestação Patológica', value: data?.manifestacaoPatologica },
        { label: 'Gravidade', value: data?.gravidade },
        { label: 'Origem NBR', value: data?.origemNBR },
        { label: 'Resultado', value: data?.resultadoVisita },
        { label: 'Recomendações', value: data?.recomendacoesPrevias, fullWidth: true },
        { label: 'Observações', value: data?.observacoesGerais, fullWidth: true },
        { label: 'Justificativa', value: data?.justificativa, fullWidth: true },
        { label: 'Fotos', value: data?.fotosLocal, type: 'files' },
    ],
    6: (data) => [
        { label: 'Documento Gerado', value: data?.documentoGerado, type: 'boolean' },
        { label: 'URL do Documento', value: data?.documentoUrl },
    ],
    7: (data) => [
        { label: 'Documento Enviado', value: data?.documentoEnviado, type: 'boolean' },
        { label: 'Data Envio', value: data?.dataEnvio, type: 'datetime' },
    ],
};
