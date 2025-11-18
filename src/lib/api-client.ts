import { projectId, publicAnonKey } from '../utils/supabase/info';

// API HABILITADA - Conectado ao Supabase
const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5ad7fd2c`;
const FRONTEND_ONLY_MODE = false; // Backend habilitado

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, string>;
}

// Mock de dados para modo frontend
const mockDatabase = {
  clientes: [] as any[],
  ordens_servico: [] as any[],
};

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  if (FRONTEND_ONLY_MODE) {
    console.log(`🎭 MOCK API: ${options.method || 'GET'} ${endpoint}`);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Retornar dados mock baseado no endpoint
    if (endpoint.includes('/clientes')) {
      return mockDatabase.clientes as T;
    }
    
    if (endpoint.includes('/ordens-servico')) {
      return mockDatabase.ordens_servico as T;
    }
    
    return {} as T;
  }
  
  // Código original (usado quando FRONTEND_ONLY_MODE = false)
  const { method = 'GET', body, params } = options;
  
  // Construir URL com query params
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
  };
  
  const config: RequestInit = {
    method,
    headers,
  };
  
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }
  
  try {
    console.log(`🚀 API Request: ${method} ${url.toString()}`);
    const response = await fetch(url.toString(), config);
    
    console.log(`📡 API Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error || `Erro ${response.status}: ${response.statusText}`;
      console.error(`❌ API Error Response:`, errorData);
      throw new Error(errorMsg);
    }
    
    const data = await response.json();
    console.log(`✅ API Success:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Erro na requisição ${method} ${endpoint}:`, error);
    throw error;
  }
}

// ==================== CLIENTES/LEADS API ====================

export const clientesAPI = {
  // Listar todos os clientes/leads
  list: (status?: string) => 
    apiRequest<any[]>('/clientes', { params: status ? { status } : undefined }),
  
  // Buscar cliente por ID
  getById: (id: string) => 
    apiRequest<any>(`/clientes/${id}`),
  
  // Criar novo cliente/lead
  create: (data: any) => 
    apiRequest<any>('/clientes', { method: 'POST', body: data }),
  
  // Atualizar cliente
  update: (id: string, data: any) => 
    apiRequest<any>(`/clientes/${id}`, { method: 'PUT', body: data }),
};

// ==================== ORDENS DE SERVIÇO API ====================

export const ordensServicoAPI = {
  // Listar todas as OS
  list: (filters?: { status?: string; tipo?: string }) => 
    apiRequest<any[]>('/ordens-servico', { params: filters }),
  
  // Buscar OS por ID
  getById: (id: string) => 
    apiRequest<any>(`/ordens-servico/${id}`),
  
  // Criar nova OS
  create: (data: any) => 
    apiRequest<any>('/ordens-servico', { method: 'POST', body: data }),
  
  // Atualizar OS
  update: (id: string, data: any) => 
    apiRequest<any>(`/ordens-servico/${id}`, { method: 'PUT', body: data }),
  
  // Listar etapas de uma OS
  getEtapas: (osId: string) => 
    apiRequest<any[]>(`/ordens-servico/${osId}/etapas`),
  
  // Criar etapa
  createEtapa: (osId: string, data: any) => 
    apiRequest<any>(`/ordens-servico/${osId}/etapas`, { method: 'POST', body: data }),
  
  // Atualizar etapa
  updateEtapa: (etapaId: string, data: any) => 
    apiRequest<any>(`/etapas/${etapaId}`, { method: 'PUT', body: data }),
  
  // Listar tipos de OS
  getTiposOS: () =>
    apiRequest<any[]>('/tipos-os'),

  // ==================== DELEGAÇÕES ====================

  // Criar nova delegação
  createDelegacao: (data: {
    os_id: string;
    delegante_id: string;
    delegado_id: string;
    descricao_tarefa: string;
    observacoes?: string;
    data_prazo?: string;
    status_delegacao?: string;
  }) =>
    apiRequest<any>('/delegacoes', { method: 'POST', body: data }),

  // Listar delegações de uma OS
  getDelegacoes: (osId: string) =>
    apiRequest<any[]>(`/ordens-servico/${osId}/delegacoes`),

  // Listar delegações de um colaborador (como delegado)
  getDelegacoesColaborador: (colaboradorId: string) =>
    apiRequest<any[]>(`/delegacoes/delegado/${colaboradorId}`),

  // Atualizar status de delegação
  updateDelegacao: (id: string, data: {
    status_delegacao?: string;
    observacoes?: string;
  }) =>
    apiRequest<any>(`/delegacoes/${id}`, { method: 'PUT', body: data }),

  // Deletar delegação (apenas se PENDENTE)
  deleteDelegacao: (id: string) =>
    apiRequest<any>(`/delegacoes/${id}`, { method: 'DELETE' }),
};

// ==================== TIPOS DE OS API ====================

export const tiposOSAPI = {
  // Listar todos os tipos de OS
  list: () => 
    apiRequest<any[]>('/tipos-os'),
};

// ==================== HEALTH CHECK ====================

export const healthCheck = () => 
  apiRequest<{ status: string }>('/health');