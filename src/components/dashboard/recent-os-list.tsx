// Lista de OS Recentes - Sistema Minerva ERP
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ChevronRight, Calendar, User, Building2 } from 'lucide-react';
import { OrdemServico } from '../../lib/types';
import { formatarDataRelativa } from '../../lib/utils/date-utils';

interface RecentOSListProps {
  ordensServico: OrdemServico[];
  limit?: number;
  title?: string;
  onOSClick?: (os: OrdemServico) => void;
  onViewAll?: () => void;
}

export function RecentOSList({ 
  ordensServico, 
  limit = 5,
  title = 'Ordens de Serviço Recentes',
  onOSClick,
  onViewAll,
}: RecentOSListProps) {
  // Ordenar por data de criação (mais recente primeiro)
  const recentOS = React.useMemo(() => {
    return [...ordensServico]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.data_criacao || 0);
        const dateB = new Date(b.createdAt || b.data_criacao || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }, [ordensServico, limit]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      RASCUNHO: { 
        label: 'Rascunho', 
        className: 'bg-neutral-100 text-neutral-700 border-neutral-200' 
      },
      PENDENTE: { 
        label: 'Pendente', 
        className: 'bg-amber-100 text-amber-700 border-amber-200' 
      },
      EM_TRIAGEM: { 
        label: 'Em Triagem', 
        className: 'bg-blue-100 text-blue-700 border-blue-200' 
      },
      EM_ANDAMENTO: { 
        label: 'Em Andamento', 
        className: 'bg-blue-100 text-blue-700 border-blue-200' 
      },
      AGUARDANDO_APROVACAO: { 
        label: 'Aguardando', 
        className: 'bg-amber-100 text-amber-700 border-amber-200' 
      },
      APROVADA: { 
        label: 'Aprovada', 
        className: 'bg-green-100 text-green-700 border-green-200' 
      },
      EM_EXECUCAO: { 
        label: 'Em Execução', 
        className: 'bg-violet-100 text-violet-700 border-violet-200' 
      },
      CONCLUIDA: { 
        label: 'Concluída', 
        className: 'bg-green-100 text-green-700 border-green-200' 
      },
      CANCELADA: { 
        label: 'Cancelada', 
        className: 'bg-red-100 text-red-700 border-red-200' 
      },
    };

    const config = statusConfig[status] || { 
      label: status, 
      className: 'bg-neutral-100 text-neutral-700 border-neutral-200' 
    };

    return (
      <Badge variant="outline" className={`${config.className} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getSetorLabel = (setor: string) => {
    const labels: Record<string, string> = {
      COM: 'Comercial',
      ASS: 'Assessoria',
      OBR: 'Obras',
    };
    return labels[setor] || setor;
  };

  if (ordensServico.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
            <Building2 className="w-12 h-12 mb-3 text-neutral-300" />
            <p className="text-sm font-medium">Nenhuma OS encontrada</p>
            <p className="text-xs text-neutral-400 mt-1">
              Crie sua primeira ordem de serviço
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <p className="text-sm text-neutral-600 mt-1">
            {ordensServico.length} {ordensServico.length === 1 ? 'ordem' : 'ordens'} no total
          </p>
        </div>
        {onViewAll && ordensServico.length > limit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="gap-1"
          >
            Ver todas
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {recentOS.map((os) => (
          <div
            key={os.id}
            className={`
              p-4 rounded-lg border border-neutral-200 transition-all
              ${onOSClick ? 'cursor-pointer hover:border-primary hover:bg-primary/5' : ''}
            `}
            onClick={() => onOSClick?.(os)}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">
                    {os.codigo}
                  </p>
                  {getStatusBadge(os.status)}
                </div>
                <p className="text-sm text-neutral-700 truncate">
                  {os.titulo}
                </p>
              </div>
              
              {onOSClick && (
                <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
              )}
            </div>

            {/* Details */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
              {os.cliente && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{os.cliente}</span>
                </div>
              )}
              
              {os.setor && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>{getSetorLabel(os.setor)}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatarDataRelativa(os.createdAt || os.data_criacao || new Date().toISOString())}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
