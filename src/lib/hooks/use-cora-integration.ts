
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

// ============================================================
// TYPES
// ============================================================

export interface CoraIntegrationConfig {
  id: string;
  banco: 'cora';
  ambiente: 'stage' | 'production';
  client_id: string;
  // Indicadores de existência (nunca retornamos os valores sensíveis)
  has_private_key?: boolean;
  has_certificate?: boolean;
  certificado_url: string | null;
  chave_url: string | null;
  webhook_secret: string | null;
  ativo: boolean;
  ultima_sincronizacao: string | null;
  updated_at: string;
}

export interface SaveCoraConfigParams {
  ambiente: 'stage' | 'production';
  client_id: string;
  certificate?: string; // Conteúdo do certificado (PEM format)
  private_key?: string; // Conteúdo da chave privada (PEM format)
  ativo: boolean;
}

// ============================================================
// HOOKS
// ============================================================

export function useCoraIntegration() {
  const queryClient = useQueryClient();

  // 1. Buscar configuração atual
  const query = useQuery({
    queryKey: ['cora-integration'],
    queryFn: async (): Promise<CoraIntegrationConfig | null> => {
      const { data, error } = await supabase
        .from('integracoes_bancarias')
        .select('*')
        .eq('banco', 'cora')
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;

      // Mascarar campos sensíveis para o frontend
      return {
        id: data.id,
        banco: data.banco,
        ambiente: data.ambiente,
        client_id: data.client_id,
        has_private_key: !!data.private_key,
        has_certificate: !!data.certificate,
        certificado_url: data.certificado_url,
        chave_url: data.chave_url,
        webhook_secret: data.webhook_secret,
        ativo: data.ativo,
        ultima_sincronizacao: data.ultima_sincronizacao,
        updated_at: data.updated_at,
      } as CoraIntegrationConfig;
    },
  });

  // 2. Salvar configuração (Upsert)
  const saveMutation = useMutation({
    mutationFn: async (params: SaveCoraConfigParams) => {
      console.log('🔄 [Hook] saveMutation started with params:', {
        ambiente: params.ambiente,
        client_id: params.client_id,
        ativo: params.ativo,
      });
      
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('integracoes_bancarias')
        .select('id')
        .eq('banco', 'cora')
        .maybeSingle();

      console.log('🔍 [Hook] Existing config:', existing);

      const payload: Record<string, unknown> = {
        banco: 'cora',
        ambiente: params.ambiente,
        client_id: params.client_id,
        ativo: params.ativo,
        updated_at: new Date().toISOString(),
      };

      // REMOVIDO: update de certificado/chave via frontend
      // Devem ser inseridos via banco de dados diretamente

      let error;
      
      if (existing?.id) {
        console.log('🔄 [Hook] Updating existing record:', existing.id);
        const { error: updateError } = await supabase
          .from('integracoes_bancarias')
          .update(payload)
          .eq('id', existing.id);
        error = updateError;
      } else {
        console.log('➕ [Hook] Creating new record');
        const { error: insertError } = await supabase
          .from('integracoes_bancarias')
          .insert(payload);
        error = insertError;
      }

      if (error) {
        console.error('❌ [Hook] Database error:', error);
        throw error;
      }
      
      console.log('✅ [Hook] Save completed successfully');
    },
    onSuccess: () => {
      console.log('🎉 [Hook] onSuccess callback triggered');
      queryClient.invalidateQueries({ queryKey: ['cora-integration'] });
      toast.success('Configuração salva com sucesso');
    },
    onError: (error: Error) => {
      console.error('💥 [Hook] onError callback triggered:', error);
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  // 3. Testar Conexão (Chama Edge Function /auth/test)
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      // Get the session for authorization header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Call Edge Function directly with fetch for more control
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zxfevlkssljndqqhxkjb.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/cora-integration/auth/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMsg = 'Falha na conexão';
        const errorText = await response.text();
        
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.error || errorData.message || errorText;
          
          if (errorData.logs && Array.isArray(errorData.logs)) {
            console.group('🚨 CORA SERVER DEBUG LOGS');
            errorData.logs.forEach((log: string) => console.log(log));
            console.groupEnd();
            console.log('📋 COPIE OS LOGS ACIMA E ENVIE PARA O DEV');
          }
        } catch (e) {
          // Não é JSON, usar texto puro
          errorMsg = errorText || `Erro interno (${response.status})`;
          console.error('Edge Function Raw Error:', errorText);
        }

        throw new Error(`Erro ${response.status}: ${errorMsg}`);
      }

      const data = await response.json();
      
      // Check for API response errors  
      if (!data || !data.success) {
        throw new Error(data?.error || 'Falha na autenticação mTLS com Banco Cora');
      }

      return { success: true, message: data.message || 'Conexão mTLS estabelecida com sucesso!' };
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    config: query.data,
    isLoading: query.isLoading,
    saveConfig: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    testConnection: testConnectionMutation.mutateAsync,
    isTesting: testConnectionMutation.isPending,
  };
}
