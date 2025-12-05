/**
 * AgendamentoOS - Componente para gerenciar agendamentos em etapas de OS
 *
 * Componente wrapper que integra o sistema de calendário centralizado
 * nas etapas de Ordem de Serviço que requerem agendamento.
 * 
 * ATUALIZAÇÃO: Suporte a responsável diferente do criador (separação audit/executor)
 *
 * @example
 * ```tsx
 * <AgendamentoOS
 *   osId={osId}
 *   categoria="Vistoria Técnica"
 *   setorFiltragem="obras"
 *   agendamentoId={data.agendamentoId}
 *   onAgendamentoChange={(id) => onDataChange({ agendamentoId: id })}
 *   readOnly={false}
 * />
 * ```
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarioSemanaCustom } from '@/components/calendario/calendario-semana-custom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  User,
} from 'lucide-react';
import { useAgendamento, useCancelarAgendamento } from '@/lib/hooks/use-agendamentos';
import { useColaboradoresPorSetor, useColaboradoresAtivos } from '@/lib/hooks/use-colaboradores-setor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { getInitials } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

interface AgendamentoOSProps {
  osId: string;
  categoria: 'Apresentação de Proposta' | 'Vistoria Técnica' | 'Vistoria Inicial' | 'Vistoria Final';
  /** @deprecated Use setorFiltragem */
  setorSlug?: string;
  /** Slug do setor para filtrar responsáveis elegíveis (ex: 'obras', 'assessoria') */
  setorFiltragem?: string;
  agendamentoId?: string;
  onAgendamentoChange: (agendamentoId: string | null) => void;
  /** Callback quando o responsável selecionado muda */
  onResponsavelChange?: (responsavelId: string | null) => void;
  /** ID do responsável pré-selecionado */
  responsavelId?: string;
  readOnly?: boolean;
  dataLegacy?: string;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function AgendamentoOS({
  osId,
  categoria: _categoria, // Usado futuramente para filtrar categorias
  setorSlug,
  setorFiltragem,
  agendamentoId,
  onAgendamentoChange,
  onResponsavelChange,
  responsavelId: responsavelIdExterno,
  readOnly = false,
  dataLegacy,
}: AgendamentoOSProps) {
  // Estado do responsável selecionado
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<string | null>(
    responsavelIdExterno || null
  );

  // Determinar setor para filtrar (prioriza setorFiltragem sobre setorSlug)
  const setorParaFiltrar = setorFiltragem || setorSlug;

  // Data atual para o calendário
  const hoje = useMemo(() => new Date(), []);

  // Hooks - colaboradores
  const {
    colaboradores: colaboradoresFiltrados,
    loading: loadingColaboradores
  } = useColaboradoresPorSetor(setorParaFiltrar);

  const {
    colaboradores: todosColaboradores,
    loading: loadingTodos
  } = useColaboradoresAtivos();

  // Usar colaboradores filtrados se há setor, senão todos
  const colaboradores = setorParaFiltrar ? colaboradoresFiltrados : todosColaboradores;
  const loadingColabs = setorParaFiltrar ? loadingColaboradores : loadingTodos;

  // Hook de agendamento
  const { data: agendamento, loading: loadingAgendamento } = useAgendamento(agendamentoId);
  const { mutate: cancelarAgendamento, loading: cancelando } = useCancelarAgendamento();

  // Sincronizar responsável externo
  useEffect(() => {
    if (responsavelIdExterno) {
      setResponsavelSelecionado(responsavelIdExterno);
    }
  }, [responsavelIdExterno]);

  // Notificar mudança de responsável
  const handleResponsavelChange = useCallback((novoResponsavelId: string) => {
    setResponsavelSelecionado(novoResponsavelId);
    onResponsavelChange?.(novoResponsavelId);
  }, [onResponsavelChange]);

  // Função de refresh
  const handleRefresh = useCallback(() => {
    // O CalendarioSemanaCustom gerencia seu próprio refresh
  }, []);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleAbrirCalendario = () => {
    toast.info('Funcionalidade em desenvolvimento');
  };

  const handleCancelarAgendamento = () => {
    if (!agendamentoId) return;

    const motivo = window.prompt('Digite o motivo do cancelamento:');
    if (!motivo) return;

    cancelarAgendamento(
      { id: agendamentoId, motivo },
      {
        onSuccess: () => {
          onAgendamentoChange(null);
          toast.success('Agendamento cancelado com sucesso!');
        },
      }
    );
  };

  // =====================================================
  // RENDER: VALIDAÇÃO DE osId
  // =====================================================

  if (!osId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro: osId é obrigatório para criar agendamentos.
        </AlertDescription>
      </Alert>
    );
  }

  // =====================================================
  // RENDER: MODO LEGACY
  // =====================================================

  if (!agendamentoId && dataLegacy) {
    return (
      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-warning mb-1">
                Agendamento em Modo Legado
              </h4>
              <p className="text-sm text-warning mb-2">
                Este agendamento foi criado no sistema antigo.
              </p>
              <div className="flex items-center gap-2 text-sm text-warning">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  {new Date(dataLegacy).toLocaleString('pt-BR')}
                </span>
              </div>
              {!readOnly && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAbrirCalendario}
                  className="mt-4 border-warning/30 text-warning hover:bg-warning/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Agendamento no Sistema Novo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // =====================================================
  // RENDER: CARREGANDO
  // =====================================================

  if (loadingAgendamento) {
    return (
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // =====================================================
  // RENDER: AGENDAMENTO EXISTENTE
  // =====================================================

  if (agendamento) {
    const dataAgendamento = new Date(agendamento.data);
    const isCancelado = agendamento.status === 'cancelado';

    return (
      <div className="space-y-6">
        {/* Card de Status do Agendamento */}
        <Card className={isCancelado ? 'border-destructive/20 bg-destructive/5' : 'border-success/20 bg-success/5'}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {/* Avatar do Responsável */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      {agendamento.responsavel?.avatar_url ? (
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={agendamento.responsavel.avatar_url} />
                          <AvatarFallback>
                            {getInitials(agendamento.responsavelNome || 'NA')}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: isCancelado ? 'var(--destructive)' : 'var(--success)' }}
                        >
                          {isCancelado ? (
                            <CalendarX className="w-6 h-6 text-white" />
                          ) : (
                            <CalendarCheck className="w-6 h-6 text-white" />
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      <strong>Responsável:</strong> {agendamento.responsavelNome || 'Não definido'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Agendado por: {agendamento.usuarioNome || 'Sistema'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex-1">
                <h3 className="text-base font-medium mb-3">
                  {isCancelado ? 'Agendamento Cancelado' : 'Agendamento Confirmado'}
                </h3>

                <div className="space-y-2">
                  {/* Responsável pela execução */}
                  {agendamento.responsavelNome && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {agendamento.responsavelNome}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        (Responsável pela execução)
                      </span>
                    </div>
                  )}

                  {/* Data e Horário */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(dataAgendamento, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {agendamento.horarioInicio} - {agendamento.horarioFim} ({agendamento.duracaoHoras}h)
                    </span>
                  </div>

                  {/* Categoria e Setor */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{agendamento.categoria} - {agendamento.setor}</span>
                  </div>

                  {/* Motivo de Cancelamento */}
                  {isCancelado && agendamento.canceladoMotivo && (
                    <Alert className="mt-3 bg-destructive/10 border-destructive/20">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <AlertDescription className="text-sm text-destructive">
                        <strong>Motivo:</strong> {agendamento.canceladoMotivo}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Ações */}
                  {!readOnly && !isCancelado && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelarAgendamento}
                        disabled={cancelando}
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        {cancelando ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          <>
                            <CalendarX className="h-4 w-4 mr-2" />
                            Cancelar Agendamento
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendário para Visualização */}
        {!isCancelado && (
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">Calendário de Agendamentos</h4>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={false}
                  className="border-border"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <CalendarioSemanaCustom
                dataInicial={hoje}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        )}

      </div>
    );
  }

  // =====================================================
  // RENDER: SEM AGENDAMENTO (CALENDÁRIO + SELETOR RESPONSÁVEL)
  // =====================================================

  return (
    <div className="space-y-6">
      {/* Card de Status + Seletor de Responsável */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-primary">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium">Agendamento Pendente</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione o responsável pela execução e um turno disponível no calendário.
              </p>

              {/* Seletor de Responsável */}
              {!readOnly && (
                <div className="space-y-2">
                  <Label htmlFor="responsavel" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Responsável pela Execução *
                  </Label>
                  <Select
                    value={responsavelSelecionado || ''}
                    onValueChange={handleResponsavelChange}
                    disabled={loadingColabs}
                  >
                    <SelectTrigger id="responsavel" className="bg-background">
                      <SelectValue
                        placeholder={loadingColabs ? 'Carregando...' : 'Selecione o responsável'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {colaboradores.map((colab) => (
                        <SelectItem key={colab.id} value={colab.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={colab.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {getInitials(colab.nome_completo)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{colab.nome_completo}</span>
                            {colab.cargo_nome && (
                              <span className="text-xs text-muted-foreground">
                                ({colab.cargo_nome})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {setorParaFiltrar && (
                    <p className="text-xs text-muted-foreground">
                      Mostrando colaboradores do setor: <strong>{setorParaFiltrar}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>

            {!readOnly && (
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={false}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Aviso se não selecionou responsável */}
      {!responsavelSelecionado && !readOnly && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Selecione um responsável antes de escolher o horário no calendário.
          </AlertDescription>
        </Alert>
      )}

      {/* Calendário Integrado */}
      <Card className="border-border">
        <CardContent className="p-6">
          <CalendarioSemanaCustom
            dataInicial={hoje}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>

    </div>
  );
}
