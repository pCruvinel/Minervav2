/**
 * ModalNovoAgendamentoV2 - Modal simplificado para criação de agendamentos
 *
 * v2.1: Design simplificado:
 * - Ao clicar em uma vaga, abre popover para selecionar colaborador do setor
 * - Após selecionar, mostra avatar e nome - só confirmar
 * - Removido: Categoria e Participantes
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '../ui/dialog';
import { ModalHeaderPadrao } from '../ui/modal-header-padrao';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { toast } from 'sonner';
import { Calendar, Clock, Loader2, Users, Search, Check, User } from 'lucide-react';
import { logger } from '@/lib/utils/logger';
import { useCreateAgendamento } from '@/lib/hooks/use-agendamentos';
import { useColaboradoresPorSetor } from '@/lib/hooks/use-colaboradores-setor';
import { TurnoProcessado, AgendamentoProcessado } from '@/lib/hooks/use-semana-calendario';
import { getSetorColor } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

interface VagaDisponivel {
  setor: string;
  index: number;
  ocupada: boolean;
  agendamento?: AgendamentoProcessado;
}

interface ColaboradorSelecionado {
  id: string;
  nome: string;
  avatarUrl?: string;
  setor: string;
  vagaIndex: number;
}

interface ModalNovoAgendamentoV2Props {
  open: boolean;
  onClose: () => void;
  turno: TurnoProcessado | null;
  data: string;  // "2025-12-07"
  agendamentosExistentes: AgendamentoProcessado[];
  onSuccess?: (agendamento?: any) => void;
  /** Filtro de setor - exibe apenas vagas desse setor (usado em OS) */
  setorFiltro?: string;
}

// =====================================================
// HELPERS
// =====================================================

function gerarIniciais(nome: string): string {
  if (!nome) return '?';
  const partes = nome.trim().split(' ');
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function ModalNovoAgendamentoV2({ 
  open, 
  onClose, 
  turno, 
  data,
  agendamentosExistentes,
  onSuccess,
  setorFiltro 
}: ModalNovoAgendamentoV2Props) {
  // Estados
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<ColaboradorSelecionado | null>(null);
  const [vagaAberta, setVagaAberta] = useState<{ setor: string; index: number } | null>(null);
  const [buscaColaborador, setBuscaColaborador] = useState('');

  // Hooks
  const { mutate: criarAgendamento, loading: criando } = useCreateAgendamento();
  
  // Buscar colaboradores do setor da vaga aberta
  const setorParaBuscar = vagaAberta?.setor || '';
  const { colaboradores, loading: loadingColaboradores } = useColaboradoresPorSetor(setorParaBuscar);

  // Resetar campos quando modal abrir/fechar
  useEffect(() => {
    if (open) {
      setColaboradorSelecionado(null);
      setVagaAberta(null);
      setBuscaColaborador('');
    }
  }, [open]);

  // Calcular vagas disponíveis por setor
  const vagasPorSetor = useMemo(() => {
    if (!turno) return new Map<string, VagaDisponivel[]>();

    const vagasMap = new Map<string, VagaDisponivel[]>();
    
    // Filtrar setores se setorFiltro foi fornecido
    const setoresFiltrados = setorFiltro 
      ? turno.setores.filter(s => s.toLowerCase() === setorFiltro.toLowerCase())
      : turno.setores;
    
    setoresFiltrados.forEach(setor => {
      // Usar vagasPorSetor do turno, ou distribuir igualmente se não definido
      const vagasDoSetor = turno.vagasPorSetor[setor] || Math.ceil(turno.vagasTotal / turno.setores.length);
      const agendamentosDoSetor = agendamentosExistentes.filter(a => a.setor === setor);
      
      const vagas: VagaDisponivel[] = [];
      for (let i = 0; i < vagasDoSetor; i++) {
        const agendamento = agendamentosDoSetor[i];
        vagas.push({
          setor,
          index: i,
          ocupada: !!agendamento,
          agendamento,
        });
      }
      
      vagasMap.set(setor, vagas);
    });

    return vagasMap;
  }, [turno, agendamentosExistentes, setorFiltro]);

  // Colaboradores filtrados pela busca
  const colaboradoresFiltrados = useMemo(() => {
    if (!colaboradores) return [];
    if (!buscaColaborador.trim()) return colaboradores;
    
    const termo = buscaColaborador.toLowerCase();
    return colaboradores.filter(c => 
      c.nome_completo?.toLowerCase().includes(termo)
    );
  }, [colaboradores, buscaColaborador]);

  // Handlers
  const handleAbrirPopover = (setor: string, index: number) => {
    setVagaAberta({ setor, index });
    setBuscaColaborador('');
  };

  const handleSelecionarColaborador = (colab: any) => {
    if (!vagaAberta) return;
    
    setColaboradorSelecionado({
      id: colab.id,
      nome: colab.nome_completo,
      avatarUrl: colab.avatar_url,
      setor: vagaAberta.setor,
      vagaIndex: vagaAberta.index,
    });
    setVagaAberta(null);
    setBuscaColaborador('');
  };

  const handleConfirmar = async () => {
    if (!colaboradorSelecionado || !turno) {
      toast.error('Selecione um colaborador para a vaga');
      return;
    }

    try {
      logger.log('Criando agendamento:', {
        turnoId: turno.id,
        data,
        setor: colaboradorSelecionado.setor,
        responsavelId: colaboradorSelecionado.id,
      });

      const novoAgendamento = {
        turnoId: turno.id,
        data,
        horarioInicio: turno.horaInicio,
        horarioFim: turno.horaFim,
        duracaoHoras: 1,
        categoria: 'Agendamento', // Categoria fixa simplificada
        setor: colaboradorSelecionado.setor,
        responsavelId: colaboradorSelecionado.id,
      };

      await criarAgendamento(novoAgendamento);

      toast.success('Agendamento criado com sucesso!');
      
      setColaboradorSelecionado(null);
      
      // Chamar onSuccess com dados do agendamento criado
      onSuccess?.({
        id: 'temp-' + Date.now(), // ID temporário
        data: novoAgendamento.data,
        horarioInicio: novoAgendamento.horarioInicio,
        horarioFim: novoAgendamento.horarioFim,
        duracaoHoras: novoAgendamento.duracaoHoras,
        turnoId: novoAgendamento.turnoId,
        categoria: novoAgendamento.categoria,
        setor: novoAgendamento.setor,
        status: 'confirmado' as const,
      });
      
      onClose();
    } catch (error) {
      toast.error('Erro ao criar agendamento. Tente novamente.');
      logger.error('Erro ao criar agendamento:', error);
    }
  };

  const handleFechar = () => {
    setColaboradorSelecionado(null);
    setVagaAberta(null);
    onClose();
  };

  // Formatar data
  const formatarData = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split('-');
    const dataObj = new Date(Number(ano), Number(mes) - 1, Number(dia));
    return dataObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!turno) return null;

  return (
    <Dialog open={open} onOpenChange={handleFechar}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <ModalHeaderPadrao
          title="Novo Agendamento"
          description="Selecione uma vaga e escolha o colaborador"
          icon={Calendar}
          theme="confirm"
        />

        <div className="space-y-6 p-6">
          {/* Informações do Turno */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-2 border border-border/50">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{formatarData(data)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Turno: {turno.horaInicio} - {turno.horaFim}</span>
            </div>
          </div>

          {/* Seleção de Vagas por Setor */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Selecione uma Vaga{setorFiltro && ` (Setor: ${setorFiltro})`}
            </Label>

            {vagasPorSetor.size === 0 && setorFiltro && (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma vaga disponível para o setor <strong>{setorFiltro}</strong></p>
                <p className="text-xs mt-1">Este turno não possui vagas cadastradas para este setor.</p>
              </div>
            )}

            <div className="grid gap-3">
              {Array.from(vagasPorSetor.entries()).map(([setor, vagas]) => {
                const corSetor = getSetorColor(setor);
                const vagasDisponiveis = vagas.filter(v => !v.ocupada).length;
                
                return (
                  <div 
                    key={setor}
                    className="rounded-lg overflow-hidden border"
                    style={{ borderColor: corSetor.border }}
                  >
                    {/* Header do Setor */}
                    <div 
                      className="px-3 py-2 flex items-center justify-between"
                      style={{ 
                        backgroundColor: corSetor.bgSolid,
                        color: 'white'
                      }}
                    >
                      <span className="font-medium text-sm">{setor}</span>
                      <span className="text-xs opacity-80">
                        {vagasDisponiveis} de {vagas.length} disponíveis
                      </span>
                    </div>

                    {/* Grid de Vagas */}
                    <div 
                      className="p-2 grid grid-cols-2 gap-2"
                      style={{ backgroundColor: corSetor.bg }}
                    >
                      {vagas.map((vaga) => {
                        const isSelected = colaboradorSelecionado?.setor === vaga.setor && 
                                          colaboradorSelecionado?.vagaIndex === vaga.index;
                        
                        if (vaga.ocupada) {
                          // Vaga ocupada
                          return (
                            <div
                              key={`${vaga.setor}-${vaga.index}`}
                              className="p-2 rounded-md opacity-60 cursor-not-allowed"
                              style={{ backgroundColor: corSetor.badge.bg }}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback 
                                    className="text-[10px]"
                                    style={{ 
                                      backgroundColor: corSetor.bgSolid,
                                      color: 'white'
                                    }}
                                  >
                                    {gerarIniciais(vaga.agendamento?.usuarioNome || '')}
                                  </AvatarFallback>
                                </Avatar>
                                <span 
                                  className="text-xs truncate"
                                  style={{ color: corSetor.badge.text }}
                                >
                                  {vaga.agendamento?.usuarioNome || 'Ocupado'}
                                </span>
                              </div>
                            </div>
                          );
                        }

                        // Vaga livre - com Popover
                        return (
                          <Popover 
                            key={`${vaga.setor}-${vaga.index}`}
                            open={vagaAberta?.setor === vaga.setor && vagaAberta?.index === vaga.index}
                            onOpenChange={(open) => {
                              if (open) {
                                handleAbrirPopover(vaga.setor, vaga.index);
                              } else {
                                setVagaAberta(null);
                              }
                            }}
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className={cn(
                                  "p-2 rounded-md text-left transition-all w-full",
                                  "cursor-pointer hover:ring-2 hover:ring-primary/50",
                                  isSelected && "ring-2 ring-primary shadow-sm"
                                )}
                                style={{
                                  backgroundColor: isSelected ? `${corSetor.bgSolid}15` : 'white',
                                  borderWidth: '1px',
                                  borderColor: isSelected ? corSetor.bgSolid : corSetor.border,
                                }}
                              >
                                {colaboradorSelecionado && colaboradorSelecionado.setor === vaga.setor && colaboradorSelecionado.vagaIndex === vaga.index ? (
                                  // Colaborador selecionado
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={colaboradorSelecionado.avatarUrl} />
                                      <AvatarFallback
                                        className="text-[10px]"
                                        style={{
                                          backgroundColor: corSetor.bgSolid,
                                          color: 'white'
                                        }}
                                      >
                                        {gerarIniciais(colaboradorSelecionado.nome)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium truncate" style={{ color: corSetor.text }}>
                                      {colaboradorSelecionado.nome}
                                    </span>
                                  </div>
                                ) : (
                                  // Vaga livre
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center"
                                      style={{ backgroundColor: corSetor.bgSolid }}
                                    >
                                      <User className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-xs font-medium" style={{ color: corSetor.text }}>
                                      Vaga {vaga.index + 1}
                                    </span>
                                  </div>
                                )}
                              </button>
                            </PopoverTrigger>

                            <PopoverContent className="w-72 p-0" align="start">
                              <div className="p-3 border-b">
                                <p className="font-semibold text-sm">Selecionar Colaborador</p>
                                <p className="text-xs text-muted-foreground">Setor: {setor}</p>
                              </div>
                              
                              {/* Busca */}
                              <div className="p-2 border-b">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Buscar por nome..."
                                    value={buscaColaborador}
                                    onChange={(e) => setBuscaColaborador(e.target.value)}
                                    className="pl-8 h-8 text-sm"
                                  />
                                </div>
                              </div>

                              {/* Lista de colaboradores */}
                              <div className="max-h-48 overflow-y-auto">
                                {loadingColaboradores ? (
                                  <div className="p-4 text-center text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                    Carregando...
                                  </div>
                                ) : colaboradoresFiltrados.length === 0 ? (
                                  <div className="p-4 text-center text-sm text-muted-foreground">
                                    Nenhum colaborador encontrado
                                  </div>
                                ) : (
                                  colaboradoresFiltrados.map((colab) => (
                                    <button
                                      key={colab.id}
                                      type="button"
                                      onClick={() => handleSelecionarColaborador(colab)}
                                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors"
                                    >
                                      <Avatar className="h-7 w-7">
                                        <AvatarImage src={colab.avatar_url} />
                                        <AvatarFallback className="text-[10px]">
                                          {gerarIniciais(colab.nome_completo)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {colab.nome_completo}
                                        </p>
                                        {colab.funcao && (
                                          <p className="text-xs text-muted-foreground truncate">
                                            {colab.funcao}
                                          </p>
                                        )}
                                      </div>
                                    </button>
                                  ))
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumo - só aparece quando colaborador selecionado */}
          {colaboradorSelecionado && (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Confirmar Agendamento
              </h4>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={colaboradorSelecionado.avatarUrl} />
                  <AvatarFallback 
                    className="text-sm"
                    style={{ 
                      backgroundColor: getSetorColor(colaboradorSelecionado.setor).bgSolid,
                      color: 'white'
                    }}
                  >
                    {gerarIniciais(colaboradorSelecionado.nome)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{colaboradorSelecionado.nome}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getSetorColor(colaboradorSelecionado.setor).bgSolid }}
                    />
                    <span>{colaboradorSelecionado.setor}</span>
                    <span>•</span>
                    <span>{turno.horaInicio} - {turno.horaFim}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handleFechar}
            disabled={criando}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            className="px-8"
            disabled={criando || !colaboradorSelecionado}
          >
            {criando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              'Confirmar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
