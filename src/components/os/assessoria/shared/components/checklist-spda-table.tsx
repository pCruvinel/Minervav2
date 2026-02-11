/**
 * Checklist de Inspeção SPDA - Formato Tabela
 * 
 * Sistema de Proteção contra Descargas Atmosféricas
 * Baseado na NBR 5419:2015 (Partes 1 a 4)
 * 
 * 57 itens em 10 blocos.
 * Compartilhado entre OS-08 e OS-11.
 */

import { useMemo, useCallback } from 'react';
import {
    ChecklistBlocoTable,
    type ChecklistBlocoDefinition,
    type ChecklistItemData,
    type ChecklistRecebimentoData,
} from './checklist-recebimento-table';

// =====================================================
// ESTRUTURA DO CHECKLIST SPDA (10 blocos, 57 itens)
// =====================================================

const CHECKLIST_SPDA_BLOCOS: ChecklistBlocoDefinition[] = [
    {
        id: 'documentacao_spda',
        titulo: '1. Documentação Prévia Geral',
        items: [
            { id: 'spda_doc_projeto', label: 'Projeto de SPDA conforme NBR 5419:2015 aprovado pelo Corpo de Bombeiros' },
            { id: 'spda_doc_art', label: 'ART do responsável técnico' },
            { id: 'spda_doc_certificados', label: 'Certificados de conformidade dos sistemas instalados' },
            { id: 'spda_doc_plano', label: 'Plano de manutenção do SPDA' },
            { id: 'spda_doc_memorial', label: 'Memorial de cálculo do SPDA (análise de risco – NBR 5419-2)' },
            { id: 'spda_doc_planta', label: 'Planta de localização dos captores, descidas e aterramento' },
            { id: 'spda_doc_relatorio', label: 'Relatório de inspeção e medição ôhmica' },
            { id: 'spda_doc_avcb', label: 'Auto de Vistoria anterior' },
        ],
    },
    {
        id: 'analise_risco',
        titulo: '2. Análise de Risco (NBR 5419-2)',
        items: [
            { id: 'spda_ris_nivel', label: 'Avaliação do nível de proteção exigido (NP I, II, III ou IV)' },
            { id: 'spda_ris_compatibilidade', label: 'Compatibilidade do nível de proteção com: Tipo de ocupação, Altura da edificação, Área construída, Densidade de descargas atmosféricas da região' },
        ],
    },
    {
        id: 'captacao',
        titulo: '3. Sistema de Captação (NBR 5419-3)',
        items: [
            { id: 'spda_cap_tipo', label: 'Tipo de sistema conforme projeto: Franklin, Gaiola de Faraday, Mastro, Captores naturais' },
            { id: 'spda_cap_instalacao', label: 'Captores instalados corretamente' },
            { id: 'spda_cap_espacamento', label: 'Altura e espaçamento compatíveis com o nível de proteção' },
            { id: 'spda_cap_corrosao', label: 'Captores firmes e sem corrosão' },
            { id: 'spda_cap_continuidade', label: 'Continuidade elétrica garantida' },
        ],
    },
    {
        id: 'condutores',
        titulo: '4. Condutores de Descida',
        items: [
            { id: 'spda_con_quantidade', label: 'Quantidade de descidas conforme cálculo' },
            { id: 'spda_con_distribuicao', label: 'Distribuição uniforme ao redor da edificação' },
            { id: 'spda_con_continuos', label: 'Condutores contínuos (sem emendas indevidas)' },
            { id: 'spda_con_fixacao', label: 'Fixação adequada à estrutura' },
            { id: 'spda_con_protecao', label: 'Proteção mecânica nas áreas acessíveis' },
            { id: 'spda_con_distancia', label: 'Distância segura de instalações elétricas e metálicas' },
            { id: 'spda_con_identificacao', label: 'Identificação visível das descidas' },
        ],
    },
    {
        id: 'aterramento',
        titulo: '5. Sistema de Aterramento',
        items: [
            { id: 'spda_ate_tipo', label: 'Tipo de aterramento conforme projeto: anel, malha, haste' },
            { id: 'spda_ate_interligacao', label: 'Interligação entre descidas e aterramento' },
            { id: 'spda_ate_bep', label: 'Barramento de equipotencialização principal (BEP)' },
            { id: 'spda_ate_conexoes', label: 'Conexões firmes e protegidas contra corrosão' },
            { id: 'spda_ate_caixas', label: 'Caixas de inspeção acessíveis' },
            { id: 'spda_ate_medicao', label: 'Medição de resistência de aterramento: Valor compatível com projeto / Laudo com data, método e responsável técnico' },
        ],
    },
    {
        id: 'equipotencializacao',
        titulo: '6. Equipotencialização',
        items: [
            { id: 'spda_equ_interligacao', label: 'Interligação de: Estruturas metálicas, Fachadas metálicas, Coberturas, Escadas metálicas, Guarda-corpos' },
            { id: 'spda_equ_tensoes', label: 'Redução de tensões de passo e toque' },
            { id: 'spda_equ_conformidade', label: 'Conformidade com NBR 5419-3' },
        ],
    },
    {
        id: 'dps',
        titulo: '7. Proteção Contra Surtos – DPS (NBR 5419-4)',
        items: [
            { id: 'spda_dps_instalados', label: 'DPS instalados nos quadros elétricos' },
            { id: 'spda_dps_classes', label: 'Classes corretas (I, II ou III)' },
            { id: 'spda_dps_compatibilidade', label: 'Compatibilidade com o nível de proteção do SPDA' },
            { id: 'spda_dps_aterrados', label: 'DPS aterrados corretamente' },
            { id: 'spda_dps_identificacao', label: 'Identificação e acesso para manutenção' },
        ],
    },
    {
        id: 'continuidade',
        titulo: '8. Continuidade Elétrica do Sistema',
        items: [
            { id: 'spda_cnt_ensaios', label: 'Ensaios de continuidade realizados' },
            { id: 'spda_cnt_registro', label: 'Registro dos ensaios no laudo técnico' },
            { id: 'spda_cnt_interrupcao', label: 'Nenhuma interrupção no sistema' },
            { id: 'spda_cnt_integridade', label: 'Condutores e conexões visivelmente íntegros' },
        ],
    },
    {
        id: 'conservacao',
        titulo: '9. Conservação e Manutenção',
        items: [
            { id: 'spda_man_corrosao', label: 'Sistema sem corrosão excessiva' },
            { id: 'spda_man_fixacoes', label: 'Fixações íntegras' },
            { id: 'spda_man_captores', label: 'Captores não removidos ou danificados' },
            { id: 'spda_man_improvisacoes', label: 'Ausência de improvisações' },
            { id: 'spda_man_plano', label: 'Plano de manutenção periódica' },
            { id: 'spda_man_ultima_inspecao', label: 'Última inspeção dentro do prazo recomendado' },
        ],
    },
    {
        id: 'compatibilidade',
        titulo: '10. Compatibilidade Projeto × Execução',
        items: [
            { id: 'spda_comp_conforme', label: 'Sistema executado exatamente conforme o projeto aprovado' },
            { id: 'spda_comp_alteracoes', label: 'Nenhuma alteração sem atualização do projeto' },
        ],
    },
];

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

interface ChecklistSPDATableProps {
    data: ChecklistRecebimentoData;
    onChange: (data: ChecklistRecebimentoData) => void;
    readOnly?: boolean;
    osId?: string;
}

export function ChecklistSPDATable({ data, onChange, readOnly, osId }: ChecklistSPDATableProps) {
    const getItemData = useCallback((itemId: string): ChecklistItemData => {
        return data.items[itemId] || {
            id: itemId,
            status: '',
            observacao: '',
            fotos: [],
        };
    }, [data.items]);

    const handleItemChange = useCallback((itemId: string, itemData: ChecklistItemData) => {
        onChange({
            ...data,
            items: {
                ...data.items,
                [itemId]: itemData,
            },
        });
    }, [data, onChange]);

    // Estatísticas globais
    const globalStats = useMemo(() => {
        let total = 0;
        let conformes = 0;
        let naoConformes = 0;

        CHECKLIST_SPDA_BLOCOS.forEach(bloco => {
            bloco.items.forEach(item => {
                total++;
                const itemData = getItemData(item.id);
                if (itemData.status === 'C') conformes++;
                if (itemData.status === 'NC') naoConformes++;
            });
        });

        return { total, conformes, naoConformes };
    }, [data.items, getItemData]);

    return (
        <div className="space-y-4">
            {/* Header com estatísticas globais */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h3 className="font-semibold mb-1 text-amber-800 dark:text-amber-200">
                    Checklist de Inspeção SPDA
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                    Sistema de Proteção contra Descargas Atmosféricas — NBR 5419:2015 (Partes 1 a 4)
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-success" />
                        <span>Conformes: <strong>{globalStats.conformes}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <span>Não Conformes: <strong>{globalStats.naoConformes}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                        <span>Total: <strong>{globalStats.total}</strong> itens</span>
                    </div>
                </div>
            </div>

            {/* Blocos de tabelas */}
            <div className="space-y-3">
                {CHECKLIST_SPDA_BLOCOS.map((bloco) => (
                    <ChecklistBlocoTable
                        key={bloco.id}
                        bloco={bloco}
                        getItemData={getItemData}
                        onItemChange={handleItemChange}
                        readOnly={readOnly}
                        osId={osId}
                    />
                ))}
            </div>
        </div>
    );
}

// Re-export para uso externo
export { CHECKLIST_SPDA_BLOCOS };
