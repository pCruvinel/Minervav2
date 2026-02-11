/**
 * Checklist de Inspeção SPCI - Formato Tabela
 * 
 * Sistema de Proteção e Combate a Incêndio
 * Baseado na NBR 12693, NBR 13434, NBR 10898, NBR 9077,
 * NBR 13714, NBR 17240, NBR 10897, NBR 14276
 * 
 * 86 itens em 12 blocos.
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
// ESTRUTURA DO CHECKLIST SPCI (12 blocos, 86 itens)
// =====================================================

const CHECKLIST_SPCI_BLOCOS: ChecklistBlocoDefinition[] = [
    {
        id: 'documentacao_spci',
        titulo: '1. Documentação Prévia Geral',
        items: [
            { id: 'spci_doc_projeto', label: 'Projeto Técnico de Segurança Contra Incêndio aprovado pelo Corpo de Bombeiros' },
            { id: 'spci_doc_art', label: 'ART do responsável técnico' },
            { id: 'spci_doc_certificados', label: 'Certificados de conformidade dos sistemas instalados' },
            { id: 'spci_doc_plano_manutencao', label: 'Plano de manutenção dos sistemas de combate a incêndio' },
            { id: 'spci_doc_avcb', label: 'Auto de Vistoria anterior' },
        ],
    },
    {
        id: 'extintores',
        titulo: '2. Extintores de Incêndio (NBR 12693)',
        items: [
            { id: 'spci_ext_quantidade', label: 'Quantidade adequada conforme área e risco' },
            { id: 'spci_ext_tipos', label: 'Tipos corretos (Água, Pó Químico, CO₂, etc.)' },
            { id: 'spci_ext_carga', label: 'Carga válida (dentro do prazo)' },
            { id: 'spci_ext_inmetro', label: 'Selo do INMETRO' },
            { id: 'spci_ext_pressao', label: 'Pressão no manômetro (faixa verde)' },
            { id: 'spci_ext_lacre', label: 'Lacre intacto' },
            { id: 'spci_ext_altura', label: 'Altura e sinalização corretas' },
            { id: 'spci_ext_acesso', label: 'Acesso desobstruído' },
        ],
    },
    {
        id: 'sinalizacao',
        titulo: '3. Sinalização de Emergência (NBR 13434)',
        items: [
            { id: 'spci_sin_placas', label: 'Placas fotoluminescentes' },
            { id: 'spci_sin_rotas_corredor', label: 'Indicação de Rotas de fuga, Saídas de emergência, Extintores, Hidrantes, Alarmes - no corredor' },
            { id: 'spci_sin_rotas_escada', label: 'Indicação de Rotas de fuga - na escada' },
            { id: 'spci_sin_rotas_elevador', label: 'Indicação de Rotas de fuga - no elevador' },
            { id: 'spci_sin_rotas_saida', label: 'Indicação de Rotas de fuga - na saída principal' },
            { id: 'spci_sin_altura', label: 'Altura e posicionamento corretos / Em bom estado de conservação' },
        ],
    },
    {
        id: 'iluminacao',
        titulo: '4. Iluminação de Emergência (NBR 10898)',
        items: [
            { id: 'spci_ilu_corredor', label: 'Funcionamento automático na falta de energia - No corredor' },
            { id: 'spci_ilu_escada', label: 'Funcionamento automático na falta de energia - Na escada' },
            { id: 'spci_ilu_rotas', label: 'Iluminação suficiente nas rotas de fuga' },
            { id: 'spci_ilu_autonomia', label: 'Autonomia mínima exigida (geralmente 1 hora)' },
            { id: 'spci_ilu_luminarias', label: 'Luminárias funcionando' },
            { id: 'spci_ilu_baterias', label: 'Baterias em bom estado' },
        ],
    },
    {
        id: 'saidas',
        titulo: '5. Saídas de Emergência (NBR 9077)',
        items: [
            { id: 'spci_sai_quantidade', label: 'Quantidade compatível com ocupação' },
            { id: 'spci_sai_largura', label: 'Largura mínima das rotas' },
            { id: 'spci_sai_portas', label: 'Portas abrindo no sentido da fuga' },
            { id: 'spci_sai_barras', label: 'Barras antipânico' },
            { id: 'spci_sai_obstaculo', label: 'Rotas livres de obstáculos' },
            { id: 'spci_sai_corrimaos', label: 'Corrimãos contínuos' },
            { id: 'spci_sai_guardacorpo', label: 'Guarda-corpo contínuo' },
        ],
    },
    {
        id: 'hidrantes',
        titulo: '6. Hidrantes e Mangotinhos (NBR 13714)',
        items: [
            { id: 'spci_hid_instalacao', label: 'Hidrantes instalados conforme projeto' },
            { id: 'spci_hid_mangueiras', label: 'Mangueiras em bom estado e dentro do prazo' },
            { id: 'spci_hid_esguichos', label: 'Esguichos adequados' },
            { id: 'spci_hid_registro', label: 'Registro funcionando' },
            { id: 'spci_hid_abrigo', label: 'Abrigo sinalizado e desobstruído' },
            { id: 'spci_hid_pressao', label: 'Teste de pressão e vazão (Teste Hidrostático)' },
            { id: 'spci_hid_storz_chave', label: 'Chave Storz' },
            { id: 'spci_hid_storz_adaptador', label: 'Adaptador Storz' },
            { id: 'spci_hid_storz_tampa', label: 'Tampa Storz' },
            { id: 'spci_hid_tubulacao', label: 'Tubulação em vermelho' },
            { id: 'spci_hid_sinalizacao_piso', label: 'Sinalização de Piso' },
            { id: 'spci_hid_deteccao_fumaca', label: 'Detecção de fumaça/calor' },
        ],
    },
    {
        id: 'alarme',
        titulo: '7. Sistema de Alarme de Incêndio (NBR 17240)',
        items: [
            { id: 'spci_ala_acionadores', label: 'Acionadores manuais instalados' },
            { id: 'spci_ala_sonoro', label: 'Sinal sonoro audível em toda a edificação' },
            { id: 'spci_ala_central', label: 'Central de alarme funcionando' },
            { id: 'spci_ala_detectores', label: 'Detectores (fumaça, térmico, chama) conforme o caso' },
            { id: 'spci_ala_setores', label: 'Identificação correta dos setores' },
        ],
    },
    {
        id: 'acesso_viaturas',
        titulo: '8. Acessos para Viaturas do Corpo de Bombeiros',
        items: [
            { id: 'spci_via_desobstruidas', label: 'Vias desobstruídas' },
            { id: 'spci_via_endereco', label: 'Identificação do endereço visível' },
        ],
    },
    {
        id: 'sprinklers',
        titulo: '9. Chuveiros Automáticos – Sprinklers (NBR 10897)',
        items: [
            { id: 'spci_spr_bicos', label: 'Bicos desobstruídos' },
            { id: 'spci_spr_cobertura', label: 'Cobertura adequada' },
            { id: 'spci_spr_valvulas', label: 'Válvulas de controle acessíveis' },
            { id: 'spci_spr_bomba', label: 'Bomba de incêndio funcionando' },
            { id: 'spci_spr_testes', label: 'Testes periódicos realizados' },
        ],
    },
    {
        id: 'gas',
        titulo: '10. Gás Combustível (GLP ou GN)',
        items: [
            { id: 'spci_gas_central', label: 'Central de gás conforme normas' },
            { id: 'spci_gas_ventilacao', label: 'Ventilação permanente' },
            { id: 'spci_gas_distancias', label: 'Distâncias de segurança respeitadas' },
            { id: 'spci_gas_tubulacoes', label: 'Tubulações identificadas' },
            { id: 'spci_gas_valvulas', label: 'Válvulas de bloqueio acessíveis' },
            { id: 'spci_gas_estanqueidade', label: 'Laudo de estanqueidade' },
        ],
    },
    {
        id: 'materiais',
        titulo: '11. Controle de Materiais de Acabamento e Revestimento',
        items: [
            { id: 'spci_mat_classificacao', label: 'Materiais com classificação de reação ao fogo' },
            { id: 'spci_mat_proibidos', label: 'Ausência de materiais proibidos' },
        ],
    },
    {
        id: 'brigada',
        titulo: '12. Brigada de Incêndio (NBR 14276)',
        items: [
            { id: 'spci_bri_treinados', label: 'Brigadistas treinados' },
            { id: 'spci_bri_certificados', label: 'Certificados válidos' },
            { id: 'spci_bri_quantidade', label: 'Quantidade compatível com o risco' },
            { id: 'spci_bri_simulados', label: 'Simulados realizados' },
        ],
    },
    {
        id: 'area_externa',
        titulo: '13. Área Externa',
        items: [
            { id: 'spci_ext_extintor_bombas', label: 'Extintor na Casa de Bombas' },
            { id: 'spci_ext_placa_bombas', label: 'Placa de sinalização na Casa de Bombas' },
            { id: 'spci_ext_iluminacao_bombas', label: 'Iluminação de emergência na Casa de Bombas' },
            { id: 'spci_ext_sinalizacao_piso_bombas', label: 'Sinalização de piso na Casa de Bombas' },
            { id: 'spci_ext_hidrante_recalque', label: 'Hidrantes externos - de recalque' },
            { id: 'spci_ext_hidrante_coluna', label: 'Hidrantes externos - de coluna' },
        ],
    },
];

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

interface ChecklistSPCITableProps {
    data: ChecklistRecebimentoData;
    onChange: (data: ChecklistRecebimentoData) => void;
    readOnly?: boolean;
    osId?: string;
}

export function ChecklistSPCITable({ data, onChange, readOnly, osId }: ChecklistSPCITableProps) {
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

        CHECKLIST_SPCI_BLOCOS.forEach(bloco => {
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
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="font-semibold mb-1 text-red-800 dark:text-red-200">
                    Checklist de Inspeção SPCI
                </h3>
                <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                    Sistema de Proteção e Combate a Incêndio — NBR 12693, 13434, 10898, 9077, 13714, 17240, 10897, 14276
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
                {CHECKLIST_SPCI_BLOCOS.map((bloco) => (
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
export { CHECKLIST_SPCI_BLOCOS };
