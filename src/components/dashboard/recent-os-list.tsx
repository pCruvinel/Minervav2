// Lista de OS Recentes - Sistema Minerva ERP
'use client';

import React from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, User, Building2 } from 'lucide-react';
import { OrdemServico } from '@/lib/types';
import { formatarDataRelativa } from '@/lib/utils/date-utils';

interface RecentOSListProps {
  ordensServico: OrdemServico[];
  limit?: number;
  title?: string;
  onOSClick?: (_os: OrdemServico) => void;
}

export function RecentOSList({
  ordensServico,
  limit = 5,
  title = 'Ordens de Serviço Recentes',
  onOSClick,
}: RecentOSListProps) {
  // Ordenar por data de criação (mais recente primeiro)
  const recentOS = React.useMemo(() => {
    return [...ordensServico]
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }, [ordensServico, limit]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      em_triagem: {
        label: 'Em Triagem',
        className: 'bg-primary/10 text-primary border-primary/20'
      },
      em_andamento: {
        label: 'Em Andamento',
        className: 'bg-primary/10 text-primary border-primary/20'
      },
      concluido: {
        label: 'Concluído',
        className: 'bg-success/10 text-success border-success/20'
      },
      cancelado: {
        label: 'Cancelado',
        className: 'bg-destructive/10 text-destructive border-destructive/20'
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: 'bg-muted text-muted-foreground border-border'
    };

    return (
      <Badge variant="outline" className={`${config.className} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  if (ordensServico.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mb-3 text-neutral-300" />
            <p className="text-sm font-medium">Nenhuma OS encontrada</p>
            <p className="text-xs text-muted-foreground mt-1">
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
          <p className="text-sm text-muted-foreground mt-1">
            {ordensServico.length} {ordensServico.length === 1 ? 'ordem' : 'ordens'} no total
          </p>
        </div>
        {ordensServico.length > limit && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-1"
          >
            <Link to="/os">
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {recentOS.map((os) => (
          <Link
            key={os.id}
            to="/os/$osId"
            params={{ osId: os.id }}
            className="block p-4 rounded-lg border border-border transition-all cursor-pointer hover:border-primary hover:bg-primary/5"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">
                    {os.codigo_os}
                  </p>
                  {getStatusBadge(os.status_geral)}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {os.descricao}
                </p>
              </div>

              {onOSClick && (
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>

            {/* Details */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {os.cliente_nome && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{os.cliente_nome}</span>
                </div>
              )}

              {/* Setor removido temporariamente pois não existe no tipo OrdemServico */}

              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatarDataRelativa(os.created_at || new Date().toISOString())}</span>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
