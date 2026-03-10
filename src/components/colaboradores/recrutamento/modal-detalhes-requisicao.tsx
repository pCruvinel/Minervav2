/**
 * ModalDetalhesRequisicao - Modal de detalhes de uma requisição de mão de obra
 *
 * Exibe informações completas da OS-10 com lista de vagas e ações.
 * As ações disponíveis são derivadas da State Machine (status-machine.ts).
 */

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ModalHeaderPadrao } from '@/components/ui/modal-header-padrao';
import {
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Briefcase,
} from 'lucide-react';
import { useUpdateOSStatus, useUpdateAllVagasStatus } from '@/lib/hooks/use-recrutamento';
import { CandidatoList } from './candidato-list';
import {
  getAvailableTransitions,
  isTerminalStatus,
  KANBAN_TRANSITIONS,
  KANBAN_TO_MUTATIONS,
  type KanbanStatus,
} from '@/lib/utils/status-machine';
import type { RequisicaoMaoDeObra } from '@/lib/types/recrutamento';

interface ModalDetalhesRequisicaoProps {
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  onOpenChange: (open: boolean) => void;
  requisicao: RequisicaoMaoDeObra | null;
  onActionComplete: () => void;
}

/**
 * Formata data para exibição
 */
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
};

/**
 * Configuração visual das ações derivadas da State Machine.
 * A transição permitida em si vem de `KANBAN_TRANSITIONS`.
 */
interface KanbanAction {
  key: string;
  label: string;
  icon: typeof CheckCircle2;
  targetKanban: KanbanStatus;
  variant?: string;
}

const KANBAN_ACTION_METADATA: Readonly<
  Partial<Record<KanbanStatus, Omit<KanbanAction, 'key' | 'targetKanban'>>>
> = {
  em_divulgacao: {
    label: 'Aprovar Solicitação',
    icon: CheckCircle2,
  },
  entrevistas: {
    label: 'Mover para Entrevista',
    icon: ArrowRight,
  },
  finalizado: {
    label: 'Finalizar Contratação',
    icon: CheckCircle2,
    variant: 'bg-success hover:bg-success/90',
  },
};

export function ModalDetalhesRequisicao({
  open,
  onOpenChange,
  requisicao,
  onActionComplete,
}: ModalDetalhesRequisicaoProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const updateOSStatus = useUpdateOSStatus();
  const updateAllVagasStatus = useUpdateAllVagasStatus();

  // Derive available actions from state machine
  const availableActions = useMemo(() => {
    if (!requisicao) return [];
    const status = requisicao.kanban_status as KanbanStatus;
    if (isTerminalStatus(status, KANBAN_TRANSITIONS)) {
      return [];
    }

    return getAvailableTransitions(status, KANBAN_TRANSITIONS).flatMap((targetKanban) => {
      const actionMetadata = KANBAN_ACTION_METADATA[targetKanban];

      if (!actionMetadata) {
        return [];
      }

      return [{
        key: `${status}-${targetKanban}`,
        targetKanban,
        ...actionMetadata,
      }];
    });
  }, [requisicao]);

  if (!requisicao) return null;

  const handleAction = async (action: KanbanAction) => {
    setActionLoading(action.key);
    try {
      const mutations = KANBAN_TO_MUTATIONS[action.targetKanban];

      // Update OS status if the target requires it
      if (mutations.osStatus) {
        await updateOSStatus.mutate({
          osId: requisicao.id,
          status: mutations.osStatus,
        });
      }

      // Batch: update all vagas at once
      await updateAllVagasStatus.mutate({
        osId: requisicao.id,
        status: mutations.vagaStatus,
      });

      onActionComplete();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <ModalHeaderPadrao
          title={`Requisição ${requisicao.codigo_os}`}
          description={requisicao.descricao || 'Requisição de mão de obra'}
          icon={Users}
          theme="info"
        />

        <div className="p-6 space-y-6">
          {/* Resumo de Informações */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Centro de Custo</p>
                <p className="text-sm font-medium">
                  {requisicao.centro_custo?.nome || '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Data Solicitação</p>
                <p className="text-sm font-medium">
                  {formatDate(requisicao.data_entrada)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Lista de Vagas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Vagas Solicitadas
                <Badge variant="secondary" className="ml-auto">
                  {requisicao.total_vagas} {requisicao.total_vagas === 1 ? 'vaga' : 'vagas'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requisicao.vagas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma vaga cadastrada.
                </p>
              ) : (
                requisicao.vagas.map((vaga) => (
                  <div key={vaga.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{vaga.cargo_funcao}</span>
                      <Badge variant="outline">
                        {vaga.quantidade} {vaga.quantidade === 1 ? 'vaga' : 'vagas'}
                      </Badge>
                    </div>

                    {vaga.habilidades_necessarias && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground font-medium">
                          Habilidades Exigidas:
                        </p>
                        <p className="text-sm">{vaga.habilidades_necessarias}</p>
                      </div>
                    )}

                    {vaga.perfil_comportamental && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">
                          Perfil Comportamental:
                        </p>
                        <p className="text-sm">{vaga.perfil_comportamental}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Seção de Candidatos */}
          <div className="space-y-4">
            {requisicao.vagas.map((vaga) => (
              <Card key={`candidatos-${vaga.id}`}>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">
                      Vaga
                    </span>
                    <h3 className="font-medium text-lg leading-tight">
                      {vaga.cargo_funcao}
                    </h3>
                  </div>
                  <CandidatoList vagaId={vaga.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer com Ações — derivadas da State Machine */}
        {availableActions.length > 0 && (
          <DialogFooter className="p-6 bg-muted/30 border-t">
            <div className="flex gap-2 w-full justify-end">
              {availableActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.key}
                    onClick={() => handleAction(action)}
                    disabled={actionLoading !== null}
                    className={action.variant}
                  >
                    {actionLoading === action.key ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4 mr-2" />
                    )}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
