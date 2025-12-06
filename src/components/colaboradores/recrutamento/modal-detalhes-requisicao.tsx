/**
 * ModalDetalhesRequisicao - Modal de detalhes de uma requisição de mão de obra
 *
 * Exibe informações completas da OS-10 com lista de vagas e ações.
 */

import { useState } from 'react';
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
  UserPlus,
  Loader2,
  Briefcase,
} from 'lucide-react';
import { useUpdateOSStatus, useUpdateVagaStatus } from '@/lib/hooks/use-recrutamento';
import type { RequisicaoMaoDeObra } from '@/lib/types/recrutamento';

interface ModalDetalhesRequisicaoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisicao: RequisicaoMaoDeObra | null;
  onActionComplete: () => void;
}

/**
 * Formata data para exibição
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

export function ModalDetalhesRequisicao({
  open,
  onOpenChange,
  requisicao,
  onActionComplete,
}: ModalDetalhesRequisicaoProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const updateOSStatus = useUpdateOSStatus();
  const updateVagaStatus = useUpdateVagaStatus();

  if (!requisicao) return null;

  const handleAprovar = async () => {
    setActionLoading('aprovar');
    try {
      await updateOSStatus.mutate({
        osId: requisicao.id,
        status: 'em_andamento',
      });
      // Atualizar todas as vagas para 'aberta'
      for (const vaga of requisicao.vagas) {
        if (vaga.status !== 'aberta') {
          await updateVagaStatus.mutate({ vagaId: vaga.id, status: 'aberta' });
        }
      }
      onActionComplete();
    } finally {
      setActionLoading(null);
    }
  };

  const handleMoverEntrevista = async () => {
    setActionLoading('entrevista');
    try {
      for (const vaga of requisicao.vagas) {
        await updateVagaStatus.mutate({ vagaId: vaga.id, status: 'em_selecao' });
      }
      onActionComplete();
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinalizar = async () => {
    setActionLoading('finalizar');
    try {
      for (const vaga of requisicao.vagas) {
        await updateVagaStatus.mutate({ vagaId: vaga.id, status: 'preenchida' });
      }
      await updateOSStatus.mutate({ osId: requisicao.id, status: 'concluida' });
      onActionComplete();
    } finally {
      setActionLoading(null);
    }
  };

  const isPendente = requisicao.kanban_status === 'pendente_aprovacao';
  const isEmDivulgacao = requisicao.kanban_status === 'em_divulgacao';
  const isEntrevistas = requisicao.kanban_status === 'entrevistas';
  const isFinalizado = requisicao.kanban_status === 'finalizado';

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

          {/* Seção de Candidatos (placeholder para futuro) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Candidatos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum candidato vinculado ainda.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer com Ações */}
        {!isFinalizado && (
          <DialogFooter className="p-6 bg-muted/30 border-t">
            <div className="flex gap-2 w-full justify-end">
              {isPendente && (
                <Button onClick={handleAprovar} disabled={actionLoading !== null}>
                  {actionLoading === 'aprovar' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Aprovar Solicitação
                </Button>
              )}

              {isEmDivulgacao && (
                <Button onClick={handleMoverEntrevista} disabled={actionLoading !== null}>
                  {actionLoading === 'entrevista' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Mover para Entrevista
                </Button>
              )}

              {isEntrevistas && (
                <Button
                  onClick={handleFinalizar}
                  disabled={actionLoading !== null}
                  className="bg-success hover:bg-success/90"
                >
                  {actionLoading === 'finalizar' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Finalizar Contratação
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
