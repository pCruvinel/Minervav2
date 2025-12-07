/**
 * Hook: useOSWorkflows
 * 
 * Hook centralizado para gerenciar dados das OS-10, OS-11, OS-12
 * - Centros de Custo
 * - Cargos para Recrutamento
 * - Colaboradores por Função
 * - Turnos e Agendamentos
 * - PDF Generation
 */

// React hooks não usados removidos para evitar warnings ESLint
import { useApi, useMutation } from './use-api';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

// =====================================================
// TYPES
// =====================================================

export interface CentroCusto {
  id: string;
  nome: string;
  valor_global: number;
  cliente_id: string | null;
  ativo: boolean;
  tipo_os_id: string | null;
  descricao: string | null;
  cliente?: {
    nome_razao_social: string;
  };
}

export interface Cargo {
  id: string;
  nome: string;
  slug: string;
  nivel_acesso: number;
  descricao: string | null;
  ativo: boolean;
}

export interface Colaborador {
  id: string;
  nome_completo: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  cargo_id: string | null;
  setor_id: string | null;
  ativo: boolean;
  funcao: string | null;
  tipo_contratacao: 'CLT' | 'PJ' | 'ESTAGIO' | null;
  avatar_url: string | null;
  cargo?: Cargo;
  setor?: {
    id: string;
    nome: string;
    slug: string;
  };
}

export interface Setor {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  ativo: boolean;
}

export interface TipoOS {
  id: string;
  nome: string;
  codigo: string;
  setor_padrao_id: string | null;
  ativo: boolean;
}

export interface Turno {
  id: string;
  hora_inicio: string;
  hora_fim: string;
  vagas_total: number;
  setores: string[];
  cor: string;
  ativo: boolean;
  tipo_recorrencia: 'todos' | 'uteis' | 'custom';
  data_inicio: string | null;
  data_fim: string | null;
  dias_semana: number[] | null;
}

// =====================================================
// API FUNCTIONS
// =====================================================

const workflowAPI = {
  /**
   * Listar Centros de Custo ativos
   */
  async listCentrosCusto(): Promise<CentroCusto[]> {
    const { data, error } = await supabase
      .from('centros_custo')
      .select(`
        *,
        cliente:cliente_id (nome_razao_social)
      `)
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  /**
   * Listar Cargos ativos
   */
  async listCargos(): Promise<Cargo[]> {
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  /**
   * Listar Colaboradores com cargo e setor
   */
  async listColaboradores(filters?: { 
    setor_id?: string; 
    cargo_id?: string;
    funcao?: string;
    ativo?: boolean 
  }): Promise<Colaborador[]> {
    let query = supabase
      .from('colaboradores')
      .select(`
        *,
        cargo:cargo_id (*),
        setor:setor_id (*)
      `)
      .order('nome_completo');

    if (filters?.setor_id) {
      query = query.eq('setor_id', filters.setor_id);
    }
    if (filters?.cargo_id) {
      query = query.eq('cargo_id', filters.cargo_id);
    }
    if (filters?.funcao) {
      query = query.eq('funcao', filters.funcao);
    }
    if (filters?.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Listar Setores ativos
   */
  async listSetores(): Promise<Setor[]> {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  /**
   * Listar Tipos de OS
   */
  async listTiposOS(): Promise<TipoOS[]> {
    const { data, error } = await supabase
      .from('tipos_os')
      .select('*')
      .eq('ativo', true)
      .order('codigo');

    if (error) throw error;
    return data || [];
  },

  /**
   * Buscar Tipo de OS por código (ex: "OS-10")
   */
  async getTipoOSByCodigo(codigo: string): Promise<TipoOS | null> {
    const { data, error } = await supabase
      .from('tipos_os')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  /**
   * Listar Turnos ativos
   */
  async listTurnos(): Promise<Turno[]> {
    const { data, error } = await supabase
      .from('turnos')
      .select('*')
      .eq('ativo', true)
      .order('hora_inicio');

    if (error) throw error;
    return data || [];
  },

  /**
   * Criar OS completa com etapas
   * @param tipoOSCodigo - Código do tipo de OS (ex: "OS-13", "OS-09")
   * @param clienteId - ID do cliente
   * @param ccId - ID do centro de custo
   * @param responsavelId - ID do responsável
   * @param descricao - Descrição da OS
   * @param metadata - Metadados adicionais
   * @param etapas - Array de etapas a criar
   * @param parentOSId - ID da OS pai (para satélites e contratos)
   */
  async createOSComEtapas(
    tipoOSCodigo: string,
    clienteId: string,
    ccId: string,
    responsavelId: string | null,
    descricao: string,
    metadata: Record<string, unknown>,
    etapas: Array<{ nome_etapa: string; ordem: number; dados_etapa?: Record<string, unknown> }>,
    parentOSId?: string | null
  ): Promise<{ os: Record<string, unknown>; etapas: Record<string, unknown>[] }> {
    // 1. Buscar tipo de OS
    const tipoOS = await workflowAPI.getTipoOSByCodigo(tipoOSCodigo);
    if (!tipoOS) {
      throw new Error(`Tipo de OS ${tipoOSCodigo} não encontrado`);
    }

    // 2. Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser();

    // 3. Determinar se é um contrato ativo (OS-12 ou OS-13)
    const isContractActive = ['OS-12', 'OS-13'].includes(tipoOSCodigo);

    // 4. Criar OS
    const { data: osData, error: osError } = await supabase
      .from('ordens_servico')
      .insert({
        cliente_id: clienteId,
        tipo_os_id: tipoOS.id,
        responsavel_id: responsavelId,
        criado_por_id: user?.id,
        cc_id: ccId || null, // Tratar string vazia como null
        status_geral: 'em_triagem',
        descricao,
        metadata,
        data_entrada: new Date().toISOString(),
        parent_os_id: parentOSId || null,
        is_contract_active: isContractActive // ✅ Flag para contratos faturáveis
      })
      .select()
      .single();

    if (osError) throw osError;

    // 5. Criar etapas
    const etapasParaInserir = etapas.map((etapa, index) => ({
      os_id: osData.id,
      nome_etapa: etapa.nome_etapa,
      ordem: etapa.ordem || index + 1,
      status: index === 0 ? 'em_andamento' : 'pendente',
      dados_etapa: etapa.dados_etapa || {}
    }));

    const { data: etapasData, error: etapasError } = await supabase
      .from('os_etapas')
      .insert(etapasParaInserir)
      .select();

    if (etapasError) throw etapasError;

    logger.log('✅ OS criada com sucesso:', { os: osData, etapas: etapasData });

    return { os: osData, etapas: etapasData || [] };
  },

  /**
   * Salvar documento de OS
   */
  async uploadDocumentoOS(
    osId: string,
    etapaId: string | null,
    file: globalThis.File,
    tipo: string
  ): Promise<{ id: string; url: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Upload para Storage
    const fileName = `${osId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(`os-documentos/${fileName}`, file);

    if (uploadError) throw uploadError;

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(`os-documentos/${fileName}`);

    // Salvar registro no banco
    const { data, error } = await supabase
      .from('os_documentos')
      .insert({
        os_id: osId,
        etapa_id: etapaId,
        nome: file.name,
        tipo,
        caminho_arquivo: publicUrl,
        tamanho_bytes: file.size,
        mime_type: file.type,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    return { id: data.id, url: publicUrl };
  }
};

// =====================================================
// HOOKS
// =====================================================

/**
 * Hook para Centros de Custo
 */
export function useCentrosCusto() {
  const { data, loading, error, refetch } = useApi(
    workflowAPI.listCentrosCusto,
    {
      onError: (error) => {
        logger.error('Erro ao carregar centros de custo:', error);
        toast.error('Erro ao carregar centros de custo');
      }
    }
  );

  return {
    centrosCusto: data || [],
    loading,
    error,
    refetch
  };
}

/**
 * Hook para Cargos
 */
export function useCargos() {
  const { data, loading, error, refetch } = useApi(
    workflowAPI.listCargos,
    {
      onError: (error) => {
        logger.error('Erro ao carregar cargos:', error);
        toast.error('Erro ao carregar cargos');
      }
    }
  );

  return {
    cargos: data || [],
    loading,
    error,
    refetch
  };
}

/**
 * Hook para Colaboradores
 */
export function useColaboradores(filters?: { 
  setor_id?: string; 
  cargo_id?: string;
  funcao?: string;
  ativo?: boolean 
}) {
  const { data, loading, error, refetch } = useApi(
    () => workflowAPI.listColaboradores(filters),
    {
      deps: [filters?.setor_id, filters?.cargo_id, filters?.funcao, filters?.ativo],
      onError: (error) => {
        logger.error('Erro ao carregar colaboradores:', error);
        toast.error('Erro ao carregar colaboradores');
      }
    }
  );

  return {
    colaboradores: data || [],
    loading,
    error,
    refetch
  };
}

/**
 * Hook para Setores
 */
export function useSetores() {
  const { data, loading, error, refetch } = useApi(
    workflowAPI.listSetores,
    {
      onError: (error) => {
        logger.error('Erro ao carregar setores:', error);
        toast.error('Erro ao carregar setores');
      }
    }
  );

  return {
    setores: data || [],
    loading,
    error,
    refetch
  };
}

/**
 * Hook para Tipos de OS
 */
export function useTiposOS() {
  const { data, loading, error, refetch } = useApi(
    workflowAPI.listTiposOS,
    {
      onError: (error) => {
        logger.error('Erro ao carregar tipos de OS:', error);
        toast.error('Erro ao carregar tipos de OS');
      }
    }
  );

  return {
    tiposOS: data || [],
    loading,
    error,
    refetch
  };
}

/**
 * Hook para Turnos
 */
export function useTurnos() {
  const { data, loading, error, refetch } = useApi(
    workflowAPI.listTurnos,
    {
      onError: (error) => {
        logger.error('Erro ao carregar turnos:', error);
        toast.error('Erro ao carregar turnos');
      }
    }
  );

  return {
    turnos: data || [],
    loading,
    error,
    refetch
  };
}

/**
 * Hook para criar OS com etapas
 */
export function useCreateOSWorkflow() {
  return useMutation(
    (params: {
      tipoOSCodigo: string;
      clienteId: string;
      ccId: string;
      responsavelId: string | null;
      descricao: string;
      metadata: Record<string, unknown>;
      etapas: Array<{ nome_etapa: string; ordem: number; dados_etapa?: Record<string, unknown> }>;
      parentOSId?: string | null;
    }) => workflowAPI.createOSComEtapas(
      params.tipoOSCodigo,
      params.clienteId,
      params.ccId,
      params.responsavelId,
      params.descricao,
      params.metadata,
      params.etapas,
      params.parentOSId
    ),
    {
      onSuccess: (data) => {
        const osData = data.os as { codigo_os?: string };
        toast.success(`OS ${osData.codigo_os || ''} criada com sucesso!`);
      },
      onError: (error) => {
        logger.error('Erro ao criar OS:', error);
        toast.error(`Erro ao criar OS: ${error.message}`);
      }
    }
  );
}

/**
 * Hook para upload de documentos de OS
 */
export function useUploadDocumentoOS() {
  return useMutation(
    (params: { osId: string; etapaId: string | null; file: globalThis.File; tipo: string }) =>
      workflowAPI.uploadDocumentoOS(params.osId, params.etapaId, params.file, params.tipo),
    {
      onSuccess: () => {
        toast.success('Documento enviado com sucesso!');
      },
      onError: (error) => {
        logger.error('Erro ao enviar documento:', error);
        toast.error(`Erro ao enviar documento: ${error.message}`);
      }
    }
  );
}

// =====================================================
// FUNÇÕES DE LISTA (10 Funções do Sistema)
// =====================================================

/**
 * Lista das 10 funções existentes no sistema (RBAC Reestruturado)
 */
export const FUNCOES_COLABORADOR = [
  { slug: 'admin', nome: 'Admin', nivel: 10, acesso_sistema: true },
  { slug: 'diretor', nome: 'Diretor', nivel: 9, acesso_sistema: true },
  { slug: 'coord_administrativo', nome: 'Coordenador Administrativo', nivel: 6, acesso_sistema: true },
  { slug: 'coord_assessoria', nome: 'Coordenador de Assessoria', nivel: 5, acesso_sistema: true },
  { slug: 'coord_obras', nome: 'Coordenador de Obras', nivel: 5, acesso_sistema: true },
  { slug: 'operacional_admin', nome: 'Operacional Administrativo', nivel: 3, acesso_sistema: true },
  { slug: 'operacional_comercial', nome: 'Operacional Comercial', nivel: 3, acesso_sistema: true },
  { slug: 'operacional_assessoria', nome: 'Operacional Assessoria', nivel: 2, acesso_sistema: true },
  { slug: 'operacional_obras', nome: 'Operacional Obras', nivel: 2, acesso_sistema: true },
  { slug: 'colaborador_obra', nome: 'Colaborador Obra', nivel: 0, acesso_sistema: false },
] as const;

/**
 * Lista de tipos de contratação
 */
export const TIPOS_CONTRATACAO = [
  { value: 'CLT', label: 'CLT - Carteira Assinada' },
  { value: 'PJ', label: 'PJ - Pessoa Jurídica' },
  { value: 'ESTAGIO', label: 'Estágio' }
] as const;

/**
 * Lista de turnos padrão (exemplo)
 */
export const TURNOS_PADRAO = [
  { nome: 'Manhã', inicio: '08:00', fim: '12:00' },
  { nome: 'Tarde', inicio: '13:00', fim: '17:00' },
  { nome: 'Integral', inicio: '08:00', fim: '17:00' }
] as const;

/**
 * Lista de SLAs padrão para assessoria
 */
export const SLAS_ASSESSORIA = [
  { value: '4h', label: '4 horas', descricao: 'Resposta urgente' },
  { value: '8h', label: '8 horas', descricao: 'Resposta no mesmo dia útil' },
  { value: '24h', label: '24 horas', descricao: 'Resposta em 1 dia útil' },
  { value: '48h', label: '48 horas', descricao: 'Resposta em 2 dias úteis' },
  { value: '72h', label: '72 horas', descricao: 'Resposta em 3 dias úteis' }
] as const;

/**
 * Frequências de visita para assessoria recorrente
 */
export const FREQUENCIAS_VISITA = [
  { value: 'semanal', label: 'Semanal', descricao: '4 visitas/mês' },
  { value: 'quinzenal', label: 'Quinzenal', descricao: '2 visitas/mês' },
  { value: 'mensal', label: 'Mensal', descricao: '1 visita/mês' },
  { value: 'bimestral', label: 'Bimestral', descricao: '1 visita a cada 2 meses' },
  { value: 'trimestral', label: 'Trimestral', descricao: '1 visita a cada 3 meses' }
] as const;