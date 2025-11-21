/**
 * Testes Unitários - Schemas de Validação de Etapas de OS
 *
 * Testa todas as 15 etapas do workflow OS 01-04 (Perícia/Revitalização)
 * Coverage esperado: >95%
 */

import { describe, expect, it } from 'vitest';
import {
  validateStep,
  getStepValidationErrors,
  hasSchemaForStep,
  etapa1Schema,
  etapa2Schema,
  etapa3Schema,
  etapa4Schema,
  etapa5Schema,
  etapa6Schema,
  etapa7Schema,
  etapa8Schema,
  etapa9Schema,
  etapa10Schema,
  etapa11Schema,
  etapa12Schema,
  etapa13Schema,
  etapa14Schema,
  etapa15Schema,
} from '../../src/lib/validations/os-etapas-schema';

// ============================================================
// ETAPA 1: Identificação do Cliente/Lead
// ============================================================
describe('Etapa 1 - Identificação do Cliente/Lead', () => {
  it('aceita dados válidos com todos os campos obrigatórios', () => {
    const dadosValidos = {
      leadId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      nome: 'Condomínio Teste',
      cpfCnpj: '12345678901234',
      email: 'contato@condominio.com',
      telefone: '11987654321',
    };

    const result = validateStep(1, dadosValidos);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('aceita leadId válido (UUID formato)', () => {
    const dados = {
      leadId: '550e8400-e29b-41d4-a716-446655440000',
      nome: 'Cliente Teste',
    };

    const result = etapa1Schema.safeParse(dados);
    expect(result.success).toBe(true);
  });

  it('rejeita leadId vazio', () => {
    const dados = {
      leadId: '',
      nome: 'Cliente Teste',
    };

    const result = validateStep(1, dados);
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });

  it('rejeita nome muito curto (< 3 caracteres)', () => {
    const dados = {
      leadId: 'uuid-valido',
      nome: 'AB',
    };

    const result = validateStep(1, dados);
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });

  it('rejeita email inválido', () => {
    const dados = {
      leadId: 'uuid-valido',
      nome: 'Cliente Teste',
      email: 'email-invalido',
    };

    const result = validateStep(1, dados);
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });

  it('rejeita CPF/CNPJ muito curto', () => {
    const dados = {
      leadId: 'uuid-valido',
      nome: 'Cliente Teste',
      cpfCnpj: '12345',
    };

    const result = validateStep(1, dados);
    expect(result.valid).toBe(false);
  });

  it('aceita campos opcionais vazios', () => {
    const dados = {
      leadId: 'uuid-valido',
      nome: 'Cliente Teste',
      tipo: undefined,
      nomeResponsavel: undefined,
    };

    const result = validateStep(1, dados);
    expect(result.valid).toBe(true);
  });
});

// ============================================================
// ETAPA 2: Seleção do Tipo de OS
// ============================================================
describe('Etapa 2 - Seleção do Tipo de OS', () => {
  it('aceita tipo de OS válido', () => {
    const dados = {
      tipoOS: 'OS 01: Perícia de Fachada',
    };

    const result = validateStep(2, dados);
    expect(result.valid).toBe(true);
  });

  it('rejeita tipoOS vazio', () => {
    const dados = {
      tipoOS: '',
    };

    const result = validateStep(2, dados);
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });

  it('aceita descrição breve opcional', () => {
    const dados = {
      tipoOS: 'OS 02',
      descricaoBreve: 'Revitalização de fachada com impermeabilização',
    };

    const result = validateStep(2, dados);
    expect(result.valid).toBe(true);
  });

  it('rejeita descrição breve muito curta', () => {
    const dados = {
      tipoOS: 'OS 01',
      descricaoBreve: 'Curta',
    };

    const result = validateStep(2, dados);
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });

  it('rejeita campos extras não permitidos (strict)', () => {
    const dados = {
      tipoOS: 'OS 01',
      campoExtra: 'não permitido',
    };

    const result = etapa2Schema.safeParse(dados);
    expect(result.success).toBe(false);
  });
});

// ============================================================
// ETAPA 3: Follow-up 1 (Entrevista Inicial)
// ============================================================
describe('Etapa 3 - Follow-up 1', () => {
  const dadosValidos = {
    idadeEdificacao: '15 anos',
    motivoProcura: 'Infiltração grave na fachada frontal',
    quandoAconteceu: '6 meses atrás',
    grauUrgencia: 'Alto',
    apresentacaoProposta: 'Presencial na sede do condomínio',
    nomeContatoLocal: 'João Silva',
    telefoneContatoLocal: '11987654321',
  };

  it('aceita todos os campos obrigatórios válidos', () => {
    const result = validateStep(3, dadosValidos);
    expect(result.valid).toBe(true);
  });

  it('rejeita idadeEdificacao vazia', () => {
    const dados = { ...dadosValidos, idadeEdificacao: '' };
    const result = validateStep(3, dados);
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });

  it('rejeita motivoProcura muito curto', () => {
    const dados = { ...dadosValidos, motivoProcura: 'Curto' };
    const result = validateStep(3, dados);
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });

  it('rejeita quandoAconteceu muito curto', () => {
    const dados = { ...dadosValidos, quandoAconteceu: 'Ontem' };
    const result = validateStep(3, dados);
    expect(result.valid).toBe(false);
  });

  it('aceita grauUrgencia válido', () => {
    const urgencias = ['Baixo', 'Médio', 'Alto', 'Crítico'];
    urgencias.forEach((urgencia) => {
      const dados = { ...dadosValidos, grauUrgencia: urgencia };
      const result = validateStep(3, dados);
      expect(result.valid).toBe(true);
    });
  });

  it('rejeita apresentacaoProposta muito curta', () => {
    const dados = { ...dadosValidos, apresentacaoProposta: 'Sim' };
    const result = validateStep(3, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita nomeContatoLocal muito curto', () => {
    const dados = { ...dadosValidos, nomeContatoLocal: 'AB' };
    const result = validateStep(3, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita telefoneContatoLocal muito curto', () => {
    const dados = { ...dadosValidos, telefoneContatoLocal: '1234' };
    const result = validateStep(3, dados);
    expect(result.valid).toBe(false);
  });

  it('aceita campos opcionais vazios', () => {
    const dados = {
      ...dadosValidos,
      oqueFeitoARespeito: undefined,
      existeEscopo: undefined,
      previsaoOrcamentaria: undefined,
      cargoContatoLocal: undefined,
    };
    const result = validateStep(3, dados);
    expect(result.valid).toBe(true);
  });

  it('aceita array de anexos vazio', () => {
    const dados = {
      ...dadosValidos,
      anexos: [],
    };
    const result = validateStep(3, dados);
    expect(result.valid).toBe(true);
  });

  it('aceita anexos com estrutura válida', () => {
    const dados = {
      ...dadosValidos,
      anexos: [
        {
          id: 'uuid-anexo-1',
          url: 'https://storage.supabase.co/foto1.jpg',
          nome: 'foto_fachada.jpg',
          tamanho: 1024000,
        },
      ],
    };
    const result = validateStep(3, dados);
    expect(result.valid).toBe(true);
  });
});

// ============================================================
// ETAPA 4: Agendar Visita Técnica
// ============================================================
describe('Etapa 4 - Agendar Visita Técnica', () => {
  const dadosValidos = {
    dataVisita: '2025-11-25',
    horaVisita: '09:00',
    responsavelVisita: 'João Engenheiro',
  };

  it('aceita todos os campos obrigatórios válidos', () => {
    const result = validateStep(4, dadosValidos);
    expect(result.valid).toBe(true);
  });

  it('rejeita dataVisita vazia', () => {
    const dados = { ...dadosValidos, dataVisita: '' };
    const result = validateStep(4, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita horaVisita vazia', () => {
    const dados = { ...dadosValidos, horaVisita: '' };
    const result = validateStep(4, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita responsavelVisita vazio', () => {
    const dados = { ...dadosValidos, responsavelVisita: '' };
    const result = validateStep(4, dados);
    expect(result.valid).toBe(false);
  });

  it('aceita observações opcionais', () => {
    const dados = {
      ...dadosValidos,
      observacoes: 'Confirmar portaria com antecedência',
    };
    const result = validateStep(4, dados);
    expect(result.valid).toBe(true);
  });
});

// ============================================================
// ETAPA 5: Realizar Visita
// ============================================================
describe('Etapa 5 - Realizar Visita', () => {
  const dadosValidos = {
    dataVisitaRealizada: '2025-11-25',
    observacoesVisita: 'Fachada com infiltrações generalizadas. Necessita impermeabilização completa.',
    fotosVisita: [
      { url: 'https://storage/foto1.jpg', nome: 'fachada_frontal.jpg' },
    ],
  };

  it('aceita todos os campos obrigatórios válidos', () => {
    const result = validateStep(5, dadosValidos);
    expect(result.valid).toBe(true);
  });

  it('rejeita observacoesVisita muito curta', () => {
    const dados = { ...dadosValidos, observacoesVisita: 'OK' };
    const result = validateStep(5, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita fotosVisita vazio', () => {
    const dados = { ...dadosValidos, fotosVisita: [] };
    const result = validateStep(5, dados);
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });

  it('aceita múltiplas fotos', () => {
    const dados = {
      ...dadosValidos,
      fotosVisita: [
        { url: 'https://storage/foto1.jpg', nome: 'foto1.jpg' },
        { url: 'https://storage/foto2.jpg', nome: 'foto2.jpg' },
        { url: 'https://storage/foto3.jpg', nome: 'foto3.jpg' },
      ],
    };
    const result = validateStep(5, dados);
    expect(result.valid).toBe(true);
  });
});

// ============================================================
// ETAPA 6: Follow-up 2 (Pós-Visita)
// ============================================================
describe('Etapa 6 - Follow-up 2', () => {
  const dadosValidos = {
    dataFollowup: '2025-11-26',
    feedback: 'Cliente muito interessado, solicitou proposta urgente.',
    proximosPassos: 'Elaborar memorial descritivo e precificar',
  };

  it('aceita todos os campos obrigatórios válidos', () => {
    const result = validateStep(6, dadosValidos);
    expect(result.valid).toBe(true);
  });

  it('rejeita feedback muito curto', () => {
    const dados = { ...dadosValidos, feedback: 'OK' };
    const result = validateStep(6, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita dataFollowup vazia', () => {
    const dados = { ...dadosValidos, dataFollowup: '' };
    const result = validateStep(6, dados);
    expect(result.valid).toBe(false);
  });
});

// ============================================================
// ETAPA 7: Formulário Memorial (Escopo)
// ============================================================
describe('Etapa 7 - Memorial Descritivo', () => {
  const dadosValidos = {
    objetivo: 'Revitalização completa da fachada com impermeabilização',
    etapasPrincipais: [
      {
        nome: 'Fachada Principal',
        subetapas: [
          {
            nome: 'Limpeza de fachada',
            m2: '500',
            diasUteis: '10',
            total: '5000',
          },
          {
            nome: 'Impermeabilização',
            m2: '500',
            diasUteis: '15',
            total: '15000',
          },
        ],
      },
    ],
    planejamentoInicial: '5',
    logisticaTransporte: '3',
    preparacaoArea: '2',
  };

  it('aceita todos os campos obrigatórios válidos', () => {
    const result = validateStep(7, dadosValidos);
    expect(result.valid).toBe(true);
  });

  it('rejeita objetivo muito curto', () => {
    const dados = { ...dadosValidos, objetivo: 'Curto' };
    const result = validateStep(7, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita etapasPrincipais vazio', () => {
    const dados = { ...dadosValidos, etapasPrincipais: [] };
    const result = validateStep(7, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita subetapas vazio', () => {
    const dados = {
      ...dadosValidos,
      etapasPrincipais: [
        {
          nome: 'Etapa Principal',
          subetapas: [],
        },
      ],
    };
    const result = validateStep(7, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita m2 negativo', () => {
    const dados = {
      ...dadosValidos,
      etapasPrincipais: [
        {
          nome: 'Fachada',
          subetapas: [
            {
              nome: 'Limpeza',
              m2: '-100',
              diasUteis: '10',
              total: '5000',
            },
          ],
        },
      ],
    };
    const result = validateStep(7, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita diasUteis zero ou negativo', () => {
    const dados = {
      ...dadosValidos,
      etapasPrincipais: [
        {
          nome: 'Fachada',
          subetapas: [
            {
              nome: 'Limpeza',
              m2: '100',
              diasUteis: '0',
              total: '5000',
            },
          ],
        },
      ],
    };
    const result = validateStep(7, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita total não numérico', () => {
    const dados = {
      ...dadosValidos,
      etapasPrincipais: [
        {
          nome: 'Fachada',
          subetapas: [
            {
              nome: 'Limpeza',
              m2: '100',
              diasUteis: '10',
              total: 'invalido',
            },
          ],
        },
      ],
    };
    const result = validateStep(7, dados);
    expect(result.valid).toBe(false);
  });
});

// ============================================================
// ETAPA 8: Precificação
// ============================================================
describe('Etapa 8 - Precificação', () => {
  const dadosValidos = {
    materialCusto: '10000',
    maoObraCusto: '15000',
    margemLucro: '20',
    precoFinal: '35000',
  };

  it('aceita todos os campos obrigatórios válidos', () => {
    const result = validateStep(8, dadosValidos);
    expect(result.valid).toBe(true);
  });

  it('rejeita materialCusto vazio', () => {
    const dados = { ...dadosValidos, materialCusto: '' };
    const result = validateStep(8, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita maoObraCusto vazio', () => {
    const dados = { ...dadosValidos, maoObraCusto: '' };
    const result = validateStep(8, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita precoFinal vazio', () => {
    const dados = { ...dadosValidos, precoFinal: '' };
    const result = validateStep(8, dados);
    expect(result.valid).toBe(false);
  });

  it('aceita observações opcionais', () => {
    const dados = {
      ...dadosValidos,
      observacoesPrecificacao: 'Valores baseados em cotação de mercado',
    };
    const result = validateStep(8, dados);
    expect(result.valid).toBe(true);
  });
});

// ============================================================
// ETAPA 9: Gerar Proposta Comercial
// ============================================================
describe('Etapa 9 - Gerar Proposta Comercial', () => {
  const dadosValidos = {
    descricaoServicos: 'Revitalização completa de fachada com impermeabilização e pintura',
    valorProposta: '35000',
    prazoProposta: '45',
    condicoesPagamento: '30% entrada + 6x parcelas',
  };

  it('aceita todos os campos obrigatórios válidos', () => {
    const result = validateStep(9, dadosValidos);
    expect(result.valid).toBe(true);
  });

  it('rejeita descricaoServicos muito curta', () => {
    const dados = { ...dadosValidos, descricaoServicos: 'Curto' };
    const result = validateStep(9, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita valorProposta vazio', () => {
    const dados = { ...dadosValidos, valorProposta: '' };
    const result = validateStep(9, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita prazoProposta vazio', () => {
    const dados = { ...dadosValidos, prazoProposta: '' };
    const result = validateStep(9, dados);
    expect(result.valid).toBe(false);
  });
});

// ============================================================
// ETAPA 10: Agendar Visita (Apresentação)
// ============================================================
describe('Etapa 10 - Agendar Apresentação', () => {
  const dadosValidos = {
    dataApresentacao: '2025-12-05',
    horaApresentacao: '14:00',
    responsavelApresentacao: 'Maria Comercial',
  };

  it('aceita todos os campos obrigatórios válidos', () => {
    const result = validateStep(10, dadosValidos);
    expect(result.valid).toBe(true);
  });

  it('rejeita dataApresentacao vazia', () => {
    const dados = { ...dadosValidos, dataApresentacao: '' };
    const result = validateStep(10, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita horaApresentacao vazia', () => {
    const dados = { ...dadosValidos, horaApresentacao: '' };
    const result = validateStep(10, dados);
    expect(result.valid).toBe(false);
  });
});

// ============================================================
// ETAPA 11: Realizar Visita (Apresentação)
// ============================================================
describe('Etapa 11 - Realizar Apresentação', () => {
  const dadosValidos = {
    dataApresentacaoRealizada: '2025-12-05',
    reacaoCliente: 'Positiva',
    observacoesApresentacao: 'Cliente aprovou proposta, pediu ajuste no prazo de pagamento.',
  };

  it('aceita todos os campos obrigatórios válidos', () => {
    const result = validateStep(11, dadosValidos);
    expect(result.valid).toBe(true);
  });

  it('rejeita observacoesApresentacao muito curta', () => {
    const dados = { ...dadosValidos, observacoesApresentacao: 'OK' };
    const result = validateStep(11, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita reacaoCliente vazio', () => {
    const dados = { ...dadosValidos, reacaoCliente: '' };
    const result = validateStep(11, dados);
    expect(result.valid).toBe(false);
  });
});

// ============================================================
// ETAPA 12: Follow-up 3 (Pós-Apresentação)
// ============================================================
describe('Etapa 12 - Follow-up 3', () => {
  const dadosValidos = {
    dataFollowup3: '2025-12-06',
    statusNegociacao: 'Pronto para fechar',
    observacoesFollowup: 'Cliente confirmou início para janeiro de 2026.',
  };

  it('aceita todos os campos obrigatórios válidos', () => {
    const result = validateStep(12, dadosValidos);
    expect(result.valid).toBe(true);
  });

  it('rejeita statusNegociacao vazio', () => {
    const dados = { ...dadosValidos, statusNegociacao: '' };
    const result = validateStep(12, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita observacoesFollowup muito curta', () => {
    const dados = { ...dadosValidos, observacoesFollowup: 'OK' };
    const result = validateStep(12, dados);
    expect(result.valid).toBe(false);
  });
});

// ============================================================
// ETAPA 13: Gerar Contrato (Upload)
// ============================================================
describe('Etapa 13 - Gerar Contrato', () => {
  const dadosValidos = {
    descricaoContrato: 'Contrato de revitalização de fachada com prazo de 45 dias úteis',
    dataInicio: '2026-01-10',
    dataFim: '2026-03-15',
    arquivoContrato: {
      url: 'https://storage/contrato.pdf',
      nome: 'contrato_minerva_001.pdf',
    },
  };

  it('aceita todos os campos obrigatórios válidos', () => {
    const result = validateStep(13, dadosValidos);
    expect(result.valid).toBe(true);
  });

  it('rejeita descricaoContrato muito curta', () => {
    const dados = { ...dadosValidos, descricaoContrato: 'Curto' };
    const result = validateStep(13, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita dataInicio vazia', () => {
    const dados = { ...dadosValidos, dataInicio: '' };
    const result = validateStep(13, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita dataFim vazia', () => {
    const dados = { ...dadosValidos, dataFim: '' };
    const result = validateStep(13, dados);
    expect(result.valid).toBe(false);
  });
});

// ============================================================
// ETAPA 14: Contrato Assinado
// ============================================================
describe('Etapa 14 - Contrato Assinado', () => {
  const dadosValidos = {
    dataAssinatura: '2025-12-10',
    assinadoPor: 'João Silva - Síndico',
    arquivoAssinado: {
      url: 'https://storage/contrato_assinado.pdf',
      nome: 'contrato_assinado.pdf',
    },
  };

  it('aceita todos os campos obrigatórios válidos', () => {
    const result = validateStep(14, dadosValidos);
    expect(result.valid).toBe(true);
  });

  it('rejeita dataAssinatura vazia', () => {
    const dados = { ...dadosValidos, dataAssinatura: '' };
    const result = validateStep(14, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita assinadoPor vazio', () => {
    const dados = { ...dadosValidos, assinadoPor: '' };
    const result = validateStep(14, dados);
    expect(result.valid).toBe(false);
  });
});

// ============================================================
// ETAPA 15: Iniciar Contrato de Obra
// ============================================================
describe('Etapa 15 - Iniciar Contrato de Obra', () => {
  const dadosValidos = {
    dataInicio: '2026-01-10',
    responsavelObra: 'Carlos Engenheiro',
    numEquipe: 'Equipe A',
  };

  it('aceita todos os campos obrigatórios válidos', () => {
    const result = validateStep(15, dadosValidos);
    expect(result.valid).toBe(true);
  });

  it('rejeita dataInicio vazia', () => {
    const dados = { ...dadosValidos, dataInicio: '' };
    const result = validateStep(15, dados);
    expect(result.valid).toBe(false);
  });

  it('rejeita responsavelObra vazio', () => {
    const dados = { ...dadosValidos, responsavelObra: '' };
    const result = validateStep(15, dados);
    expect(result.valid).toBe(false);
  });
});

// ============================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================
describe('Funções Utilitárias', () => {
  describe('validateStep()', () => {
    it('retorna erro se dados forem undefined', () => {
      const result = validateStep(1, undefined);
      expect(result.valid).toBe(false);
      expect(result.errors._root).toContain('Dados não fornecidos');
    });

    it('retorna erro se dados forem null', () => {
      const result = validateStep(1, null);
      expect(result.valid).toBe(false);
      expect(result.errors._root).toContain('Dados não fornecidos');
    });

    it('retorna erro se schema não existir', () => {
      const result = validateStep(99, { campo: 'valor' });
      expect(result.valid).toBe(false);
      expect(result.errors._root).toContain('Schema não encontrado');
    });

    it('retorna múltiplos erros quando vários campos são inválidos', () => {
      const dados = {
        leadId: '',
        nome: 'A',
        email: 'invalido',
      };
      const result = validateStep(1, dados);
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });

  describe('getStepValidationErrors()', () => {
    it('retorna array de mensagens de erro', () => {
      const dados = {
        leadId: '',
        nome: 'A',
      };
      const errors = getStepValidationErrors(1, dados);
      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.every((err) => typeof err === 'string')).toBe(true);
    });

    it('retorna array vazio se dados são válidos', () => {
      const dados = {
        leadId: 'uuid-valido',
        nome: 'Cliente Teste',
      };
      const errors = getStepValidationErrors(1, dados);
      expect(errors).toEqual([]);
    });
  });

  describe('hasSchemaForStep()', () => {
    it('retorna true para etapas 1-15', () => {
      expect(hasSchemaForStep(1)).toBe(true);
      expect(hasSchemaForStep(2)).toBe(true);
      expect(hasSchemaForStep(3)).toBe(true);
      expect(hasSchemaForStep(4)).toBe(true);
      expect(hasSchemaForStep(5)).toBe(true);
      expect(hasSchemaForStep(6)).toBe(true);
      expect(hasSchemaForStep(7)).toBe(true);
      expect(hasSchemaForStep(8)).toBe(true);
      expect(hasSchemaForStep(9)).toBe(true);
      expect(hasSchemaForStep(10)).toBe(true);
      expect(hasSchemaForStep(11)).toBe(true);
      expect(hasSchemaForStep(12)).toBe(true);
      expect(hasSchemaForStep(13)).toBe(true);
      expect(hasSchemaForStep(14)).toBe(true);
      expect(hasSchemaForStep(15)).toBe(true);
    });

    it('retorna false para etapas inexistentes', () => {
      expect(hasSchemaForStep(0)).toBe(false);
      expect(hasSchemaForStep(16)).toBe(false);
      expect(hasSchemaForStep(99)).toBe(false);
    });
  });
});

// ============================================================
// TESTES DE EDGE CASES
// ============================================================
describe('Edge Cases e Cenários Extremos', () => {
  it('aceita strings muito longas em campos de texto', () => {
    const textoLongo = 'A'.repeat(10000);
    const dados = {
      leadId: 'uuid-valido',
      nome: 'Cliente Teste',
      idadeEdificacao: textoLongo,
      motivoProcura: textoLongo,
      quandoAconteceu: textoLongo,
      grauUrgencia: 'Alto',
      apresentacaoProposta: textoLongo,
      nomeContatoLocal: 'João',
      telefoneContatoLocal: '11987654321',
    };
    const result = validateStep(3, dados);
    expect(result.valid).toBe(true);
  });

  it('lida com caracteres especiais em strings', () => {
    const dados = {
      leadId: 'uuid-valido',
      nome: 'Cliente Côm Açentôs & Especiäis',
    };
    const result = validateStep(1, dados);
    expect(result.valid).toBe(true);
  });

  it('aceita valores decimais em campos numéricos (etapa 7)', () => {
    const dados = {
      objetivo: 'Objetivo válido',
      etapasPrincipais: [
        {
          nome: 'Fachada',
          subetapas: [
            {
              nome: 'Limpeza',
              m2: '123.45',
              diasUteis: '10',
              total: '5678.90',
            },
          ],
        },
      ],
      planejamentoInicial: '5',
      logisticaTransporte: '3',
      preparacaoArea: '2',
    };
    const result = validateStep(7, dados);
    expect(result.valid).toBe(true);
  });

  it('rejeita valores negativos em campos de valor monetário', () => {
    const dados = {
      objetivo: 'Objetivo válido',
      etapasPrincipais: [
        {
          nome: 'Fachada',
          subetapas: [
            {
              nome: 'Limpeza',
              m2: '100',
              diasUteis: '10',
              total: '-5000',
            },
          ],
        },
      ],
      planejamentoInicial: '5',
      logisticaTransporte: '3',
      preparacaoArea: '2',
    };
    const result = validateStep(7, dados);
    expect(result.valid).toBe(false);
  });

  it('valida corretamente array vazio vs array com elementos inválidos', () => {
    // Array vazio (default aceito na etapa 3)
    const dadosArrayVazio = {
      idadeEdificacao: '10 anos',
      motivoProcura: 'Infiltração na fachada',
      quandoAconteceu: '6 meses atrás',
      grauUrgencia: 'Alto',
      apresentacaoProposta: 'Presencial na sede',
      nomeContatoLocal: 'João Silva',
      telefoneContatoLocal: '11987654321',
      anexos: [],
    };
    const resultVazio = validateStep(3, dadosArrayVazio);
    expect(resultVazio.valid).toBe(true);

    // Array com elemento inválido (falta url)
    const dadosArrayInvalido = {
      ...dadosArrayVazio,
      anexos: [{ nome: 'foto.jpg' }],
    };
    const resultInvalido = validateStep(3, dadosArrayInvalido);
    expect(resultInvalido.valid).toBe(false);
  });
});
