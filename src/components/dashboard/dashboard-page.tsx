// Página Principal de Dashboard - Sistema Minerva ERP
'use client';


import { useAuth } from '@/lib/contexts/auth-context';
import { DashboardDiretoria } from './dashboard-diretoria';
import { DashboardGestor } from './dashboard-gestor';
import { DashboardColaborador } from './dashboard-colaborador';
import { OrdemServico, Delegacao } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface DashboardPageProps {
  ordensServico: OrdemServico[];
  delegacoes: Delegacao[];
  onOSClick?: (_os: OrdemServico) => void;
  onDelegacaoClick?: (_delegacao: Delegacao) => void;
  onViewAllOS?: () => void;
  onDelegarClick?: () => void;
}

export function DashboardPage({
  ordensServico,
  delegacoes,
  onOSClick,
  onDelegacaoClick,
  onViewAllOS,
  onDelegarClick,
}: DashboardPageProps) {
  const { currentUser, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Faça login para acessar o dashboard</p>
        </div>
      </div>
    );
  }

  // Determinar qual dashboard mostrar baseado no role
  const renderDashboard = () => {
    // DIRETORIA - Dashboard completo com visão geral
    if (currentUser.role_nivel === 'diretoria' || currentUser.role_nivel === 'admin') {
      return (
        <DashboardDiretoria
          ordensServico={ordensServico}
          delegacoes={delegacoes}
          onOSClick={onOSClick}
          onViewAllOS={onViewAllOS}
        />
      );
    }

    // GESTORES - Dashboard do setor
    if (currentUser.role_nivel?.startsWith('gestor_')) {
      return (
        <DashboardGestor
          currentUser={currentUser}
          ordensServico={ordensServico}
          delegacoes={delegacoes}
          onOSClick={onOSClick}
          onViewAllOS={onViewAllOS}
          onDelegarClick={onDelegarClick}
        />
      );
    }

    // COLABORADORES - Dashboard de tarefas pessoais
    if (currentUser.role_nivel === 'colaborador') {
      return (
        <DashboardColaborador
          currentUser={currentUser}
          ordensServico={ordensServico}
          delegacoes={delegacoes}
          onOSClick={onOSClick}
          onDelegacaoClick={onDelegacaoClick}
          onViewAllOS={onViewAllOS}
        />
      );
    }

    // Fallback para outros roles (ex: MOBRA - sem acesso ao dashboard)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Dashboard Não Disponível</h2>
          <p className="text-sm text-muted-foreground">
            Seu perfil não tem acesso ao dashboard. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      {renderDashboard()}
    </div>
  );
}
