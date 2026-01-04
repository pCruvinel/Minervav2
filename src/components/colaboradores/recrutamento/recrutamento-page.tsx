/**
 * RecrutamentoPage - Página de Gestão de Vagas e Recrutamento
 *
 * Exibe um Kanban board para gerenciar requisições de mão de obra (OS-10).
 */

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Users, Briefcase, Clock, CheckCircle2 } from 'lucide-react';
import { RecrutamentoKanban } from './recrutamento-kanban';
import { ModalDetalhesRequisicao } from './modal-detalhes-requisicao';
import { useRequisicoesMaoDeObra } from '@/lib/hooks/use-recrutamento';
import type { RequisicaoMaoDeObra } from '@/lib/types/recrutamento';

export function RecrutamentoPage() {
  const { requisicoes, loading, refetch } = useRequisicoesMaoDeObra();
  const [selectedRequisicao, setSelectedRequisicao] = useState<RequisicaoMaoDeObra | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  // Cálculo de estatísticas
  const totalRequisicoes = requisicoes.length;
  const totalVagas = requisicoes.reduce((sum, r) => sum + r.total_vagas, 0);
  const vagasAbertas = requisicoes
    .filter((r) => r.kanban_status !== 'finalizado')
    .reduce((sum, r) => sum + r.total_vagas, 0);
  const vagasPreenchidas = totalVagas - vagasAbertas;

  const handleCardClick = (requisicao: RequisicaoMaoDeObra) => {
    setSelectedRequisicao(requisicao);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRequisicao(null);
  };

  const handleActionComplete = () => {
    refetch();
    handleCloseModal();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gestão de Vagas e Recrutamento</h1>
          <p className="text-neutral-600 mt-1">
            Acompanhe e gerencie todas as requisições de mão de obra (OS-10)
          </p>
        </div>
        <Button asChild>
          <Link to="/os/criar/requisicao-mao-de-obra">
            <Plus className="w-4 h-4 mr-2" />
            Nova Requisição de Pessoal
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Vagas</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{totalVagas}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Vagas Abertas</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{vagasAbertas}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Vagas Preenchidas</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{vagasPreenchidas}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Requisições Ativas</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{totalRequisicoes}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <RecrutamentoKanban requisicoes={requisicoes} onCardClick={handleCardClick} />
      )}

      {/* Modal de Detalhes */}
      <ModalDetalhesRequisicao
        open={modalOpen}
        onOpenChange={setModalOpen}
        requisicao={selectedRequisicao}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
}
