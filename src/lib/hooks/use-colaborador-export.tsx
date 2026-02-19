import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Colaborador } from '@/types/colaborador';
import { ColaboradorRelatorioTemplate } from '@/lib/pdf/templates/colaborador-relatorio-template';

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

interface UseColaboradorExportReturn {
    exporting: boolean;
    exportarPDF: (colaborador: Colaborador, registros?: RegistroPresenca[]) => Promise<void>;
    exportarCSV: (colaborador: Colaborador, registros: RegistroPresenca[]) => Promise<void>;
}

// ============================================================
// HOOK
// ============================================================

export function useColaboradorExport(): UseColaboradorExportReturn {
    const [exporting, setExporting] = useState(false);

    /**
     * Exporta relatório executivo em PDF usando @react-pdf/renderer
     */
    const exportarPDF = async (colaborador: Colaborador, registros: RegistroPresenca[] = []) => {
        try {
            setExporting(true);
            toast.loading('Gerando PDF...', { id: 'export-pdf' });

            const blob = await pdf(
                <ColaboradorRelatorioTemplate
                    colaborador={colaborador}
                    registros={registros}
                />
            ).toBlob();

            if (!blob) throw new Error('Falha ao gerar PDF');

            // Download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const nomeArquivo = (colaborador.nome_completo || colaborador.nome || 'colaborador')
                .replace(/\s+/g, '_')
                .toLowerCase();
            link.download = `relatorio_${nomeArquivo}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success('PDF exportado com sucesso!', { id: 'export-pdf' });
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            toast.error('Erro ao exportar PDF', { id: 'export-pdf' });
        } finally {
            setExporting(false);
        }
    };

    /**
     * Exporta dados analíticos em CSV (compatível Excel)
     */
    const exportarCSV = async (colaborador: Colaborador, registros: RegistroPresenca[]) => {
        try {
            setExporting(true);

            const nomeColaborador = colaborador.nome_completo || colaborador.nome || 'Sem nome';

            // Headers
            const headers = [
                'Colaborador',
                'Data',
                'Dia da Semana',
                'Status',
                'Min. Atraso',
                'Justificativa',
                'Performance',
            ];

            // Rows
            const rows = registros.map(reg => {
                const data = new Date(reg.data + 'T00:00:00');
                return [
                    nomeColaborador,
                    format(data, 'dd/MM/yyyy'),
                    format(data, 'EEEE', { locale: ptBR }),
                    reg.status,
                    reg.minutos_atraso?.toString() || '0',
                    reg.justificativa || '',
                    reg.performance || '',
                ];
            });

            // Build CSV with BOM for Excel UTF-8 compatibility
            const csv = [
                headers.join(';'),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(';')),
            ].join('\n');

            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            const nomeArquivo = nomeColaborador.replace(/\s+/g, '_').toLowerCase();
            link.download = `presenca_${nomeArquivo}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success('CSV exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            toast.error('Erro ao exportar CSV');
        } finally {
            setExporting(false);
        }
    };

    return { exporting, exportarPDF, exportarCSV };
}
