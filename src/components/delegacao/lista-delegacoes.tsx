// Lista de Delegações - Sistema Hierárquico Minerva ERP
'use client';

import React, { useMemo, useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  User,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../lib/contexts/auth-context';
import { Delegacao } from '../../lib/types';
import { formatarData, calcularDiasAtraso } from '../../lib/utils/date-utils';

interface ListaDelegacoesProps {
  delegacoes: Delegacao[];
  onAprovar?: (delegacaoId: string) => void;
  onReprovar?: (delegacaoId: string) => void;
  onIniciar?: (delegacaoId: string) => void;
  onConcluir?: (delegacaoId: string) => void;
}

export function ListaDelegacoes({ 
  delegacoes,
  onAprovar,
  onReprovar,
  onIniciar,
  onConcluir
}: ListaDelegacoesProps) {
  const { currentUser } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'pendentes' | 'em_progresso' | 'concluidas' | 'reprovadas'>('todas');

  // Filtrar delegações por tipo
  const delegacoesFiltradas = useMemo(() => {
    if (!currentUser) return { recebidas: [], enviadas: [] };

    const recebidas = delegacoes.filter(d => d.delegado_id === currentUser.id);
    const enviadas = delegacoes.filter(d => d.delegante_id === currentUser.id);

    const aplicarFiltroStatus = (lista: Delegacao[]) => {
      if (filtroStatus === 'todas') return lista;
      if (filtroStatus === 'pendentes') return lista.filter(d => d.status_delegacao === 'PENDENTE');
      if (filtroStatus === 'em_progresso') return lista.filter(d => d.status_delegacao === 'EM_PROGRESSO');
      if (filtroStatus === 'concluidas') return lista.filter(d => d.status_delegacao === 'CONCLUIDA');
      if (filtroStatus === 'reprovadas') return lista.filter(d => d.status_delegacao === 'REPROVADA');
      return lista;
    };

    return {
      recebidas: aplicarFiltroStatus(recebidas),
      enviadas: aplicarFiltroStatus(enviadas),
    };
  }, [delegacoes, currentUser, filtroStatus]);

  const getStatusBadge = (status: Delegacao['status_delegacao']) => {
    const configs = {
      PENDENTE: {
        label: 'Pendente',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Clock,
      },
      EM_PROGRESSO: {
        label: 'Em Progresso',
        className: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: AlertCircle,
      },
      CONCLUIDA: {
        label: 'Concluída',
        className: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle2,
      },
      REPROVADA: {
        label: 'Reprovada',
        className: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
      },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const isPrazoProximo = (dataPrazo: string) => {
    const prazo = new Date(dataPrazo);
    const hoje = new Date();
    const diffDias = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias <= 3 && diffDias >= 0;
  };

  const isPrazoVencido = (dataPrazo: string, status: string) => {
    if (status === 'CONCLUIDA' || status === 'REPROVADA') return false;
    const prazo = new Date(dataPrazo);
    const hoje = new Date();
    return prazo < hoje;
  };

  const renderDelegacaoCard = (delegacao: Delegacao, tipo: 'recebida' | 'enviada') => {
    const isExpanded = expandedId === delegacao.id;
    const prazoVencido = isPrazoVencido(delegacao.data_prazo, delegacao.status_delegacao);
    const prazoProximo = isPrazoProximo(delegacao.data_prazo);

    return (
      <Card 
        key={delegacao.id}
        className={`
          transition-all
          ${prazoVencido ? 'border-l-4 border-l-red-500' : ''}
          ${prazoProximo && !prazoVencido ? 'border-l-4 border-l-amber-500' : ''}
        `}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(tipo === 'recebida' ? delegacao.delegante_nome : delegacao.delegado_nome)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate">
                    {tipo === 'recebida' 
                      ? `Delegado por ${delegacao.delegante_nome}`
                      : `Delegado para ${delegacao.delegado_nome}`
                    }
                  </p>
                </div>
                <p className="text-xs text-neutral-500">
                  {formatarData(delegacao.data_delegacao)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge(delegacao.status_delegacao)}
            </div>
          </div>

          {/* Descrição da Tarefa */}
          <div className="mb-3">
            <p className="text-sm text-neutral-700 line-clamp-2">
              {delegacao.descricao_tarefa}
            </p>
          </div>

          {/* Prazo */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-600">
                Prazo: <span className="font-medium">{formatarData(delegacao.data_prazo)}</span>
              </span>
            </div>

            {prazoVencido && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                {calcularDiasAtraso(delegacao.data_prazo)} dias atrasado
              </Badge>
            )}

            {prazoProximo && !prazoVencido && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Prazo próximo
              </Badge>
            )}
          </div>

          {/* Botão de Expandir */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedId(isExpanded ? null : delegacao.id)}
              className="text-xs"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Menos detalhes
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Mais detalhes
                </>
              )}
            </Button>

            {/* Ações */}
            {tipo === 'recebida' && delegacao.status_delegacao === 'PENDENTE' && onIniciar && (
              <Button
                size="sm"
                onClick={() => onIniciar(delegacao.id)}
                className="bg-primary hover:bg-primary/90"
              >
                Iniciar Tarefa
              </Button>
            )}

            {tipo === 'recebida' && delegacao.status_delegacao === 'EM_PROGRESSO' && onConcluir && (
              <Button
                size="sm"
                onClick={() => onConcluir(delegacao.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Concluir
              </Button>
            )}
          </div>

          {/* Detalhes Expandidos */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-neutral-200 space-y-3">
              {delegacao.observacoes && (
                <div>
                  <p className="text-xs font-medium text-neutral-600 mb-1">Observações:</p>
                  <p className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded border border-neutral-200">
                    {delegacao.observacoes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-neutral-500 mb-1">Delegado por:</p>
                  <p className="font-medium">{delegacao.delegante_nome}</p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">Responsável:</p>
                  <p className="font-medium">{delegacao.delegado_nome}</p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">Data de criação:</p>
                  <p className="font-medium">{formatarData(delegacao.data_criacao)}</p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">Última atualização:</p>
                  <p className="font-medium">{formatarData(delegacao.data_atualizacao)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Minhas Delegações</h2>
          <p className="text-sm text-neutral-600">
            Gerencie tarefas delegadas para você e por você
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as any)}
            className="text-sm border border-neutral-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todas">Todas</option>
            <option value="pendentes">Pendentes</option>
            <option value="em_progresso">Em Progresso</option>
            <option value="concluidas">Concluídas</option>
            <option value="reprovadas">Reprovadas</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recebidas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recebidas" className="gap-2">
            <User className="w-4 h-4" />
            Recebidas ({delegacoesFiltradas.recebidas.length})
          </TabsTrigger>
          <TabsTrigger value="enviadas" className="gap-2">
            <FileText className="w-4 h-4" />
            Enviadas ({delegacoesFiltradas.enviadas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recebidas" className="space-y-4 mt-6">
          {delegacoesFiltradas.recebidas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-neutral-600 mb-1">
                  Nenhuma delegação recebida
                </p>
                <p className="text-sm text-neutral-500">
                  {filtroStatus === 'todas' 
                    ? 'Você não possui tarefas delegadas no momento.'
                    : `Você não possui tarefas ${filtroStatus.replace('_', ' ')} no momento.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            delegacoesFiltradas.recebidas.map(d => renderDelegacaoCard(d, 'recebida'))
          )}
        </TabsContent>

        <TabsContent value="enviadas" className="space-y-4 mt-6">
          {delegacoesFiltradas.enviadas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-neutral-600 mb-1">
                  Nenhuma delegação enviada
                </p>
                <p className="text-sm text-neutral-500">
                  {filtroStatus === 'todas' 
                    ? 'Você não delegou tarefas ainda.'
                    : `Você não possui delegações ${filtroStatus.replace('_', ' ')} no momento.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            delegacoesFiltradas.enviadas.map(d => renderDelegacaoCard(d, 'enviada'))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
