/**
 * MOCK DATA - Dados de desenvolvimento
 * 
 * ⚠️ IMPORTANTE: Estes dados estão sendo gradualmente migrados para o Supabase.
 * Para usar dados reais da API, importe de /lib/api-client.ts
 * 
 * Migração em progresso:
 * - ✅ Clientes/Leads: usar clientesAPI.list()
 * - ✅ Ordens de Serviço: usar ordensServicoAPI.list()
 * - ✅ Tipos de OS: usar tiposOSAPI.list()
 * - ⏳ Demais entidades em desenvolvimento
 */
import { User, OrdemServico, Comentario, Documento, HistoricoItem } from './types';

// ============================================================
// TIPOS DE OS DISPONÍVEIS (RF-017)
// ============================================================

export const tiposOS = [
  { id: '01', label: 'OS 01: Perícia de Fachada' },
  { id: '02', label: 'OS 02: Revitalização de Fachada' },
  { id: '03', label: 'OS 03: Reforço Estrutural' },
  { id: '04', label: 'OS 04: Outros' },
  { id: '05', label: 'OS 05: Assessoria técnica mensal' },
  { id: '06', label: 'OS 06: Laudo pontual' },
  { id: '07', label: 'OS 07: Assessoria técnica (documento gerado)' },
  { id: '08', label: 'OS 08: Vistoria/Inspeção' },
  { id: '09', label: 'OS 09: Requisição de Compras' },
  { id: '10', label: 'OS 10: Requisição de Mão de Obra/Recrutamento' },
  { id: '11', label: 'OS 11: Laudo Pontual' },
  { id: '12', label: 'OS 12: Assessoria Técnica Mensal/Anual' },
  { id: '13', label: 'OS 13: Start de Contrato de Obra' }
];

// ============================================================
// CLIENTES E LEADS MOCK
// ============================================================

// Clientes disponíveis para seleção (status: 'cliente')
export const mockClientes = [
  { id: '1', nome: 'Construtora ABC Ltda', cnpj: '12.345.678/0001-90' },
  { id: '2', nome: 'Incorporadora XYZ', cnpj: '98.765.432/0001-10' },
  { id: '3', nome: 'Empreendimentos Delta', cnpj: '11.222.333/0001-44' },
  { id: '4', nome: 'Construtora Sigma', cnpj: '44.555.666/0001-77' },
  { id: '5', nome: 'Grupo Omega', cnpj: '77.888.999/0001-00' },
  { id: '6', nome: 'Incorporadora Beta', cnpj: '33.444.555/0001-22' },
  { id: '7', nome: 'Construtora Alvorada', cnpj: '22.333.444/0001-55' },
  { id: '8', nome: 'Empreendimentos Sul', cnpj: '55.666.777/0001-88' },
  { id: '9', nome: 'Grupo Horizonte', cnpj: '66.777.888/0001-99' },
  { id: '10', nome: 'Incorporadora Nexus', cnpj: '88.999.000/0001-11' }
];

// Leads disponíveis para seleção (status: 'lead')
export const mockLeads = [
  { 
    id: 'L1', 
    nome: 'Condomínio Jardim das Flores', 
    cpfCnpj: '45.123.789/0001-22',
    tipo: 'juridica',
    tipoEdificacao: 'Condomínio Residencial - Casas',
    qtdUnidades: '48',
    qtdBlocos: '',
    tipoTelhado: 'Laje impermeabilizada',
    endereco: 'Rua das Acácias, 450 - Vila Mariana, São Paulo/SP',
    telefone: '(11) 98765-4321',
    email: 'sindico@jardimflores.com.br',
    status: 'lead'
  },
  { 
    id: 'L2', 
    nome: 'Edifício Residencial Morada do Sol', 
    cpfCnpj: '78.456.123/0001-88',
    tipo: 'juridica',
    tipoEdificacao: 'Condomínio Residencial - Apartamentos',
    qtdUnidades: '120',
    qtdBlocos: '3',
    tipoTelhado: 'Telha cerâmica',
    endereco: 'Av. Paulista, 1200 - Bela Vista, São Paulo/SP',
    telefone: '(11) 97654-3210',
    email: 'contato@moradadosol.com.br',
    status: 'lead'
  },
  { 
    id: 'L3', 
    nome: 'João Carlos Silva', 
    cpfCnpj: '456.789.123-88',
    tipo: 'fisica',
    tipoEdificacao: 'Outro',
    qtdUnidades: '',
    qtdBlocos: '',
    tipoTelhado: 'Telha colonial',
    endereco: 'Rua dos Pinheiros, 850 - Pinheiros, São Paulo/SP',
    telefone: '(11) 99876-5432',
    email: 'joao.silva@email.com',
    status: 'lead'
  },
  { 
    id: 'L4', 
    nome: 'Condomínio Ville de France', 
    cpfCnpj: '12.987.654/0001-33',
    tipo: 'juridica',
    tipoEdificacao: 'Condomínio Residencial - Apartamentos',
    qtdUnidades: '200',
    qtdBlocos: '4',
    tipoTelhado: 'Laje impermeabilizada',
    endereco: 'Rua França Pinto, 1500 - Vila Mariana, São Paulo/SP',
    telefone: '(11) 96543-2109',
    email: 'administracao@villedefrance.com.br',
    status: 'lead'
  },
  { 
    id: 'L5', 
    nome: 'Shopping Center Norte', 
    cpfCnpj: '789.456.123-00',
    tipo: 'juridica',
    tipoEdificacao: 'Shopping',
    qtdUnidades: '',
    qtdBlocos: '',
    tipoTelhado: 'Telha metálica',
    endereco: 'Rua Augusta, 2500 - Consolação, São Paulo/SP',
    telefone: '(11) 95432-1098',
    email: 'contato@shoppingnorte.com.br',
    status: 'lead'
  },
  { 
    id: 'L6', 
    nome: 'Plaza Offices', 
    cpfCnpj: '33.222.111/0001-99',
    tipo: 'juridica',
    tipoEdificacao: 'Condomínio Comercial',
    qtdUnidades: '80',
    qtdBlocos: '',
    tipoTelhado: 'Laje técnica',
    endereco: 'Av. Brigadeiro Faria Lima, 3000 - Itaim Bibi, São Paulo/SP',
    telefone: '(11) 94321-0987',
    email: 'administracao@plazaoffices.com.br',
    status: 'lead'
  },
  { 
    id: 'L7', 
    nome: 'Hotel Grand Luxo', 
    cpfCnpj: '55.666.777/0001-44',
    tipo: 'juridica',
    tipoEdificacao: 'Hotel',
    qtdUnidades: '',
    qtdBlocos: '',
    tipoTelhado: 'Laje impermeabilizada',
    endereco: 'Av. Atlântica, 500 - Copacabana, Rio de Janeiro/RJ',
    telefone: '(21) 98888-7777',
    email: 'contato@hotelgrandluxo.com.br',
    status: 'lead'
  },
  { 
    id: 'L8', 
    nome: 'Hospital São Lucas', 
    cpfCnpj: '66.777.888/0001-55',
    tipo: 'juridica',
    tipoEdificacao: 'Hospital',
    qtdUnidades: '',
    qtdBlocos: '',
    tipoTelhado: 'Laje técnica',
    endereco: 'Rua da Saúde, 1000 - Centro, São Paulo/SP',
    telefone: '(11) 97777-6666',
    email: 'administracao@hsaolucas.com.br',
    status: 'lead'
  },
  { 
    id: 'L9', 
    nome: 'Igreja Batista Central', 
    cpfCnpj: '77.888.999/0001-66',
    tipo: 'juridica',
    tipoEdificacao: 'Igreja',
    qtdUnidades: '',
    qtdBlocos: '',
    tipoTelhado: 'Telhado cerâmico',
    endereco: 'Praça da Fé, 200 - Centro, Campinas/SP',
    telefone: '(19) 99999-8888',
    email: 'contato@igrejabatistacentral.org.br',
    status: 'lead'
  },
  { 
    id: 'L10', 
    nome: 'Indústria Metalúrgica ABC', 
    cpfCnpj: '88.999.000/0001-77',
    tipo: 'juridica',
    tipoEdificacao: 'Indústria',
    qtdUnidades: '',
    qtdBlocos: '',
    tipoTelhado: 'Telhado metálico',
    endereco: 'Rod. Anhanguera, Km 102 - Distrito Industrial, Campinas/SP',
    telefone: '(19) 98888-9999',
    email: 'facilities@metalurgicaabc.com.br',
    status: 'lead'
  }
];

// ============================================================
// USUÁRIOS SEED - ESTRUTURA HIERÁRQUICA COMPLETA (13 USUÁRIOS)
// ============================================================

export const mockUsers: User[] = [
  // ============================================
  // NÍVEL 4: DIRETORIA
  // ============================================
  {
    id: '1',
    nome_completo: 'Carlos Alberto Diretor',
    email: 'diretoria@minerva.com',
    role_nivel: 'DIRETORIA',
    setor: 'COM',
    supervisor_id: undefined,
    supervisor_nome: undefined,
    status_colaborador: 'ativo',
    data_admissao: new Date('2020-01-01'),
    telefone: '+55 (11) 98765-4321',
    cpf: '123.456.789-00',
    avatar: 'CD',
    pode_delegar: true,
    pode_aprovar: true,
    setores_acesso: ['COM', 'ASS', 'OBR'],
    modulos_acesso: {
      administrativo: true,
      financeiro: true,
      operacional: true,
      recursos_humanos: true,
    },
  },

  // ============================================
  // NÍVEL 3: GESTORES DE SETOR
  // ============================================
  {
    id: '2',
    nome_completo: 'Maria Silva Gestora Comercial',
    email: 'gestor.comercial@minerva.com',
    role_nivel: 'GESTOR_COMERCIAL',
    setor: 'COM',
    supervisor_id: '1',
    supervisor_nome: 'Carlos Alberto Diretor',
    status_colaborador: 'ativo',
    data_admissao: new Date('2021-03-15'),
    telefone: '+55 (11) 98765-4322',
    cpf: '234.567.890-11',
    avatar: 'MS',
    pode_delegar: true,
    pode_aprovar: true,
    setores_acesso: ['COM', 'ASS', 'OBR'],
    modulos_acesso: {
      administrativo: true,
      financeiro: true,
      operacional: true,
      recursos_humanos: false,
    },
  },
  {
    id: '3',
    nome_completo: 'João Pedro Gestor Assessoria',
    email: 'gestor.assessoria@minerva.com',
    role_nivel: 'GESTOR_ASSESSORIA',
    setor: 'ASS',
    supervisor_id: '1',
    supervisor_nome: 'Carlos Alberto Diretor',
    status_colaborador: 'ativo',
    data_admissao: new Date('2021-06-01'),
    telefone: '+55 (11) 98765-4323',
    cpf: '345.678.901-22',
    avatar: 'JP',
    pode_delegar: true,
    pode_aprovar: true,
    setores_acesso: ['ASS'],
    modulos_acesso: {
      administrativo: false,
      financeiro: false,
      operacional: true,
      recursos_humanos: false,
    },
  },
  {
    id: '4',
    nome_completo: 'Roberto Carlos Gestor Obras',
    email: 'gestor.obras@minerva.com',
    role_nivel: 'GESTOR_OBRAS',
    setor: 'OBR',
    supervisor_id: '1',
    supervisor_nome: 'Carlos Alberto Diretor',
    status_colaborador: 'ativo',
    data_admissao: new Date('2021-08-10'),
    telefone: '+55 (11) 98765-4324',
    cpf: '456.789.012-33',
    avatar: 'RC',
    pode_delegar: true,
    pode_aprovar: true,
    setores_acesso: ['OBR'],
    modulos_acesso: {
      administrativo: false,
      financeiro: false,
      operacional: true,
      recursos_humanos: false,
    },
  },

  // ============================================
  // NÍVEL 2: COLABORADORES COMERCIAL
  // ============================================
  {
    id: '5',
    nome_completo: 'Ana Claudia Vendedora',
    email: 'vendedor.1@minerva.com',
    role_nivel: 'COLABORADOR_COMERCIAL',
    setor: 'COM',
    supervisor_id: '2',
    supervisor_nome: 'Maria Silva Gestora Comercial',
    status_colaborador: 'ativo',
    data_admissao: new Date('2022-01-15'),
    telefone: '+55 (11) 97654-3210',
    cpf: '567.890.123-44',
    avatar: 'AC',
    pode_delegar: false,
    pode_aprovar: false,
    setores_acesso: ['COM'],
    modulos_acesso: {
      administrativo: false,
      financeiro: false,
      operacional: true,
      recursos_humanos: false,
    },
  },
  {
    id: '6',
    nome_completo: 'Fernando Luis Vendedor',
    email: 'vendedor.2@minerva.com',
    role_nivel: 'COLABORADOR_COMERCIAL',
    setor: 'COM',
    supervisor_id: '2',
    supervisor_nome: 'Maria Silva Gestora Comercial',
    status_colaborador: 'ativo',
    data_admissao: new Date('2022-03-20'),
    telefone: '+55 (11) 96543-2109',
    cpf: '678.901.234-55',
    avatar: 'FL',
    pode_delegar: false,
    pode_aprovar: false,
    setores_acesso: ['COM'],
    modulos_acesso: {
      administrativo: false,
      financeiro: false,
      operacional: true,
      recursos_humanos: false,
    },
  },

  // ============================================
  // NÍVEL 2: COLABORADORES ASSESSORIA
  // ============================================
  {
    id: '7',
    nome_completo: 'Bruno Martins Técnico',
    email: 'tecnico.ass.1@minerva.com',
    role_nivel: 'COLABORADOR_ASSESSORIA',
    setor: 'ASS',
    supervisor_id: '3',
    supervisor_nome: 'João Pedro Gestor Assessoria',
    status_colaborador: 'ativo',
    data_admissao: new Date('2022-05-10'),
    telefone: '+55 (11) 95432-1098',
    cpf: '789.012.345-66',
    avatar: 'BM',
    pode_delegar: false,
    pode_aprovar: false,
    setores_acesso: ['ASS'],
    modulos_acesso: {
      administrativo: false,
      financeiro: false,
      operacional: true,
      recursos_humanos: false,
    },
  },
  {
    id: '8',
    nome_completo: 'Fabiana Souza Técnica',
    email: 'tecnico.ass.2@minerva.com',
    role_nivel: 'COLABORADOR_ASSESSORIA',
    setor: 'ASS',
    supervisor_id: '3',
    supervisor_nome: 'João Pedro Gestor Assessoria',
    status_colaborador: 'ativo',
    data_admissao: new Date('2022-07-01'),
    telefone: '+55 (11) 94321-0987',
    cpf: '890.123.456-77',
    avatar: 'FS',
    pode_delegar: false,
    pode_aprovar: false,
    setores_acesso: ['ASS'],
    modulos_acesso: {
      administrativo: false,
      financeiro: false,
      operacional: true,
      recursos_humanos: false,
    },
  },

  // ============================================
  // NÍVEL 2: COLABORADORES OBRAS
  // ============================================
  {
    id: '9',
    nome_completo: 'Marcelo Costa Encarregado',
    email: 'encarregado.1@minerva.com',
    role_nivel: 'COLABORADOR_OBRAS',
    setor: 'OBR',
    supervisor_id: '4',
    supervisor_nome: 'Roberto Carlos Gestor Obras',
    status_colaborador: 'ativo',
    data_admissao: new Date('2022-09-05'),
    telefone: '+55 (11) 93210-9876',
    cpf: '901.234.567-88',
    avatar: 'MC',
    pode_delegar: false,
    pode_aprovar: false,
    setores_acesso: ['OBR'],
    modulos_acesso: {
      administrativo: false,
      financeiro: false,
      operacional: true,
      recursos_humanos: false,
    },
  },
  {
    id: '10',
    nome_completo: 'Juliana Ribeiro Encarregada',
    email: 'encarregado.2@minerva.com',
    role_nivel: 'COLABORADOR_OBRAS',
    setor: 'OBR',
    supervisor_id: '4',
    supervisor_nome: 'Roberto Carlos Gestor Obras',
    status_colaborador: 'ativo',
    data_admissao: new Date('2022-11-15'),
    telefone: '+55 (11) 92109-8765',
    cpf: '012.345.678-99',
    avatar: 'JR',
    pode_delegar: false,
    pode_aprovar: false,
    setores_acesso: ['OBR'],
    modulos_acesso: {
      administrativo: false,
      financeiro: false,
      operacional: true,
      recursos_humanos: false,
    },
  },

  // ============================================
  // NÍVEL 1: MÃO DE OBRA (MOBRA) - SEM ACESSO
  // ============================================
  {
    id: '11',
    nome_completo: 'José Silva da Costa Servente',
    email: 'mobra.servente.1@minerva.com',
    role_nivel: 'MOBRA',
    setor: 'OBR',
    supervisor_id: '4',
    supervisor_nome: 'Roberto Carlos Gestor Obras',
    status_colaborador: 'ativo',
    data_admissao: new Date('2023-01-10'),
    telefone: '+55 (11) 91098-7654',
    cpf: '111.222.333-00',
    avatar: 'JS',
    pode_delegar: false,
    pode_aprovar: false,
    setores_acesso: [],
    modulos_acesso: {
      administrativo: false,
      financeiro: false,
      operacional: false,
      recursos_humanos: false,
    },
  },
  {
    id: '12',
    nome_completo: 'Antonio Pereira Meio Oficial',
    email: 'mobra.meiooficial.1@minerva.com',
    role_nivel: 'MOBRA',
    setor: 'OBR',
    supervisor_id: '4',
    supervisor_nome: 'Roberto Carlos Gestor Obras',
    status_colaborador: 'ativo',
    data_admissao: new Date('2023-02-20'),
    telefone: '+55 (11) 90987-6543',
    cpf: '222.333.444-11',
    avatar: 'AP',
    pode_delegar: false,
    pode_aprovar: false,
    setores_acesso: [],
    modulos_acesso: {
      administrativo: false,
      financeiro: false,
      operacional: false,
      recursos_humanos: false,
    },
  },
  {
    id: '13',
    nome_completo: 'Valdemir Gonçalves Oficial',
    email: 'mobra.oficial.1@minerva.com',
    role_nivel: 'MOBRA',
    setor: 'OBR',
    supervisor_id: '4',
    supervisor_nome: 'Roberto Carlos Gestor Obras',
    status_colaborador: 'ativo',
    data_admissao: new Date('2023-03-15'),
    telefone: '+55 (11) 89876-5432',
    cpf: '333.444.555-22',
    avatar: 'VG',
    pode_delegar: false,
    pode_aprovar: false,
    setores_acesso: [],
    modulos_acesso: {
      administrativo: false,
      financeiro: false,
      operacional: false,
      recursos_humanos: false,
    },
  },
];

export const mockOrdensServico: OrdemServico[] = [
  {
    id: '1',
    codigo: 'OS-2024-001',
    cliente: 'Construtora ABC Ltda',
    tipo: 'Projeto Estrutural',
    descricao: 'Elaboração de projeto estrutural para edifício residencial de 10 pavimentos',
    status: 'EM_ANDAMENTO',
    setor: 'ASS',
    responsavel: mockUsers[1],
    prazoInicio: '2024-11-01',
    prazoFim: '2024-11-30',
    createdAt: '2024-11-01T08:00:00Z',
    updatedAt: '2024-11-09T10:30:00Z',
    numeroEtapaAtual: 5,
    statusEtapaAtual: 'EM_ANDAMENTO',
    etapaAtual: {
      numero: 5,
      titulo: 'Realizar Visita',
      status: 'EM_ANDAMENTO'
    }
  },
  {
    id: '2',
    codigo: 'OS-2024-002',
    cliente: 'Incorporadora XYZ',
    tipo: 'Consultoria Técnica',
    descricao: 'Consultoria para aprovação de projeto junto à prefeitura',
    status: 'EM_TRIAGEM',
    setor: 'ASS',
    responsavel: mockUsers[0],
    prazoInicio: '2024-11-08',
    prazoFim: '2024-11-15',
    createdAt: '2024-11-08T09:00:00Z',
    updatedAt: '2024-11-08T09:00:00Z',
    numeroEtapaAtual: 1,
    statusEtapaAtual: 'PENDENTE',
    etapaAtual: {
      numero: 1,
      titulo: 'Identificação do Cliente/Lead',
      status: 'PENDENTE'
    }
  },
  {
    id: '3',
    codigo: 'OS-2024-003',
    cliente: 'Empreendimentos Delta',
    tipo: 'Fiscalização de Obra',
    descricao: 'Fiscalização e acompanhamento de obra de fundação',
    status: 'EM_VALIDACAO',
    setor: 'OBR',
    responsavel: mockUsers[2],
    prazoInicio: '2024-10-15',
    prazoFim: '2024-11-10',
    createdAt: '2024-10-15T08:00:00Z',
    updatedAt: '2024-11-08T16:45:00Z',
    numeroEtapaAtual: 12,
    statusEtapaAtual: 'AGUARDANDO_APROVACAO',
    etapaAtual: {
      numero: 12,
      titulo: 'Follow-up 3: Pós-Apresentação',
      status: 'AGUARDANDO_APROVACAO'
    }
  },
  {
    id: '4',
    codigo: 'OS-2024-004',
    cliente: 'Construtora Sigma',
    tipo: 'Laudo Técnico',
    descricao: 'Laudo de avaliação de imóvel para financiamento',
    status: 'CONCLUIDA',
    setor: 'ASS',
    responsavel: mockUsers[1],
    prazoInicio: '2024-10-20',
    prazoFim: '2024-11-05',
    createdAt: '2024-10-20T08:00:00Z',
    updatedAt: '2024-11-05T14:20:00Z',
    numeroEtapaAtual: 15,
    statusEtapaAtual: 'APROVADA',
    etapaAtual: {
      numero: 15,
      titulo: 'Iniciar Contrato de Obra',
      status: 'APROVADA'
    }
  },
  {
    id: '5',
    codigo: 'OS-2024-005',
    cliente: 'Grupo Omega',
    tipo: 'Projeto Hidrossanitário',
    descricao: 'Projeto hidrossanitário para complexo comercial',
    status: 'EM_ANDAMENTO',
    setor: 'ASS',
    responsavel: mockUsers[1],
    prazoInicio: '2024-11-05',
    prazoFim: '2024-12-05',
    createdAt: '2024-11-05T08:00:00Z',
    updatedAt: '2024-11-07T11:15:00Z',
    numeroEtapaAtual: 8,
    statusEtapaAtual: 'EM_ANDAMENTO',
    etapaAtual: {
      numero: 8,
      titulo: 'Precificação',
      status: 'EM_ANDAMENTO'
    }
  },
  {
    id: '6',
    codigo: 'OS-2024-006',
    cliente: 'Incorporadora Beta',
    tipo: 'Vistoria Técnica',
    descricao: 'Vistoria cautelar pré-obra em imóveis vizinhos',
    status: 'EM_TRIAGEM',
    setor: 'OBR',
    responsavel: mockUsers[2],
    prazoInicio: '2024-11-09',
    prazoFim: '2024-11-12',
    createdAt: '2024-11-09T08:00:00Z',
    updatedAt: '2024-11-09T08:00:00Z',
    numeroEtapaAtual: 2,
    statusEtapaAtual: 'PENDENTE',
    etapaAtual: {
      numero: 2,
      titulo: 'Seleção do Tipo de OS',
      status: 'PENDENTE'
    }
  }
];

// ============================================================
// ETAPAS MOCKADAS POR OS
// ============================================================

import type { OsEtapa } from './hooks/use-etapas';

export const mockEtapas: OsEtapa[] = [
  // OS 1 - Em andamento na etapa 5
  { id: 'e1-1', os_id: '1', ordem: 1, nome_etapa: 'Identificação do Cliente/Lead', status: 'APROVADA', dados_etapa: { leadId: 'L1' }, data_inicio: '2024-11-01T08:00:00Z', data_conclusao: '2024-11-01T09:30:00Z' },
  { id: 'e1-2', os_id: '1', ordem: 2, nome_etapa: 'Seleção do Tipo de OS', status: 'APROVADA', dados_etapa: { tipoOS: '01' }, data_inicio: '2024-11-01T10:00:00Z', data_conclusao: '2024-11-01T11:00:00Z' },
  { id: 'e1-3', os_id: '1', ordem: 3, nome_etapa: 'Follow-up 1: Entrevista Inicial', status: 'APROVADA', dados_etapa: { observacoes: 'Cliente interessado' }, data_inicio: '2024-11-02T08:00:00Z', data_conclusao: '2024-11-02T12:00:00Z' },
  { id: 'e1-4', os_id: '1', ordem: 4, nome_etapa: 'Agendar Visita Técnica', status: 'APROVADA', dados_etapa: { dataVisita: '2024-11-05', horaVisita: '14:00' }, data_inicio: '2024-11-02T14:00:00Z', data_conclusao: '2024-11-03T09:00:00Z' },
  { id: 'e1-5', os_id: '1', ordem: 5, nome_etapa: 'Realizar Visita', status: 'EM_ANDAMENTO', dados_etapa: { observacoes: 'Visita parcialmente realizada' }, data_inicio: '2024-11-05T14:00:00Z' },
  { id: 'e1-6', os_id: '1', ordem: 6, nome_etapa: 'Follow-up 2: Pós-Visita', status: 'PENDENTE', dados_etapa: null },
  { id: 'e1-7', os_id: '1', ordem: 7, nome_etapa: 'Formulário Memorial (Escopo)', status: 'PENDENTE', dados_etapa: null },
  { id: 'e1-8', os_id: '1', ordem: 8, nome_etapa: 'Precificação', status: 'PENDENTE', dados_etapa: null },

  // OS 2 - Em triagem na etapa 1
  { id: 'e2-1', os_id: '2', ordem: 1, nome_etapa: 'Identificação do Cliente/Lead', status: 'PENDENTE', dados_etapa: null },

  // OS 3 - Em validação na etapa 12
  { id: 'e3-1', os_id: '3', ordem: 1, nome_etapa: 'Identificação do Cliente/Lead', status: 'APROVADA', dados_etapa: { leadId: 'L4' }, data_inicio: '2024-10-15T08:00:00Z', data_conclusao: '2024-10-15T10:00:00Z' },
  { id: 'e3-2', os_id: '3', ordem: 2, nome_etapa: 'Seleção do Tipo de OS', status: 'APROVADA', dados_etapa: { tipoOS: '03' }, data_inicio: '2024-10-15T10:30:00Z', data_conclusao: '2024-10-15T11:00:00Z' },
  { id: 'e3-3', os_id: '3', ordem: 3, nome_etapa: 'Follow-up 1: Entrevista Inicial', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-10-16T12:00:00Z' },
  { id: 'e3-4', os_id: '3', ordem: 4, nome_etapa: 'Agendar Visita Técnica', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-10-18T09:00:00Z' },
  { id: 'e3-5', os_id: '3', ordem: 5, nome_etapa: 'Realizar Visita', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-10-20T16:00:00Z' },
  { id: 'e3-6', os_id: '3', ordem: 6, nome_etapa: 'Follow-up 2: Pós-Visita', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-10-22T10:00:00Z' },
  { id: 'e3-7', os_id: '3', ordem: 7, nome_etapa: 'Formulário Memorial (Escopo)', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-10-25T15:00:00Z' },
  { id: 'e3-8', os_id: '3', ordem: 8, nome_etapa: 'Precificação', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-10-28T11:00:00Z' },
  { id: 'e3-9', os_id: '3', ordem: 9, nome_etapa: 'Gerar Proposta Comercial', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-10-30T14:00:00Z' },
  { id: 'e3-10', os_id: '3', ordem: 10, nome_etapa: 'Agendar Visita (Apresentação)', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-11-01T09:00:00Z' },
  { id: 'e3-11', os_id: '3', ordem: 11, nome_etapa: 'Realizar Visita (Apresentação)', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-11-05T16:00:00Z' },
  { id: 'e3-12', os_id: '3', ordem: 12, nome_etapa: 'Follow-up 3: Pós-Apresentação', status: 'AGUARDANDO_APROVACAO', dados_etapa: { observacoes: 'Aguardando aprovação do gestor' }, data_inicio: '2024-11-06T08:00:00Z' },

  // OS 5 - Em andamento na etapa 8
  { id: 'e5-1', os_id: '5', ordem: 1, nome_etapa: 'Identificação do Cliente/Lead', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-11-05T09:00:00Z' },
  { id: 'e5-2', os_id: '5', ordem: 2, nome_etapa: 'Seleção do Tipo de OS', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-11-05T10:00:00Z' },
  { id: 'e5-3', os_id: '5', ordem: 3, nome_etapa: 'Follow-up 1: Entrevista Inicial', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-11-05T14:00:00Z' },
  { id: 'e5-4', os_id: '5', ordem: 4, nome_etapa: 'Agendar Visita Técnica', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-11-05T16:00:00Z' },
  { id: 'e5-5', os_id: '5', ordem: 5, nome_etapa: 'Realizar Visita', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-11-06T15:00:00Z' },
  { id: 'e5-6', os_id: '5', ordem: 6, nome_etapa: 'Follow-up 2: Pós-Visita', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-11-06T17:00:00Z' },
  { id: 'e5-7', os_id: '5', ordem: 7, nome_etapa: 'Formulário Memorial (Escopo)', status: 'APROVADA', dados_etapa: {}, data_conclusao: '2024-11-07T10:00:00Z' },
  { id: 'e5-8', os_id: '5', ordem: 8, nome_etapa: 'Precificação', status: 'EM_ANDAMENTO', dados_etapa: { valorParcial: 150000 }, data_inicio: '2024-11-07T11:00:00Z' },
];

export const mockComentarios: Comentario[] = [
  {
    id: '1',
    osId: '1',
    userId: '1',
    userName: 'João Silva',
    userAvatar: 'JS',
    texto: 'Projeto em andamento conforme cronograma. Etapa de dimensionamento concluída.',
    createdAt: '2024-11-07T14:30:00Z'
  },
  {
    id: '2',
    osId: '1',
    userId: '2',
    userName: 'Maria Santos',
    userAvatar: 'MS',
    texto: 'Cliente solicitou revisão no posicionamento dos pilares P3 e P4.',
    createdAt: '2024-11-08T10:15:00Z'
  },
  {
    id: '3',
    osId: '1',
    userId: '1',
    userName: 'João Silva',
    userAvatar: 'JS',
    texto: 'Revisão aprovada. Atualizando prancha 02/15.',
    createdAt: '2024-11-09T09:45:00Z'
  }
];

export const mockDocumentos: Documento[] = [
  {
    id: '1',
    osId: '1',
    nome: 'Memorial_Calculo_Estrutural.pdf',
    tipo: 'application/pdf',
    url: '#',
    uploadedAt: '2024-11-05T16:20:00Z',
    uploadedBy: 'Maria Santos'
  },
  {
    id: '2',
    osId: '1',
    nome: 'Prancha_01_Planta_Locacao.pdf',
    tipo: 'application/pdf',
    url: '#',
    uploadedAt: '2024-11-06T11:30:00Z',
    uploadedBy: 'Maria Santos'
  },
  {
    id: '3',
    osId: '1',
    nome: 'Prancha_02_Planta_Forma.pdf',
    tipo: 'application/pdf',
    url: '#',
    uploadedAt: '2024-11-07T09:10:00Z',
    uploadedBy: 'Maria Santos'
  }
];

export const mockHistorico: HistoricoItem[] = [
  {
    id: '1',
    osId: '1',
    tipo: 'status',
    descricao: 'OS criada e atribuída para Maria Santos',
    userName: 'João Silva',
    createdAt: '2024-11-01T08:00:00Z'
  },
  {
    id: '2',
    osId: '1',
    tipo: 'status',
    descricao: 'Status alterado de "Triagem" para "Em Andamento"',
    userName: 'Maria Santos',
    createdAt: '2024-11-01T10:30:00Z'
  },
  {
    id: '3',
    osId: '1',
    tipo: 'documento',
    descricao: 'Documento "Memorial_Calculo_Estrutural.pdf" enviado',
    userName: 'Maria Santos',
    createdAt: '2024-11-05T16:20:00Z'
  },
  {
    id: '4',
    osId: '1',
    tipo: 'documento',
    descricao: 'Documento "Prancha_01_Planta_Locacao.pdf" enviado',
    userName: 'Maria Santos',
    createdAt: '2024-11-06T11:30:00Z'
  },
  {
    id: '5',
    osId: '1',
    tipo: 'comentario',
    descricao: 'Novo comentário adicionado',
    userName: 'João Silva',
    createdAt: '2024-11-07T14:30:00Z'
  },
  {
    id: '6',
    osId: '1',
    tipo: 'comentario',
    descricao: 'Novo comentário adicionado',
    userName: 'Maria Santos',
    createdAt: '2024-11-08T10:15:00Z'
  },
  {
    id: '7',
    osId: '1',
    tipo: 'documento',
    descricao: 'Documento "Prancha_02_Planta_Forma.pdf" enviado',
    userName: 'Maria Santos',
    createdAt: '2024-11-07T09:10:00Z'
  },
  {
    id: '8',
    osId: '1',
    tipo: 'comentario',
    descricao: 'Novo comentário adicionado',
    userName: 'João Silva',
    createdAt: '2024-11-09T09:45:00Z'
  }
];