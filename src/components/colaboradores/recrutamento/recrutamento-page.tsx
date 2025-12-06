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
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Vagas e Recrutamento</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie todas as requisições de mão de obra (OS-10)
          </p>
        </div>
        <Button asChild>
          <Link to="/os/criar/requisicao-mao-de-obra">
            <Plus className="mr-2 h-4 w-4" />
            Nova Requisição de Pessoal
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Vagas</p>
                <h3 className="text-2xl font-semibold">{totalVagas}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Vagas Abertas</p>
                <h3 className="text-2xl font-semibold text-warning">{vagasAbertas}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Vagas Preenchidas</p>
                <h3 className="text-2xl font-semibold text-success">{vagasPreenchidas}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Requisições Ativas</p>
                <h3 className="text-2xl font-semibold">{totalRequisicoes}</h3>
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
