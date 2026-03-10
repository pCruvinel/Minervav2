/**
 * Checklist Definitions — Pure Domain Data
 *
 * Centralizes all checklist item definitions for SPDA and SPCI inspections.
 * Separated from rendering logic to enable reuse across flat and dynamic forms.
 *
 * Domain rules:
 *   SPDA: Global sections (docs, risk, compatibility) + Per-Block sections (captação→conservação)
 *   SPCI: Global sections (docs, access, gas, materials, brigade, external)
 *         + Per-Block sections (emergency exits)
 *         + Per-Floor sections (extintores, sinalização, iluminação, hidrantes, alarme, sprinklers)
 */

// =====================================================
// SHARED TYPES
// =====================================================

export interface ChecklistItemDef {
  id: string;
  label: string;
  descricao?: string;
}

export interface ChecklistSectionDef {
  id: string;
  titulo: string;
  items: ChecklistItemDef[];
}

// =====================================================
// SPDA — SEÇÕES GLOBAIS (avaliadas uma vez para toda a edificação)
// =====================================================

export const SPDA_GLOBAL_SECTIONS: ChecklistSectionDef[] = [
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
    id: 'compatibilidade',
    titulo: '10. Compatibilidade Projeto × Execução',
    items: [
      { id: 'spda_comp_conforme', label: 'Sistema executado exatamente conforme o projeto aprovado' },
      { id: 'spda_comp_alteracoes', label: 'Nenhuma alteração sem atualização do projeto' },
    ],
  },
];

// =====================================================
// SPDA — SEÇÕES POR BLOCO (multiplicadas por bloco da edificação)
// =====================================================

export const SPDA_PER_BLOCK_SECTIONS: ChecklistSectionDef[] = [
  {
    id: 'captacao',
    titulo: '3. Sistema de Captação (NBR 5419-3)',
    items: [
      { id: 'cap_tipo', label: 'Tipo de sistema conforme projeto: Franklin, Gaiola de Faraday, Mastro, Captores naturais' },
      { id: 'cap_instalacao', label: 'Captores instalados corretamente' },
      { id: 'cap_espacamento', label: 'Altura e espaçamento compatíveis com o nível de proteção' },
      { id: 'cap_corrosao', label: 'Captores firmes e sem corrosão' },
      { id: 'cap_continuidade', label: 'Continuidade elétrica garantida' },
    ],
  },
  {
    id: 'condutores',
    titulo: '4. Condutores de Descida',
    items: [
      { id: 'con_quantidade', label: 'Quantidade de descidas conforme cálculo' },
      { id: 'con_distribuicao', label: 'Distribuição uniforme ao redor da edificação' },
      { id: 'con_continuos', label: 'Condutores contínuos (sem emendas indevidas)' },
      { id: 'con_fixacao', label: 'Fixação adequada à estrutura' },
      { id: 'con_protecao', label: 'Proteção mecânica nas áreas acessíveis' },
      { id: 'con_distancia', label: 'Distância segura de instalações elétricas e metálicas' },
      { id: 'con_identificacao', label: 'Identificação visível das descidas' },
    ],
  },
  {
    id: 'aterramento',
    titulo: '5. Sistema de Aterramento',
    items: [
      { id: 'ate_tipo', label: 'Tipo de aterramento conforme projeto: anel, malha, haste' },
      { id: 'ate_interligacao', label: 'Interligação entre descidas e aterramento' },
      { id: 'ate_bep', label: 'Barramento de equipotencialização principal (BEP)' },
      { id: 'ate_conexoes', label: 'Conexões firmes e protegidas contra corrosão' },
      { id: 'ate_caixas', label: 'Caixas de inspeção acessíveis' },
      { id: 'ate_medicao', label: 'Medição de resistência de aterramento: Valor compatível com projeto / Laudo com data, método e responsável técnico' },
    ],
  },
  {
    id: 'equipotencializacao',
    titulo: '6. Equipotencialização',
    items: [
      { id: 'equ_interligacao', label: 'Interligação de: Estruturas metálicas, Fachadas metálicas, Coberturas, Escadas metálicas, Guarda-corpos' },
      { id: 'equ_tensoes', label: 'Redução de tensões de passo e toque' },
      { id: 'equ_conformidade', label: 'Conformidade com NBR 5419-3' },
    ],
  },
  {
    id: 'dps',
    titulo: '7. Proteção Contra Surtos – DPS (NBR 5419-4)',
    items: [
      { id: 'dps_instalados', label: 'DPS instalados nos quadros elétricos' },
      { id: 'dps_classes', label: 'Classes corretas (I, II ou III)' },
      { id: 'dps_compatibilidade', label: 'Compatibilidade com o nível de proteção do SPDA' },
      { id: 'dps_aterrados', label: 'DPS aterrados corretamente' },
      { id: 'dps_identificacao', label: 'Identificação e acesso para manutenção' },
    ],
  },
  {
    id: 'continuidade',
    titulo: '8. Continuidade Elétrica do Sistema',
    items: [
      { id: 'cnt_ensaios', label: 'Ensaios de continuidade realizados' },
      { id: 'cnt_registro', label: 'Registro dos ensaios no laudo técnico' },
      { id: 'cnt_interrupcao', label: 'Nenhuma interrupção no sistema' },
      { id: 'cnt_integridade', label: 'Condutores e conexões visivelmente íntegros' },
    ],
  },
  {
    id: 'conservacao',
    titulo: '9. Conservação e Manutenção',
    items: [
      { id: 'man_corrosao', label: 'Sistema sem corrosão excessiva' },
      { id: 'man_fixacoes', label: 'Fixações íntegras' },
      { id: 'man_captores', label: 'Captores não removidos ou danificados' },
      { id: 'man_improvisacoes', label: 'Ausência de improvisações' },
      { id: 'man_plano', label: 'Plano de manutenção periódica' },
      { id: 'man_ultima_inspecao', label: 'Última inspeção dentro do prazo recomendado' },
    ],
  },
];

// =====================================================
// SPCI — SEÇÕES GLOBAIS (avaliadas uma vez para toda a edificação)
// =====================================================

export const SPCI_GLOBAL_SECTIONS: ChecklistSectionDef[] = [
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
    id: 'acesso_viaturas',
    titulo: '8. Acessos para Viaturas do Corpo de Bombeiros',
    items: [
      { id: 'spci_via_desobstruidas', label: 'Vias desobstruídas' },
      { id: 'spci_via_endereco', label: 'Identificação do endereço visível' },
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
// SPCI — SEÇÃO POR BLOCO (multiplicada por bloco)
// =====================================================

export const SPCI_PER_BLOCK_SECTIONS: ChecklistSectionDef[] = [
  {
    id: 'saidas',
    titulo: '5. Saídas de Emergência (NBR 9077)',
    items: [
      { id: 'sai_quantidade', label: 'Quantidade compatível com ocupação' },
      { id: 'sai_largura', label: 'Largura mínima das rotas' },
      { id: 'sai_portas', label: 'Portas abrindo no sentido da fuga' },
      { id: 'sai_barras', label: 'Barras antipânico' },
      { id: 'sai_obstaculo', label: 'Rotas livres de obstáculos' },
      { id: 'sai_corrimaos', label: 'Corrimãos contínuos' },
      { id: 'sai_guardacorpo', label: 'Guarda-corpo contínuo' },
    ],
  },
];

// =====================================================
// SPCI — SEÇÕES POR PAVIMENTO (multiplicadas por pavimento dentro de cada bloco)
// =====================================================

export const SPCI_PER_FLOOR_SECTIONS: ChecklistSectionDef[] = [
  {
    id: 'extintores',
    titulo: '2. Extintores de Incêndio (NBR 12693)',
    items: [
      { id: 'ext_quantidade', label: 'Quantidade adequada conforme área e risco' },
      { id: 'ext_tipos', label: 'Tipos corretos (Água, Pó Químico, CO₂, etc.)' },
      { id: 'ext_carga', label: 'Carga válida (dentro do prazo)' },
      { id: 'ext_inmetro', label: 'Selo do INMETRO' },
      { id: 'ext_pressao', label: 'Pressão no manômetro (faixa verde)' },
      { id: 'ext_lacre', label: 'Lacre intacto' },
      { id: 'ext_altura', label: 'Altura e sinalização corretas' },
      { id: 'ext_acesso', label: 'Acesso desobstruído' },
    ],
  },
  {
    id: 'sinalizacao',
    titulo: '3. Sinalização de Emergência (NBR 13434)',
    items: [
      { id: 'sin_placas', label: 'Placas fotoluminescentes' },
      { id: 'sin_rotas_corredor', label: 'Indicação de Rotas de fuga, Saídas de emergência, Extintores, Hidrantes, Alarmes - no corredor' },
      { id: 'sin_rotas_escada', label: 'Indicação de Rotas de fuga - na escada' },
      { id: 'sin_rotas_elevador', label: 'Indicação de Rotas de fuga - no elevador' },
      { id: 'sin_rotas_saida', label: 'Indicação de Rotas de fuga - na saída principal' },
      { id: 'sin_altura', label: 'Altura e posicionamento corretos / Em bom estado de conservação' },
    ],
  },
  {
    id: 'iluminacao',
    titulo: '4. Iluminação de Emergência (NBR 10898)',
    items: [
      { id: 'ilu_corredor', label: 'Funcionamento automático na falta de energia - No corredor' },
      { id: 'ilu_escada', label: 'Funcionamento automático na falta de energia - Na escada' },
      { id: 'ilu_rotas', label: 'Iluminação suficiente nas rotas de fuga' },
      { id: 'ilu_autonomia', label: 'Autonomia mínima exigida (geralmente 1 hora)' },
      { id: 'ilu_luminarias', label: 'Luminárias funcionando' },
      { id: 'ilu_baterias', label: 'Baterias em bom estado' },
    ],
  },
  {
    id: 'hidrantes',
    titulo: '6. Hidrantes e Mangotinhos (NBR 13714)',
    items: [
      { id: 'hid_instalacao', label: 'Hidrantes instalados conforme projeto' },
      { id: 'hid_mangueiras', label: 'Mangueiras em bom estado e dentro do prazo' },
      { id: 'hid_esguichos', label: 'Esguichos adequados' },
      { id: 'hid_registro', label: 'Registro funcionando' },
      { id: 'hid_abrigo', label: 'Abrigo sinalizado e desobstruído' },
      { id: 'hid_pressao', label: 'Teste de pressão e vazão (Teste Hidrostático)' },
      { id: 'hid_storz_chave', label: 'Chave Storz' },
      { id: 'hid_storz_adaptador', label: 'Adaptador Storz' },
      { id: 'hid_storz_tampa', label: 'Tampa Storz' },
      { id: 'hid_tubulacao', label: 'Tubulação em vermelho' },
      { id: 'hid_sinalizacao_piso', label: 'Sinalização de Piso' },
      { id: 'hid_deteccao_fumaca', label: 'Detecção de fumaça/calor' },
    ],
  },
  {
    id: 'alarme',
    titulo: '7. Sistema de Alarme de Incêndio (NBR 17240)',
    items: [
      { id: 'ala_acionadores', label: 'Acionadores manuais instalados' },
      { id: 'ala_sonoro', label: 'Sinal sonoro audível em toda a edificação' },
      { id: 'ala_central', label: 'Central de alarme funcionando' },
      { id: 'ala_detectores', label: 'Detectores (fumaça, térmico, chama) conforme o caso' },
      { id: 'ala_setores', label: 'Identificação correta dos setores' },
    ],
  },
  {
    id: 'sprinklers',
    titulo: '9. Chuveiros Automáticos – Sprinklers (NBR 10897)',
    items: [
      { id: 'spr_bicos', label: 'Bicos desobstruídos' },
      { id: 'spr_cobertura', label: 'Cobertura adequada' },
      { id: 'spr_valvulas', label: 'Válvulas de controle acessíveis' },
      { id: 'spr_bomba', label: 'Bomba de incêndio funcionando' },
      { id: 'spr_testes', label: 'Testes periódicos realizados' },
    ],
  },
];

// =====================================================
// HELPERS
// =====================================================

/** Generates a block label like "Bloco A", "Bloco B", etc. */
export function getBlocoLabel(index: number): string {
  const letter = String.fromCharCode(65 + index); // A=65
  return `Bloco ${letter}`;
}

/** Generates a floor label like "Pavimento 1", "Pavimento 2", etc. */
export function getPavimentoLabel(index: number): string {
  return `Pavimento ${index + 1}`;
}
