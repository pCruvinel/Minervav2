/**
 * Checklist Definitions — Recebimento de Imóvel (Áreas Comuns)
 *
 * Itens de inspeção para recebimento de áreas comuns do condomínio.
 * Diferente do "Recebimento de Unidade Autônoma" (apartamento individual),
 * este checklist cobre fachadas, garagem, elevadores, áreas de lazer, etc.
 *
 * Estrutura: Flat (sem hierarquia bloco/pavimento).
 * Reutiliza ChecklistSectionDef da checklist-definitions.ts.
 */

import type { ChecklistSectionDef } from './checklist-definitions';

// =====================================================
// RECEBIMENTO DE IMÓVEL — SEÇÕES (8 seções, 35+ itens)
// =====================================================

export const RECEBIMENTO_IMOVEL_SECTIONS: ChecklistSectionDef[] = [
  {
    id: 'fachada',
    titulo: '1. Fachada e Áreas Externas',
    items: [
      { id: 'fac_revestimento', label: 'Revestimento externo íntegro (sem fissuras, descolamentos ou manchas)' },
      { id: 'fac_pintura', label: 'Pintura da fachada em bom estado' },
      { id: 'fac_impermeabilizacao', label: 'Impermeabilização das juntas de dilatação' },
      { id: 'fac_muros', label: 'Muros e gradis em bom estado' },
      { id: 'fac_calcadas', label: 'Calçadas e acessos nivelados e sem trincas' },
      { id: 'fac_paisagismo', label: 'Paisagismo conforme projeto' },
    ],
  },
  {
    id: 'hall_recepcao',
    titulo: '2. Hall e Recepção',
    items: [
      { id: 'hall_piso', label: 'Piso do hall em bom estado (sem trincas, desníveis)' },
      { id: 'hall_iluminacao', label: 'Iluminação funcional e conforme projeto' },
      { id: 'hall_portaria', label: 'Portaria e sistema de controle de acesso' },
      { id: 'hall_caixa_correio', label: 'Caixas de correio instaladas e identificadas' },
      { id: 'hall_interfone', label: 'Sistema de interfone/videoporteiro funcional' },
    ],
  },
  {
    id: 'elevadores',
    titulo: '3. Elevadores',
    items: [
      { id: 'elev_funcionamento', label: 'Elevadores funcionando corretamente' },
      { id: 'elev_nivelamento', label: 'Nivelamento com o piso do andar' },
      { id: 'elev_portas', label: 'Portas abrindo e fechando corretamente' },
      { id: 'elev_botoes', label: 'Botões e painéis funcionais' },
      { id: 'elev_iluminacao', label: 'Iluminação e ventilação da cabine' },
      { id: 'elev_certificado', label: 'Certificado de inspeção válido' },
    ],
  },
  {
    id: 'garagem',
    titulo: '4. Garagem e Estacionamento',
    items: [
      { id: 'gar_piso', label: 'Piso da garagem sem trincas ou desníveis' },
      { id: 'gar_demarcacao', label: 'Vagas demarcadas conforme projeto' },
      { id: 'gar_iluminacao', label: 'Iluminação adequada' },
      { id: 'gar_ventilacao', label: 'Ventilação natural ou mecânica funcional' },
      { id: 'gar_drenagem', label: 'Sistema de drenagem e ralos desobstruídos' },
      { id: 'gar_sinalizacao', label: 'Sinalização de trânsito interno' },
    ],
  },
  {
    id: 'areas_lazer',
    titulo: '5. Áreas de Lazer',
    items: [
      { id: 'laz_piscina', label: 'Piscina: revestimento, equipamentos e casa de máquinas' },
      { id: 'laz_salao_festas', label: 'Salão de festas: acabamento, instalações e mobiliário' },
      { id: 'laz_playground', label: 'Playground: equipamentos fixados e em bom estado' },
      { id: 'laz_academia', label: 'Academia: piso, instalações elétricas e ventilação' },
      { id: 'laz_churrasqueira', label: 'Churrasqueira: coifa, bancada e instalações de gás' },
      { id: 'laz_quadra', label: 'Quadra esportiva: piso, rede e iluminação' },
    ],
  },
  {
    id: 'hidraulica',
    titulo: '6. Instalações Hidráulicas (Áreas Comuns)',
    items: [
      { id: 'hid_reservatorios', label: 'Reservatórios de água: estanqueidade e limpeza' },
      { id: 'hid_bombas', label: 'Bombas de recalque funcionando' },
      { id: 'hid_tubulacoes', label: 'Tubulações aparentes sem vazamentos' },
      { id: 'hid_registros', label: 'Registros e válvulas operantes' },
      { id: 'hid_esgoto', label: 'Rede de esgoto e caixas de inspeção' },
    ],
  },
  {
    id: 'cobertura',
    titulo: '7. Cobertura e Telhado',
    items: [
      { id: 'cob_telhado', label: 'Telhado: telhas íntegras, sem deslocamentos' },
      { id: 'cob_calhas', label: 'Calhas e rufos em bom estado' },
      { id: 'cob_impermeabilizacao', label: 'Impermeabilização da laje de cobertura' },
      { id: 'cob_antenas', label: 'Antenas e equipamentos fixados corretamente' },
      { id: 'cob_platibanda', label: 'Platibanda e muretas sem fissuras' },
    ],
  },
  {
    id: 'eletrica_comum',
    titulo: '8. Instalações Elétricas (Áreas Comuns)',
    items: [
      { id: 'ele_quadro_geral', label: 'Quadro geral de distribuição: disjuntores identificados' },
      { id: 'ele_medicao', label: 'Central de medição: hidrômetros e medidores instalados' },
      { id: 'ele_iluminacao_emergencia', label: 'Iluminação de emergência funcional nas áreas comuns' },
      { id: 'ele_tomadas', label: 'Tomadas das áreas comuns: funcionamento e voltagem' },
      { id: 'ele_gerador', label: 'Gerador (se aplicável): funcionamento e manutenção' },
      { id: 'ele_aterramento', label: 'Sistema de aterramento conforme projeto' },
    ],
  },
];
