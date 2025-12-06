/**
 * RecrutamentoKanban - Board Kanban para requisições de mão de obra
 *
 * Exibe requisições em 4 colunas baseadas no status:
 * - Pendente Aprovação
 * - Em Divulgação
 * - Entrevistas
 * - Finalizado
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Megaphone, UserSearch, CheckCircle2 } from 'lucide-react';
import { RequisicaoCard } from './requisicao-card';
import type { RequisicaoMaoDeObra, RecruitmentColumnStatus } from '@/lib/types/recrutamento';

interface RecrutamentoKanbanProps {
  requisicoes: RequisicaoMaoDeObra[];
  onCardClick: (requisicao: RequisicaoMaoDeObra) => void;
}

interface ColumnConfig {
  id: RecruitmentColumnStatus;
  title: string;
  icon: React.ReactNode;
  variant: 'warning' | 'info' | 'primary' | 'success';
  emptyMessage: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'pendente_aprovacao',
    title: 'Pendente Aprovação',
    icon: <Clock className="w-4 h-4" />,
    variant: 'warning',
    emptyMessage: 'Nenhuma requisição pendente',
  },
  {
    id: 'em_divulgacao',
    title: 'Em Divulgação',
    icon: <Megaphone className="w-4 h-4" />,
    variant: 'info',
    emptyMessage: 'Nenhuma vaga em divulgação',
  },
  {
    id: 'entrevistas',
    title: 'Entrevistas',
    icon: <UserSearch className="w-4 h-4" />,
    variant: 'primary',
    emptyMessage: 'Nenhum processo de seleção',
  },
  {
    id: 'finalizado',
    title: 'Finalizado',
    icon: <CheckCircle2 className="w-4 h-4" />,
    variant: 'success',
    emptyMessage: 'Nenhuma requisição finalizada',
  },
];

const variantStyles: Record<ColumnConfig['variant'], string> = {
  warning: 'border-t-warning bg-warning/5',
  info: 'border-t-info bg-info/5',
  primary: 'border-t-primary bg-primary/5',
  success: 'border-t-success bg-success/5',
};

const headerStyles: Record<ColumnConfig['variant'], string> = {
  warning: 'text-warning',
  info: 'text-info',
  primary: 'text-primary',
  success: 'text-success',
};

export function RecrutamentoKanban({ requisicoes, onCardClick }: RecrutamentoKanbanProps) {
  // Agrupar requisições por status do kanban
  const groupedRequisicoes = useMemo(() => {
    const groups: Record<RecruitmentColumnStatus, RequisicaoMaoDeObra[]> = {
      pendente_aprovacao: [],
      em_divulgacao: [],
      entrevistas: [],
      finalizado: [],
    };

    requisicoes.forEach((req) => {
      const status = req.kanban_status || 'em_divulgacao';
      if (groups[status]) {
        groups[status].push(req);
      }
    });

    return groups;
  }, [requisicoes]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((column) => (
        <Card
          key={column.id}
          className={`flex flex-col h-full border-t-4 ${variantStyles[column.variant]}`}
        >
          <CardHeader className="pb-3">
            <CardTitle
              className={`flex items-center gap-2 text-sm ${headerStyles[column.variant]}`}
            >
              {column.icon}
              <span>{column.title}</span>
              <Badge variant="secondary" className="ml-auto">
                {groupedRequisicoes[column.id].length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-3 pt-0">
            <ScrollArea className="h-[500px] pr-3">
              {groupedRequisicoes[column.id].length === 0 ? (
                <div className="flex items-center justify-center h-32 text-center">
                  <p className="text-sm text-muted-foreground">{column.emptyMessage}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupedRequisicoes[column.id].map((requisicao) => (
                    <RequisicaoCard
                      key={requisicao.id}
                      requisicao={requisicao}
                      onClick={() => onCardClick(requisicao)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
