// Mock Data - Gestão Comercial (CRM) - Minerva Engenharia
// Dados para Leads, Interações, Propostas e Funil de Vendas

export type StatusLead = 
  | 'NOVO'
  | 'EM_CONTATO'
  | 'VISTORIA_AGENDADA'
  | 'PROPOSTA_ENVIADA'
  | 'NEGOCIACAO'
  | 'CONVERTIDO_GANHO'
  | 'PERDIDO'
  | 'CANCELADO';

export type OrigemLead = 
  | 'SITE'
  | 'INDICACAO'
  | 'REDES_SOCIAIS'
  | 'TELEFONE'
  | 'EMAIL'
  | 'EVENTO'
  | 'PARCEIRO';

export type TipoInteracao = 
  | 'LIGACAO'
  | 'WHATSAPP'
  | 'EMAIL'
  | 'REUNIAO'
  | 'VISTORIA'
  | 'PROPOSTA_ENVIADA'
  | 'CONTRATO_ENVIADO'
  | 'FEEDBACK_CLIENTE'
  | 'ANOTACAO';

export type StatusProposta = 
  | 'AGUARDANDO_APROVACAO_CLIENTE'
  | 'NEGOCIACAO'
  | 'APROVADA'
  | 'RECUSADA'
  | 'EXPIRADA';

export interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  origem: OrigemLead;
  status: StatusLead;
  dataCadastro: string;
  ultimaInteracao: string;
  interesse: string;
  valorEstimado?: number;
  responsavelId: string;
  responsavelNome: string;
  cidade?: string;
  observacoes?: string;
}

export interface InteracaoLead {
  id: string;
  leadId: string;
  tipo: TipoInteracao;
  data: string;
  usuarioId: string;
  usuarioNome: string;
  descricao: string;
  proximo_passo?: string;
}

export interface PropostaComercial {
  id: string;
  osId: string;
  osNumero: string;
  osTipo: 'OS_01_VISTORIA' | 'OS_02_ORCAMENTO' | 'OS_03_LAUDO' | 'OS_04_ASSESSORIA';
  leadId: string;
  leadNome: string;
  clienteNome?: string;
  valorProposta: number;
  dataEnvio: string;
  dataValidade: string;
  status: StatusProposta;
  tipoServico: string;
  descricaoServico: string;
  prazoExecucao?: string;
  responsavelId: string;
  responsavelNome: string;
  feedbacks: string[];
}

export interface MetricasComerciais {
  totalLeads: number;
  leadsMes: number;
  taxaConversao: number;
  propostasAbertas: number;
  valorPropostasAbertas: number;
  contratosFechados: number;
  contratosMes: number;
  valorContratosMes: number;
}

export interface FunilVendas {
  etapa: string;
  quantidade: number;
  valor: number;
}

// ============================================
// MOCK DATA - LEADS
// ============================================

export const mockLeads: Lead[] = [
  {
    id: 'L001',
    nome: 'João Silva Construtora',
    email: 'joao.silva@construtora.com.br',
    telefone: '(11) 98765-4321',
    origem: 'SITE',
    status: 'PROPOSTA_ENVIADA',
    dataCadastro: '2025-10-15T10:30:00',
    ultimaInteracao: '2025-11-10T14:20:00',
    interesse: 'Laudo Técnico de Estrutura - Edificio 12 andares',
    valorEstimado: 45000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP',
    observacoes: 'Cliente em potencial alto valor. Urgência média.'
  },
  {
    id: 'L002',
    nome: 'Maria Oliveira',
    email: 'maria.oliveira@gmail.com',
    telefone: '(11) 99876-5432',
    origem: 'INDICACAO',
    status: 'VISTORIA_AGENDADA',
    dataCadastro: '2025-11-01T09:15:00',
    ultimaInteracao: '2025-11-15T11:00:00',
    interesse: 'Reforma Residencial - Casa 300m²',
    valorEstimado: 180000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP',
    observacoes: 'Indicação do cliente Marcos. Vistoria agendada para 20/11.'
  },
  {
    id: 'L003',
    nome: 'Tech Solutions Ltda',
    email: 'contato@techsolutions.com',
    telefone: '(11) 3456-7890',
    origem: 'REDES_SOCIAIS',
    status: 'EM_CONTATO',
    dataCadastro: '2025-11-12T16:45:00',
    ultimaInteracao: '2025-11-14T10:30:00',
    interesse: 'Assessoria Técnica para novo escritório',
    valorEstimado: 25000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP'
  },
  {
    id: 'L004',
    nome: 'Construtora Horizonte',
    email: 'projetos@horizonte.com.br',
    telefone: '(11) 2345-6789',
    origem: 'PARCEIRO',
    status: 'NEGOCIACAO',
    dataCadastro: '2025-10-20T14:00:00',
    ultimaInteracao: '2025-11-16T15:45:00',
    interesse: 'Múltiplos Laudos Técnicos - Condomínio 5 blocos',
    valorEstimado: 320000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'Guarulhos - SP',
    observacoes: 'Cliente corporativo. Negociando desconto para volume.'
  },
  {
    id: 'L005',
    nome: 'Roberto Andrade',
    email: 'roberto.andrade@hotmail.com',
    telefone: '(11) 98234-5678',
    origem: 'TELEFONE',
    status: 'NOVO',
    dataCadastro: '2025-11-17T09:00:00',
    ultimaInteracao: '2025-11-17T09:00:00',
    interesse: 'Orçamento para Reforma Comercial',
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP'
  },
  {
    id: 'L006',
    nome: 'Imobiliária Prime',
    email: 'comercial@prime.com.br',
    telefone: '(11) 3567-8901',
    origem: 'EMAIL',
    status: 'CONVERTIDO_GANHO',
    dataCadastro: '2025-09-05T11:20:00',
    ultimaInteracao: '2025-10-10T14:00:00',
    interesse: 'Vistoria Cautelar - 3 imóveis',
    valorEstimado: 18000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP',
    observacoes: 'Convertido em 10/10. Cliente recorrente.'
  },
  {
    id: 'L007',
    nome: 'Ana Paula Arquitetura',
    email: 'ana@apaarquitetura.com',
    telefone: '(11) 99345-6789',
    origem: 'INDICACAO',
    status: 'PROPOSTA_ENVIADA',
    dataCadastro: '2025-11-05T10:00:00',
    ultimaInteracao: '2025-11-13T16:30:00',
    interesse: 'Assessoria Técnica - Projeto Residencial Alto Padrão',
    valorEstimado: 55000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP'
  },
  {
    id: 'L008',
    nome: 'Shopping Center Morumbi',
    email: 'manutencao@scmorumbi.com.br',
    telefone: '(11) 3123-4567',
    origem: 'SITE',
    status: 'VISTORIA_AGENDADA',
    dataCadastro: '2025-11-08T13:45:00',
    ultimaInteracao: '2025-11-15T09:20:00',
    interesse: 'Laudo Estrutural - Área de Expansão',
    valorEstimado: 95000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP',
    observacoes: 'Vistoria agendada para 22/11 às 08:00.'
  },
  {
    id: 'L009',
    nome: 'Condomínio Residencial Bosque',
    email: 'sindico@condbosque.com.br',
    telefone: '(11) 4567-8901',
    origem: 'REDES_SOCIAIS',
    status: 'EM_CONTATO',
    dataCadastro: '2025-11-14T15:30:00',
    ultimaInteracao: '2025-11-16T11:15:00',
    interesse: 'Laudo de Infiltração - Área Comum',
    valorEstimado: 12000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Bernardo do Campo - SP'
  },
  {
    id: 'L010',
    nome: 'Escola Técnica Futuro',
    email: 'diretoria@escolafuturo.edu.br',
    telefone: '(11) 2890-1234',
    origem: 'EVENTO',
    status: 'PERDIDO',
    dataCadastro: '2025-10-01T10:00:00',
    ultimaInteracao: '2025-10-25T14:00:00',
    interesse: 'Reforma de Laboratórios',
    valorEstimado: 220000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP',
    observacoes: 'Perdido para concorrente. Preço foi o fator decisivo.'
  },
  {
    id: 'L011',
    nome: 'Fábrica MecaniX',
    email: 'projetos@mecanix.com.br',
    telefone: '(11) 3678-9012',
    origem: 'SITE',
    status: 'PROPOSTA_ENVIADA',
    dataCadastro: '2025-11-02T08:30:00',
    ultimaInteracao: '2025-11-12T10:00:00',
    interesse: 'Laudo de Estabilidade - Galpão Industrial',
    valorEstimado: 38000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'Osasco - SP'
  },
  {
    id: 'L012',
    nome: 'Patricia Campos',
    email: 'patricia.campos@outlook.com',
    telefone: '(11) 99567-8901',
    origem: 'INDICACAO',
    status: 'NOVO',
    dataCadastro: '2025-11-16T14:20:00',
    ultimaInteracao: '2025-11-16T14:20:00',
    interesse: 'Vistoria Cautelar - Apartamento',
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP'
  },
  {
    id: 'L013',
    nome: 'Hospital Santa Clara',
    email: 'engenharia@hsantaclara.com.br',
    telefone: '(11) 3789-0123',
    origem: 'PARCEIRO',
    status: 'NEGOCIACAO',
    dataCadastro: '2025-10-28T11:00:00',
    ultimaInteracao: '2025-11-15T16:00:00',
    interesse: 'Assessoria para Ampliação - Nova Ala',
    valorEstimado: 450000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP',
    observacoes: 'Grande oportunidade. Em negociação de escopo.'
  },
  {
    id: 'L014',
    nome: 'Restaurante Sabor Italiano',
    email: 'gerencia@saboritaliano.com',
    telefone: '(11) 98678-9012',
    origem: 'REDES_SOCIAIS',
    status: 'EM_CONTATO',
    dataCadastro: '2025-11-13T16:00:00',
    ultimaInteracao: '2025-11-15T14:30:00',
    interesse: 'Reforma e Adequação de Cozinha Industrial',
    valorEstimado: 85000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP'
  },
  {
    id: 'L015',
    nome: 'Clube Atlético Paulista',
    email: 'presidencia@capaulista.com.br',
    telefone: '(11) 3234-5678',
    origem: 'EMAIL',
    status: 'VISTORIA_AGENDADA',
    dataCadastro: '2025-11-07T09:30:00',
    ultimaInteracao: '2025-11-14T15:00:00',
    interesse: 'Laudo Estrutural - Arquibancada',
    valorEstimado: 62000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP',
    observacoes: 'Vistoria agendada para 25/11.'
  },
  {
    id: 'L016',
    nome: 'Distribuidora LogiMax',
    email: 'operacoes@logimax.com.br',
    telefone: '(11) 4123-4567',
    origem: 'SITE',
    status: 'CONVERTIDO_GANHO',
    dataCadastro: '2025-10-10T10:15:00',
    ultimaInteracao: '2025-11-01T11:00:00',
    interesse: 'Laudo de Mezanino - Centro de Distribuição',
    valorEstimado: 28000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'Barueri - SP',
    observacoes: 'Convertido em 01/11. Contrato fechado.'
  },
  {
    id: 'L017',
    nome: 'Escritório Advocacia JLS',
    email: 'administrativo@jls.adv.br',
    telefone: '(11) 3345-6789',
    origem: 'TELEFONE',
    status: 'PROPOSTA_ENVIADA',
    dataCadastro: '2025-11-04T14:00:00',
    ultimaInteracao: '2025-11-11T10:30:00',
    interesse: 'Reforma de Escritório Corporativo',
    valorEstimado: 120000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP'
  },
  {
    id: 'L018',
    nome: 'Marina Costa Verde',
    email: 'projetos@marinacv.com.br',
    telefone: '(13) 3456-7890',
    origem: 'EVENTO',
    status: 'CANCELADO',
    dataCadastro: '2025-09-20T11:00:00',
    ultimaInteracao: '2025-10-15T16:00:00',
    interesse: 'Assessoria Técnica - Reforma de Píer',
    valorEstimado: 175000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'Santos - SP',
    observacoes: 'Cancelado pelo cliente. Projeto adiado.'
  },
  {
    id: 'L019',
    nome: 'Rafael Souza Empreendimentos',
    email: 'rafael@rsemp.com.br',
    telefone: '(11) 99789-0123',
    origem: 'INDICACAO',
    status: 'EM_CONTATO',
    dataCadastro: '2025-11-11T10:45:00',
    ultimaInteracao: '2025-11-16T09:00:00',
    interesse: 'Múltiplos Serviços - Empreendimento Residencial',
    valorEstimado: 280000,
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP'
  },
  {
    id: 'L020',
    nome: 'Clínica Odontológica Sorriso',
    email: 'dra.silva@clinicasorriso.com',
    telefone: '(11) 3567-8901',
    origem: 'SITE',
    status: 'NOVO',
    dataCadastro: '2025-11-17T08:15:00',
    ultimaInteracao: '2025-11-17T08:15:00',
    interesse: 'Orçamento para Reforma de Clínica',
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    cidade: 'São Paulo - SP'
  }
];

// ============================================
// MOCK DATA - INTERAÇÕES
// ============================================

export const mockInteracoes: InteracaoLead[] = [
  // L001 - João Silva Construtora
  {
    id: 'I001',
    leadId: 'L001',
    tipo: 'EMAIL',
    data: '2025-10-15T10:30:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Lead recebido via formulário do site. Interesse em laudo técnico estrutural.'
  },
  {
    id: 'I002',
    leadId: 'L001',
    tipo: 'LIGACAO',
    data: '2025-10-16T14:20:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Primeira ligação de contato. Cliente confirmou interesse e forneceu mais detalhes sobre o edifício.',
    proximo_passo: 'Agendar vistoria técnica'
  },
  {
    id: 'I003',
    leadId: 'L001',
    tipo: 'VISTORIA',
    data: '2025-10-22T09:00:00',
    usuarioId: 'U001',
    usuarioNome: 'João Santos',
    descricao: 'Vistoria realizada no edifício. Identificadas 3 áreas críticas que necessitam análise detalhada.'
  },
  {
    id: 'I004',
    leadId: 'L001',
    tipo: 'PROPOSTA_ENVIADA',
    data: '2025-11-10T14:20:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Proposta técnica e comercial enviada por email. Valor: R$ 45.000,00. Prazo de validade: 15 dias.',
    proximo_passo: 'Acompanhar retorno do cliente em 3 dias úteis'
  },

  // L002 - Maria Oliveira
  {
    id: 'I005',
    leadId: 'L002',
    tipo: 'WHATSAPP',
    data: '2025-11-01T09:15:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Lead recebido por indicação do cliente Marcos. Primeiro contato via WhatsApp.'
  },
  {
    id: 'I006',
    leadId: 'L002',
    tipo: 'REUNIAO',
    data: '2025-11-05T15:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Reunião presencial no escritório. Cliente apresentou projeto arquitetônico da reforma desejada.',
    proximo_passo: 'Agendar vistoria no imóvel'
  },
  {
    id: 'I007',
    leadId: 'L002',
    tipo: 'WHATSAPP',
    data: '2025-11-15T11:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Vistoria agendada para 20/11 às 10:00. Cliente confirmou presença.',
    proximo_passo: 'Realizar vistoria em 20/11'
  },

  // L003 - Tech Solutions
  {
    id: 'I008',
    leadId: 'L003',
    tipo: 'EMAIL',
    data: '2025-11-12T16:45:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Lead recebido via Instagram. Empresa procura assessoria para novo escritório.'
  },
  {
    id: 'I009',
    leadId: 'L003',
    tipo: 'LIGACAO',
    data: '2025-11-14T10:30:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Contato telefônico. Explicado o escopo dos serviços de assessoria técnica.',
    proximo_passo: 'Enviar apresentação institucional e cases'
  },

  // L004 - Construtora Horizonte
  {
    id: 'I010',
    leadId: 'L004',
    tipo: 'EMAIL',
    data: '2025-10-20T14:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Lead recebido através de parceiro comercial. Grande empreendimento de 5 blocos.'
  },
  {
    id: 'I011',
    leadId: 'L004',
    tipo: 'REUNIAO',
    data: '2025-10-28T10:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Reunião na construtora. Apresentado escopo completo dos laudos necessários.'
  },
  {
    id: 'I012',
    leadId: 'L004',
    tipo: 'VISTORIA',
    data: '2025-11-05T08:30:00',
    usuarioId: 'U001',
    usuarioNome: 'João Santos',
    descricao: 'Vistoria técnica realizada nos 5 blocos do condomínio. Elaborado escopo detalhado.'
  },
  {
    id: 'I013',
    leadId: 'L004',
    tipo: 'PROPOSTA_ENVIADA',
    data: '2025-11-12T11:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Proposta enviada com valor total de R$ 320.000,00 para os 5 blocos.'
  },
  {
    id: 'I014',
    leadId: 'L004',
    tipo: 'FEEDBACK_CLIENTE',
    data: '2025-11-16T15:45:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Cliente solicitou desconto de 10% devido ao volume de serviços. Em análise.',
    proximo_passo: 'Consultar diretoria sobre desconto e retornar em 24h'
  },

  // L006 - Imobiliária Prime (Convertido)
  {
    id: 'I015',
    leadId: 'L006',
    tipo: 'EMAIL',
    data: '2025-09-05T11:20:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Lead recebido por email. Imobiliária precisa de vistorias cautelares.'
  },
  {
    id: 'I016',
    leadId: 'L006',
    tipo: 'REUNIAO',
    data: '2025-09-12T14:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Reunião comercial. Fechado escopo para 3 imóveis.'
  },
  {
    id: 'I017',
    leadId: 'L006',
    tipo: 'PROPOSTA_ENVIADA',
    data: '2025-09-20T10:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Proposta enviada: R$ 18.000,00 (R$ 6.000 por imóvel).'
  },
  {
    id: 'I018',
    leadId: 'L006',
    tipo: 'CONTRATO_ENVIADO',
    data: '2025-10-10T14:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Proposta aprovada! Contrato enviado e assinado. Lead convertido em cliente.'
  },

  // L007 - Ana Paula Arquitetura
  {
    id: 'I019',
    leadId: 'L007',
    tipo: 'WHATSAPP',
    data: '2025-11-05T10:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Lead recebido por indicação. Arquiteta precisa de assessoria técnica.'
  },
  {
    id: 'I020',
    leadId: 'L007',
    tipo: 'REUNIAO',
    data: '2025-11-08T16:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Reunião no escritório da arquiteta. Analisado projeto de residência alto padrão.'
  },
  {
    id: 'I021',
    leadId: 'L007',
    tipo: 'PROPOSTA_ENVIADA',
    data: '2025-11-13T16:30:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Proposta de assessoria técnica enviada: R$ 55.000,00. Aguardando retorno.',
    proximo_passo: 'Follow-up em 5 dias úteis'
  },

  // L008 - Shopping Center Morumbi
  {
    id: 'I022',
    leadId: 'L008',
    tipo: 'EMAIL',
    data: '2025-11-08T13:45:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Lead recebido via site. Shopping precisa de laudo estrutural para área de expansão.'
  },
  {
    id: 'I023',
    leadId: 'L008',
    tipo: 'LIGACAO',
    data: '2025-11-11T10:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Contato telefônico com gerente de manutenção. Definido escopo preliminar.',
    proximo_passo: 'Agendar vistoria técnica'
  },
  {
    id: 'I024',
    leadId: 'L008',
    tipo: 'WHATSAPP',
    data: '2025-11-15T09:20:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Vistoria agendada para 22/11 às 08:00 (antes da abertura do shopping).',
    proximo_passo: 'Realizar vistoria em 22/11'
  },

  // L013 - Hospital Santa Clara
  {
    id: 'I025',
    leadId: 'L013',
    tipo: 'EMAIL',
    data: '2025-10-28T11:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Lead recebido via parceiro. Hospital planeja ampliação com nova ala.'
  },
  {
    id: 'I026',
    leadId: 'L013',
    tipo: 'REUNIAO',
    data: '2025-11-06T15:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Reunião com diretor de engenharia do hospital. Projeto de grande porte apresentado.'
  },
  {
    id: 'I027',
    leadId: 'L013',
    tipo: 'PROPOSTA_ENVIADA',
    data: '2025-11-10T10:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Proposta técnica enviada: R$ 450.000,00. Escopo completo de assessoria.'
  },
  {
    id: 'I028',
    leadId: 'L013',
    tipo: 'FEEDBACK_CLIENTE',
    data: '2025-11-15T16:00:00',
    usuarioId: 'U007',
    usuarioNome: 'Carlos Mendes',
    descricao: 'Cliente solicitou ajustes no escopo. Quer incluir fiscalização de obra. Revisando proposta.',
    proximo_passo: 'Enviar proposta revisada em 48h'
  }
];

// ============================================
// MOCK DATA - PROPOSTAS COMERCIAIS (OS 01-04)
// ============================================

export const mockPropostasComerciais: PropostaComercial[] = [
  {
    id: 'P001',
    osId: 'OS-001',
    osNumero: 'OS-001',
    osTipo: 'OS_03_LAUDO',
    leadId: 'L001',
    leadNome: 'João Silva Construtora',
    valorProposta: 45000,
    dataEnvio: '2025-11-10T14:20:00',
    dataValidade: '2025-11-25T23:59:59',
    status: 'AGUARDANDO_APROVACAO_CLIENTE',
    tipoServico: 'Laudo Técnico Estrutural',
    descricaoServico: 'Laudo técnico de estrutura para edifício de 12 andares com análise detalhada de 3 áreas críticas identificadas em vistoria.',
    prazoExecucao: '20 dias úteis',
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    feedbacks: []
  },
  {
    id: 'P002',
    osId: 'OS-004',
    osNumero: 'OS-004',
    osTipo: 'OS_04_ASSESSORIA',
    leadId: 'L004',
    leadNome: 'Construtora Horizonte',
    valorProposta: 320000,
    dataEnvio: '2025-11-12T11:00:00',
    dataValidade: '2025-11-30T23:59:59',
    status: 'NEGOCIACAO',
    tipoServico: 'Múltiplos Laudos Técnicos',
    descricaoServico: 'Laudos técnicos estruturais para condomínio de 5 blocos residenciais, incluindo análise de fundações, estrutura e sistemas prediais.',
    prazoExecucao: '60 dias úteis',
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    feedbacks: [
      'Cliente solicitou desconto de 10% devido ao volume de serviços (16/11)',
      'Proposta técnica aprovada, aguardando aprovação comercial (16/11)'
    ]
  },
  {
    id: 'P003',
    osId: 'OS-007',
    osNumero: 'OS-007',
    osTipo: 'OS_04_ASSESSORIA',
    leadId: 'L007',
    leadNome: 'Ana Paula Arquitetura',
    valorProposta: 55000,
    dataEnvio: '2025-11-13T16:30:00',
    dataValidade: '2025-11-28T23:59:59',
    status: 'AGUARDANDO_APROVACAO_CLIENTE',
    tipoServico: 'Assessoria Técnica',
    descricaoServico: 'Assessoria técnica para projeto residencial alto padrão, incluindo análise estrutural, compatibilização de projetos e acompanhamento técnico.',
    prazoExecucao: '90 dias',
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    feedbacks: []
  },
  {
    id: 'P004',
    osId: 'OS-011',
    osNumero: 'OS-011',
    osTipo: 'OS_03_LAUDO',
    leadId: 'L011',
    leadNome: 'Fábrica MecaniX',
    valorProposta: 38000,
    dataEnvio: '2025-11-12T10:00:00',
    dataValidade: '2025-11-27T23:59:59',
    status: 'AGUARDANDO_APROVACAO_CLIENTE',
    tipoServico: 'Laudo de Estabilidade',
    descricaoServico: 'Laudo técnico de estabilidade estrutural para galpão industrial com análise de capacidade de carga e reforços necessários.',
    prazoExecucao: '15 dias úteis',
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    feedbacks: []
  },
  {
    id: 'P005',
    osId: 'OS-013',
    osNumero: 'OS-013',
    osTipo: 'OS_04_ASSESSORIA',
    leadId: 'L013',
    leadNome: 'Hospital Santa Clara',
    valorProposta: 450000,
    dataEnvio: '2025-11-10T10:00:00',
    dataValidade: '2025-12-10T23:59:59',
    status: 'NEGOCIACAO',
    tipoServico: 'Assessoria para Ampliação',
    descricaoServico: 'Assessoria técnica completa para ampliação hospitalar com nova ala, incluindo projetos complementares, fiscalização e acompanhamento de obra.',
    prazoExecucao: '12 meses',
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    feedbacks: [
      'Cliente solicitou inclusão de fiscalização de obra no escopo (15/11)',
      'Aguardando aprovação da proposta revisada (17/11)'
    ]
  },
  {
    id: 'P006',
    osId: 'OS-017',
    osNumero: 'OS-017',
    osTipo: 'OS_02_ORCAMENTO',
    leadId: 'L017',
    leadNome: 'Escritório Advocacia JLS',
    valorProposta: 120000,
    dataEnvio: '2025-11-11T10:30:00',
    dataValidade: '2025-11-26T23:59:59',
    status: 'AGUARDANDO_APROVACAO_CLIENTE',
    tipoServico: 'Reforma de Escritório Corporativo',
    descricaoServico: 'Orçamento completo para reforma de escritório corporativo incluindo layout, instalações elétricas e hidráulicas, climatização e acabamentos.',
    prazoExecucao: '45 dias úteis',
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    feedbacks: []
  },
  {
    id: 'P007',
    osId: 'OS-006-CONV',
    osNumero: 'OS-006',
    osTipo: 'OS_01_VISTORIA',
    leadId: 'L006',
    leadNome: 'Imobiliária Prime',
    clienteNome: 'Imobiliária Prime Ltda',
    valorProposta: 18000,
    dataEnvio: '2025-09-20T10:00:00',
    dataValidade: '2025-10-05T23:59:59',
    status: 'APROVADA',
    tipoServico: 'Vistoria Cautelar',
    descricaoServico: 'Vistorias cautelares em 3 imóveis residenciais com elaboração de laudos fotográficos detalhados.',
    prazoExecucao: '10 dias úteis',
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    feedbacks: [
      'Proposta aprovada pelo cliente (28/09)',
      'Contrato assinado em 10/10 - Lead convertido em cliente'
    ]
  },
  {
    id: 'P008',
    osId: 'OS-016-CONV',
    osNumero: 'OS-016',
    osTipo: 'OS_03_LAUDO',
    leadId: 'L016',
    leadNome: 'Distribuidora LogiMax',
    clienteNome: 'LogiMax Distribuição Ltda',
    valorProposta: 28000,
    dataEnvio: '2025-10-18T14:00:00',
    dataValidade: '2025-11-02T23:59:59',
    status: 'APROVADA',
    tipoServico: 'Laudo de Mezanino',
    descricaoServico: 'Laudo técnico de mezanino para centro de distribuição com análise de capacidade de carga e conformidade estrutural.',
    prazoExecucao: '12 dias úteis',
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    feedbacks: [
      'Cliente aprovou proposta rapidamente (25/10)',
      'Contrato fechado em 01/11 - Lead convertido'
    ]
  },
  {
    id: 'P009',
    osId: 'OS-008',
    osNumero: 'OS-008',
    osTipo: 'OS_03_LAUDO',
    leadId: 'L008',
    leadNome: 'Shopping Center Morumbi',
    valorProposta: 95000,
    dataEnvio: '2025-11-16T15:00:00',
    dataValidade: '2025-12-01T23:59:59',
    status: 'AGUARDANDO_APROVACAO_CLIENTE',
    tipoServico: 'Laudo Estrutural',
    descricaoServico: 'Laudo estrutural completo para área de expansão do shopping, incluindo análise de fundações, estrutura e sistemas de segurança.',
    prazoExecucao: '30 dias úteis',
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    feedbacks: []
  },
  {
    id: 'P010',
    osId: 'OS-010-PERDIDA',
    osNumero: 'OS-010',
    osTipo: 'OS_02_ORCAMENTO',
    leadId: 'L010',
    leadNome: 'Escola Técnica Futuro',
    valorProposta: 220000,
    dataEnvio: '2025-10-15T11:00:00',
    dataValidade: '2025-10-30T23:59:59',
    status: 'RECUSADA',
    tipoServico: 'Reforma de Laboratórios',
    descricaoServico: 'Reforma completa de 4 laboratórios técnicos incluindo instalações especiais, bancadas e equipamentos de segurança.',
    prazoExecucao: '60 dias úteis',
    responsavelId: 'U007',
    responsavelNome: 'Carlos Mendes',
    feedbacks: [
      'Cliente achou o valor acima do orçamento disponível (20/10)',
      'Tentativa de negociação sem sucesso (23/10)',
      'Proposta recusada - Perdido para concorrente (25/10)'
    ]
  }
];

// ============================================
// MOCK DATA - MÉTRICAS COMERCIAIS
// ============================================

export const mockMetricasComerciais: MetricasComerciais = {
  totalLeads: 20,
  leadsMes: 8, // Novembro
  taxaConversao: 15.5, // %
  propostasAbertas: 6,
  valorPropostasAbertas: 673000, // Soma das propostas em aberto
  contratosFechados: 2,
  contratosMes: 2, // Novembro
  valorContratosMes: 46000 // L006 + L016
};

// ============================================
// MOCK DATA - FUNIL DE VENDAS
// ============================================

export const mockFunilVendas: FunilVendas[] = [
  {
    etapa: 'Novo',
    quantidade: 3,
    valor: 0 // L005, L012, L020
  },
  {
    etapa: 'Em Contato',
    quantidade: 4,
    valor: 415000 // L003, L009, L014, L019
  },
  {
    etapa: 'Vistoria Agendada',
    quantidade: 3,
    valor: 337000 // L002, L008, L015
  },
  {
    etapa: 'Proposta Enviada',
    quantidade: 4,
    valor: 258000 // L001, L007, L011, L017
  },
  {
    etapa: 'Negociação',
    quantidade: 2,
    valor: 770000 // L004, L013
  },
  {
    etapa: 'Convertido/Ganho',
    quantidade: 2,
    valor: 46000 // L006, L016
  },
  {
    etapa: 'Perdido',
    quantidade: 1,
    valor: 220000 // L010
  },
  {
    etapa: 'Cancelado',
    quantidade: 1,
    valor: 175000 // L018
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getLeadById = (id: string): Lead | undefined => {
  return mockLeads.find(lead => lead.id === id);
};

export const getInteracoesByLeadId = (leadId: string): InteracaoLead[] => {
  return mockInteracoes
    .filter(interacao => interacao.leadId === leadId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
};

export const getPropostasByLeadId = (leadId: string): PropostaComercial[] => {
  return mockPropostasComerciais.filter(proposta => proposta.leadId === leadId);
};

export const getLeadsByStatus = (status: StatusLead): Lead[] => {
  return mockLeads.filter(lead => lead.status === status);
};

export const getPropostasByStatus = (status: StatusProposta): PropostaComercial[] => {
  return mockPropostasComerciais.filter(proposta => proposta.status === status);
};

export const calcularValorTotalPorStatus = (status: StatusProposta): number => {
  return mockPropostasComerciais
    .filter(p => p.status === status)
    .reduce((total, p) => total + p.valorProposta, 0);
};
