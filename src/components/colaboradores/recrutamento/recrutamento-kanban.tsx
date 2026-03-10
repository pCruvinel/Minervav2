/**
 * RecrutamentoKanban - Board Kanban para requisições de mão de obra
 *
 * Exibe requisições em 4 colunas baseadas no status, com suporte a Drag & Drop.
 */

import type * as React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Megaphone, UserSearch, CheckCircle2 } from 'lucide-react';
import { RequisicaoCard } from './requisicao-card';
import type { RequisicaoMaoDeObra, RecruitmentColumnStatus } from '@/lib/types/recrutamento';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useMoveRequisicaoKanban } from '@/lib/hooks/use-recrutamento';
import { toast } from '@/lib/utils/safe-toast';
import {
  isValidTransition,
  KANBAN_TRANSITIONS,
  VAGA_TRANSITIONS,
  KANBAN_TO_MUTATIONS,
  type KanbanStatus,
} from '@/lib/utils/status-machine';

interface RecrutamentoKanbanProps {
  requisicoes: RequisicaoMaoDeObra[];
  // eslint-disable-next-line no-unused-vars
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

function KanbanColumn({
  column,
  items,
  onCardClick,
}: {
  column: ColumnConfig;
  items: RequisicaoMaoDeObra[];
  // eslint-disable-next-line no-unused-vars
  onCardClick: (r: RequisicaoMaoDeObra) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <Card
      ref={setNodeRef}
      className={`flex flex-col h-full border-t-4 ${variantStyles[column.variant]} ${
        isOver ? 'ring-2 ring-primary ring-offset-2 ring-inset' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 text-sm ${headerStyles[column.variant]}`}>
          {column.icon}
          <span>{column.title}</span>
          <Badge variant="secondary" className="ml-auto">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-0">
        <ScrollArea className="h-[500px] pr-3">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-center pointer-events-none">
              <p className="text-sm text-muted-foreground">{column.emptyMessage}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((requisicao) => (
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
  );
}

export function RecrutamentoKanban({
  requisicoes: initialRequisicoes,
  onCardClick,
}: RecrutamentoKanbanProps) {
  const [requisicoes, setRequisicoes] = useState<RequisicaoMaoDeObra[]>(initialRequisicoes);
  const [activeReq, setActiveReq] = useState<RequisicaoMaoDeObra | null>(null);
  const { mutate: moveRequisicao } = useMoveRequisicaoKanban();

  // Sync state with parent props
  useEffect(() => {
    setRequisicoes(initialRequisicoes);
  }, [initialRequisicoes]);

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

  // Use a distance of 5px to activate the drag sensor, leaving onClick valid
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveReq(active.data.current as RequisicaoMaoDeObra);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveReq(null);
    const { active, over } = event;

    if (!over) return;

    const reqId = active.id as string;
    const req = active.data.current as RequisicaoMaoDeObra;
    const sourceStatus = req.kanban_status || 'em_divulgacao';
    const targetStatus = over.id as RecruitmentColumnStatus;

    if (sourceStatus === targetStatus) return;

    const sourceKanbanStatus = sourceStatus as KanbanStatus;
    const targetKanbanStatus = targetStatus as KanbanStatus;

    if (!isValidTransition(sourceKanbanStatus, targetKanbanStatus, KANBAN_TRANSITIONS)) {
      toast.error(`Transição inválida: não é possível mover de "${sourceStatus}" para "${targetStatus}"`);
      return;
    }

    // Validar transição via state machine ANTES do optimistic update
    const sourceMutation = KANBAN_TO_MUTATIONS[sourceKanbanStatus];
    const targetMutation = KANBAN_TO_MUTATIONS[targetKanbanStatus];

    if (sourceMutation && targetMutation) {
      if (!isValidTransition(sourceMutation.vagaStatus, targetMutation.vagaStatus, VAGA_TRANSITIONS)) {
        toast.error(`Transição inválida: não é possível mover de "${sourceStatus}" para "${targetStatus}"`);
        return;
      }
    }

    // 1. Atualização Otimista
    setRequisicoes((prev) =>
      prev.map((r) =>
        r.id === reqId ? { ...r, kanban_status: targetStatus } : r
      )
    );

    // 2. Persistência com rollback em caso de erro
    try {
      await moveRequisicao({ reqId, targetStatus });
    } catch {
      // 3. Rollback
      setRequisicoes((prev) =>
        prev.map((r) =>
          r.id === reqId ? { ...r, kanban_status: sourceStatus } : r
        )
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            items={groupedRequisicoes[column.id]}
            onCardClick={onCardClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeReq ? (
          <RequisicaoCard requisicao={activeReq} onClick={() => {}} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
