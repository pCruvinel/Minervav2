"use client";

/**
 * EXEMPLO DE INTEGRAÇÃO COM API SUPABASE
 * 
 * Esta é uma versão CONECTADA da OSListPage que usa dados reais do Supabase
 * em vez de mock data.
 * 
 * Para usar esta versão, substitua a importação em App.tsx:
 * - De: import { OSListPage } from './components/os/os-list-page'
 * - Para: import { OSListPage } from './components/os/os-list-page-connected'
 */

import React, { useState } from 'react';
import { useApi } from '../../lib/hooks/use-api';
import { ordensServicoAPI } from '../../lib/api-client';
import { OSListHeader } from './os-list-header';
import { OSFiltersCard } from './os-filters-card';
import { OSTable } from './os-table';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export function OSListPageConnected() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [selectedResponsavel, setSelectedResponsavel] = useState<string>('');

  // Buscar OS da API
  const { 
    data: ordensServico, 
    loading, 
    error,
    refetch 
  } = useApi(
    () => ordensServicoAPI.list({
      status: selectedStatus || undefined,
    }),
    {
      onSuccess: (data) => {
        console.log('✅ OS carregadas com sucesso:', data.length, 'registros');
      },
      onError: (error) => {
        console.error('❌ Erro ao carregar OS:', error);
      },
    }
  );

  // Aplicar filtros locais (que não estão na API ainda)
  const filteredOS = React.useMemo(() => {
    if (!ordensServico) return [];

    return ordensServico.filter(os => {
      // Filtro de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          os.codigo_os?.toLowerCase().includes(searchLower) ||
          os.cliente?.nome_razao_social?.toLowerCase().includes(searchLower) ||
          os.descricao?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtro de tipo (se disponível)
      if (selectedTipo && os.tipo_os?.codigo !== selectedTipo) {
        return false;
      }

      // Filtro de responsável (se disponível)
      if (selectedResponsavel && os.responsavel_id !== selectedResponsavel) {
        return false;
      }

      return true;
    });
  }, [ordensServico, searchTerm, selectedTipo, selectedResponsavel]);

  // Handler para limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedTipo('');
    setSelectedResponsavel('');
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <OSListHeader onSearch={setSearchTerm} searchTerm={searchTerm} />

      {/* Alert de Conexão com API */}
      <Alert className="border-green-200 bg-green-50">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          🟢 <strong>Conectado ao Supabase!</strong> Esta página está exibindo dados reais do banco de dados.
          {ordensServico && ` ${ordensServico.length} OS encontradas.`}
        </AlertDescription>
      </Alert>

      {/* Filtros */}
      <OSFiltersCard
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedTipo={selectedTipo}
        onTipoChange={setSelectedTipo}
        selectedResponsavel={selectedResponsavel}
        onResponsavelChange={setSelectedResponsavel}
        onClearFilters={handleClearFilters}
        onRefresh={refetch}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Carregando ordens de serviço...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro ao carregar OS:</strong> {error.message}
            <br />
            <button 
              onClick={refetch}
              className="mt-2 underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabela de OS */}
      {!loading && !error && (
        <OSTable 
          ordensServico={filteredOS}
          isConnected={true}
        />
      )}

      {/* Empty State */}
      {!loading && !error && filteredOS.length === 0 && ordensServico && ordensServico.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhuma OS encontrada com os filtros aplicados. 
            <button 
              onClick={handleClearFilters}
              className="ml-2 underline hover:no-underline"
            >
              Limpar filtros
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Truly Empty State */}
      {!loading && !error && ordensServico && ordensServico.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhuma ordem de serviço cadastrada no sistema. 
            Crie a primeira OS para começar!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
