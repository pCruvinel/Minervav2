// Página de Delegações - Sistema Hierárquico Minerva ERP
'use client';

import React, { useState } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { ListaDelegacoes } from './lista-delegacoes';
import { toast } from '../../lib/utils/safe-toast';
import { Delegacao } from '../../lib/types';

interface DelegacoesPageProps {
  onBack?: () => void;
}

export function DelegacoesPage({ onBack }: DelegacoesPageProps) {
  // Mock de delegações - em produção virá do Supabase
  const [delegacoes, setDelegacoes] = useState<Delegacao[]>([
    {
      id: 'del-1',
      os_id: 'os-1',
      delegante_id: '22222222-2222-2222-2222-222222222222',
      delegante_nome: 'Maria Silva Gestora Comercial',
      delegado_id: '55555555-5555-5555-5555-555555555555',
      delegado_nome: 'Ana Claudia Vendedora',
      data_delegacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      data_prazo: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status_delegacao: 'PENDENTE',
      descricao_tarefa: 'Realizar levantamento de necessidades do cliente para elaboração de proposta comercial. Identificar escopo completo do projeto e possíveis desafios técnicos.',
      observacoes: 'Cliente já demonstrou interesse em fechar contrato. Prioridade alta.',
      data_criacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      data_atualizacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'del-2',
      os_id: 'os-2',
      delegante_id: '33333333-3333-3333-3333-333333333333',
      delegante_nome: 'João Pedro Gestor Assessoria',
      delegado_id: '77777777-7777-7777-7777-777777777777',
      delegado_nome: 'Bruno Martins Técnico',
      data_delegacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      data_prazo: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status_delegacao: 'EM_PROGRESSO',
      descricao_tarefa: 'Elaborar parecer técnico sobre viabilidade de reforma estrutural no edifício residencial. Incluir análise de riscos e recomendações.',
      data_criacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      data_atualizacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'del-3',
      os_id: 'os-3',
      delegante_id: '44444444-4444-4444-4444-444444444444',
      delegante_nome: 'Roberto Carlos Gestor Obras',
      delegado_id: '99999999-9999-9999-9999-999999999999',
      delegado_nome: 'Marcelo Costa Encarregado',
      data_delegacao: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      data_prazo: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status_delegacao: 'PENDENTE',
      descricao_tarefa: 'Coordenar equipe de execução da reforma do apartamento 302. Garantir cumprimento do cronograma e qualidade da execução.',
      observacoes: 'Atenção: proprietário viajou e deixou chaves com síndico.',
      data_criacao: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      data_atualizacao: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'del-4',
      os_id: 'os-4',
      delegante_id: '22222222-2222-2222-2222-222222222222',
      delegante_nome: 'Maria Silva Gestora Comercial',
      delegado_id: '66666666-6666-6666-6666-666666666666',
      delegado_nome: 'Fernando Luis Vendedor',
      data_delegacao: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      data_prazo: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status_delegacao: 'CONCLUIDA',
      descricao_tarefa: 'Realizar follow-up com clientes que receberam propostas na última semana. Registrar feedback e próximos passos.',
      data_criacao: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      data_atualizacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const handleIniciar = (delegacaoId: string) => {
    setDelegacoes(prev =>
      prev.map(d =>
        d.id === delegacaoId
          ? {
              ...d,
              status_delegacao: 'EM_PROGRESSO' as const,
              data_atualizacao: new Date().toISOString(),
            }
          : d
      )
    );
    toast.success('Tarefa iniciada! Boa sorte na execução.');
  };

  const handleConcluir = (delegacaoId: string) => {
    setDelegacoes(prev =>
      prev.map(d =>
        d.id === delegacaoId
          ? {
              ...d,
              status_delegacao: 'CONCLUIDA' as const,
              data_atualizacao: new Date().toISOString(),
            }
          : d
      )
    );
    toast.success('Tarefa concluída com sucesso! Aguardando aprovação do gestor.');
  };

  const handleAprovar = (delegacaoId: string) => {
    // Lógica de aprovação será implementada quando integrar com aprovações
    toast.success('Tarefa aprovada!');
  };

  const handleReprovar = (delegacaoId: string) => {
    setDelegacoes(prev =>
      prev.map(d =>
        d.id === delegacaoId
          ? {
              ...d,
              status_delegacao: 'REPROVADA' as const,
              data_atualizacao: new Date().toISOString(),
            }
          : d
      )
    );
    toast.error('Tarefa reprovada. O colaborador será notificado.');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
              )}
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">Delegações</h1>
                  <p className="text-sm text-neutral-600">
                    Gerencie suas tarefas delegadas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ListaDelegacoes
          delegacoes={delegacoes}
          onIniciar={handleIniciar}
          onConcluir={handleConcluir}
          onAprovar={handleAprovar}
          onReprovar={handleReprovar}
        />
      </div>
    </div>
  );
}
