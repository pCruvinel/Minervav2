import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '../ui/dialog';
import { ModalHeaderPadrao } from '../ui/modal-header-padrao';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useCreateTurno } from '../../lib/hooks/use-turnos';
import { Loader2, AlertCircle, Clock, Calendar, Users, Briefcase, Check, Info, Minus, Plus } from 'lucide-react';
import { useSetores } from '../../lib/hooks/use-setores';
import { logger } from '../../lib/utils/logger';
import { cn } from '../../lib/utils';
import { getSetorColor } from '../../lib/design-tokens';
import type { VagasPorSetor } from '../../lib/types';

interface ModalCriarTurnoProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Dias da semana começando por Segunda (padrão iOS/Android)
const diasSemanaConfig = [
  { label: 'S', value: 1, fullLabel: 'Segunda' },
  { label: 'T', value: 2, fullLabel: 'Terça' },
  { label: 'Q', value: 3, fullLabel: 'Quarta' },
  { label: 'Q', value: 4, fullLabel: 'Quinta' },
  { label: 'S', value: 5, fullLabel: 'Sexta' },
  { label: 'S', value: 6, fullLabel: 'Sábado' },
  { label: 'D', value: 0, fullLabel: 'Domingo' },
];

interface ValidationErrors {
  horaInicio?: string;
  horaFim?: string;
  dataInicio?: string;
  dataFim?: string;
  numeroVagas?: string;
  setores?: string;
  diasSemana?: string;
}

export function ModalCriarTurno({ open, onClose, onSuccess }: ModalCriarTurnoProps) {
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFim, setHoraFim] = useState('11:00');
  const [disponibilidade, setDisponibilidade] = useState<'uteis' | 'recorrente' | 'custom'>('uteis');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [setoresSelecionados, setSetoresSelecionados] = useState<string[]>([]);
  const [todosSetores, setTodosSetores] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // v2.0: Vagas por setor
  const [vagasPorSetor, setVagasPorSetor] = useState<VagasPorSetor>({});

  const { mutate: criarTurno, loading: criando } = useCreateTurno();
  const { setores: setoresDisponiveis, loading: loadingSetores } = useSetores();

  // Calcular duração do turno
  const calcularDuracao = () => {
    if (!horaInicio || !horaFim) return null;
    const [inicioH, inicioM] = horaInicio.split(':').map(Number);
    const [fimH, fimM] = horaFim.split(':').map(Number);
    const duracao = (fimH + fimM / 60) - (inicioH + inicioM / 60);
    return duracao > 0 ? duracao : null;
  };

  // Validar horários
  const validarHorarios = (): boolean => {
    const erros: ValidationErrors = {};

    if (!horaInicio) {
      erros.horaInicio = 'Hora de início é obrigatória';
    } else if (!/^\d{2}:\d{2}$/.test(horaInicio)) {
      erros.horaInicio = 'Formato inválido (use HH:MM)';
    } else {
      const [horas] = horaInicio.split(':').map(Number);
      if (horas < 8 || horas > 18) {
        erros.horaInicio = 'Deve estar entre 08:00 e 18:00';
      }
    }

    if (!horaFim) {
      erros.horaFim = 'Hora de fim é obrigatória';
    } else if (!/^\d{2}:\d{2}$/.test(horaFim)) {
      erros.horaFim = 'Formato inválido (use HH:MM)';
    } else if (horaFim <= horaInicio) {
      erros.horaFim = 'Deve ser após a hora de início';
    } else {
      const [horas] = horaFim.split(':').map(Number);
      if (horas > 18) {
        erros.horaFim = 'Deve ser até 18:00';
      }

      const duracao = calcularDuracao();
      if (duracao && duracao < 1) {
        erros.horaFim = 'Duração mínima é 1 hora';
      } else if (duracao && duracao > 12) {
        erros.horaFim = 'Duração máxima é 12 horas';
      }
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Validar datas (apenas para personalizado)
  const validarDatas = (): boolean => {
    if (disponibilidade !== 'custom') return true;

    const erros: ValidationErrors = {};
    const hoje = new Date().toISOString().split('T')[0];

    if (!dataInicio) {
      erros.dataInicio = 'Data de início é obrigatória';
    } else if (dataInicio < hoje) {
      erros.dataInicio = 'Deve ser uma data futura';
    }

    if (!dataFim) {
      erros.dataFim = 'Data de fim é obrigatória';
    } else if (dataFim < dataInicio) {
      erros.dataFim = 'Deve ser após a data de início';
    } else {
      const difDias = Math.floor(
        (new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (difDias > 30) {
        erros.dataFim = 'Intervalo máximo é 30 dias';
      }
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Validar número de vagas por setor
  const validarVagas = (): boolean => {
    const erros: ValidationErrors = {};

    // Se nenhum setor selecionado, não precisa validar vagas
    if (setoresSelecionados.length === 0) {
      return true;
    }

    // Verificar se todos os setores selecionados têm vagas configuradas
    for (const setor of setoresSelecionados) {
      const vagas = vagasPorSetor[setor];
      if (!vagas || vagas <= 0) {
        erros.numeroVagas = `Configure as vagas para ${setor}`;
        break;
      }
      if (vagas > 10) {
        erros.numeroVagas = `Máximo 10 vagas por setor`;
        break;
      }
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Calcular total de vagas
  const totalVagas = useMemo(() => {
    return Object.values(vagasPorSetor).reduce((sum, v) => sum + v, 0);
  }, [vagasPorSetor]);

  // Validar setores
  const validarSetores = (): boolean => {
    const erros: ValidationErrors = {};

    if (!todosSetores && setoresSelecionados.length === 0) {
      erros.setores = 'Selecione ao menos um setor';
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Validar dias da semana (para recorrente e personalizado)
  const validarDiasSemana = (): boolean => {
    const erros: ValidationErrors = {};

    if ((disponibilidade === 'recorrente' || disponibilidade === 'custom') && diasSemana.length === 0) {
      erros.diasSemana = 'Selecione ao menos um dia da semana';
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Validar formulário completo
  const validarFormulario = (): boolean => {
    const validHorarios = validarHorarios();
    const validDatas = validarDatas();
    const validVagas = validarVagas();
    const validSetores = validarSetores();
    const validDiasSemana = validarDiasSemana();

    return validHorarios && validDatas && validVagas && validSetores && validDiasSemana;
  };

  // Verificar se formulário está válido
  const isFormValid = useMemo(() => {
    const temErros = Object.keys(errors).length > 0;
    const temSetores = todosSetores || setoresSelecionados.length > 0;
    const temVagas = Object.keys(vagasPorSetor).length > 0 && Object.values(vagasPorSetor).every(v => v > 0);
    const camposPreenchidos = horaInicio && horaFim && temSetores && temVagas;

    if (disponibilidade === 'recorrente') {
      return camposPreenchidos && diasSemana.length > 0 && !temErros;
    }

    if (disponibilidade === 'custom') {
      return camposPreenchidos && dataInicio && dataFim && !temErros;
    }

    return camposPreenchidos && !temErros;
  }, [horaInicio, horaFim, vagasPorSetor, setoresSelecionados, todosSetores, dataInicio, dataFim, disponibilidade, diasSemana, errors]);

  const handleToggleSetor = (setor: string) => {
    if (setoresSelecionados.includes(setor)) {
      setSetoresSelecionados(setoresSelecionados.filter(s => s !== setor));
      // Remover do vagasPorSetor
      const novasVagas = { ...vagasPorSetor };
      delete novasVagas[setor];
      setVagasPorSetor(novasVagas);
    } else {
      setSetoresSelecionados([...setoresSelecionados, setor]);
      // Adicionar ao vagasPorSetor com valor padrão
      setVagasPorSetor({ ...vagasPorSetor, [setor]: 1 });
    }
    setTodosSetores(false);
  };

  const handleTodosSetores = (checked: boolean) => {
    setTodosSetores(checked);
    if (checked) {
      const todosSlugss = setoresDisponiveis.map(s => s.slug);
      setSetoresSelecionados(todosSlugss);
      // Inicializar vagas para todos os setores
      const novasVagas: VagasPorSetor = {};
      todosSlugss.forEach(slug => {
        novasVagas[slug] = 1;
      });
      setVagasPorSetor(novasVagas);
    } else {
      setSetoresSelecionados([]);
      setVagasPorSetor({});
    }
  };

  // Handler para alterar vagas de um setor específico
  const handleVagasSetor = (setor: string, delta: number) => {
    const vagasAtuais = vagasPorSetor[setor] || 1;
    const novoValor = Math.max(1, Math.min(10, vagasAtuais + delta));
    setVagasPorSetor({ ...vagasPorSetor, [setor]: novoValor });
    setErrors(prev => {
      const novo = { ...prev };
      delete novo.numeroVagas;
      return novo;
    });
  };

  const handleSetVagasSetor = (setor: string, valor: number) => {
    const novoValor = Math.max(1, Math.min(10, valor));
    setVagasPorSetor({ ...vagasPorSetor, [setor]: novoValor });
    setErrors(prev => {
      const novo = { ...prev };
      delete novo.numeroVagas;
      return novo;
    });
  };

  const handleToggleDia = (dia: number) => {
    if (diasSemana.includes(dia)) {
      setDiasSemana(diasSemana.filter(d => d !== dia));
    } else {
      setDiasSemana([...diasSemana, dia].sort());
    }
    setErrors((prev) => {
      const novo = { ...prev };
      delete novo.diasSemana;
      return novo;
    });
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) {
      toast.error('Corrija os erros antes de salvar');
      return;
    }

    try {
      const setoresFinais = todosSetores ? setoresDisponiveis.map(s => s.slug) : setoresSelecionados;
      
      await criarTurno({
        horaInicio,
        horaFim,
        vagasTotal: totalVagas,
        vagasPorSetor,
        setores: setoresFinais,
        cor: 'verde',
        tipoRecorrencia: disponibilidade,
        dataInicio: disponibilidade === 'custom' ? dataInicio : undefined,
        dataFim: disponibilidade === 'custom' ? dataFim : undefined,
        diasSemana: (disponibilidade === 'recorrente' || disponibilidade === 'custom') ? diasSemana : undefined,
      });

      // Resetar formulário
      setHoraInicio('09:00');
      setHoraFim('11:00');
      setDisponibilidade('uteis');
      setDataInicio('');
      setDataFim('');
      setDiasSemana([]);
      setVagasPorSetor({});
      setSetoresSelecionados([]);
      setTodosSetores(false);
      setErrors({});

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Erro ao criar turno. Tente novamente.');
      logger.error('Erro ao criar turno:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setErrors({});
      onClose();
    }
  };

  const getDisponibilidadeLabel = () => {
    switch (disponibilidade) {
      case 'uteis': return 'Dias úteis (Seg-Sex)';
      case 'recorrente': 
        const diasNomes = diasSemana
          .sort()
          .map(d => diasSemanaConfig.find(c => c.value === d)?.fullLabel || '')
          .filter(Boolean);
        return diasNomes.length > 0 ? diasNomes.join(', ') : 'Recorrente';
      case 'custom': return 'Período personalizado';
      default: return '';
    }
  };

  const duracao = calcularDuracao();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <ModalHeaderPadrao
          title="Configurar Novo Turno"
          description="Configure os detalhes do turno para os funcionários."
          icon={Briefcase}
          theme="create"
        />

        <div className="space-y-6 p-6">
          {/* Seção: Horários */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Horários</h3>
                <p className="text-xs text-muted-foreground">Defina o período do turno</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horaInicio" className="text-sm">Hora de Início</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => {
                    setHoraInicio(e.target.value);
                    setErrors((prev) => {
                      const novo = { ...prev };
                      delete novo.horaInicio;
                      return novo;
                    });
                  }}
                  className={cn(
                    "h-11",
                    errors.horaInicio && 'border-destructive focus-visible:ring-destructive'
                  )}
                />
                {errors.horaInicio && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.horaInicio}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaFim" className="text-sm">Hora de Fim</Label>
                <Input
                  id="horaFim"
                  type="time"
                  value={horaFim}
                  onChange={(e) => {
                    setHoraFim(e.target.value);
                    setErrors((prev) => {
                      const novo = { ...prev };
                      delete novo.horaFim;
                      return novo;
                    });
                  }}
                  className={cn(
                    "h-11",
                    errors.horaFim && 'border-destructive focus-visible:ring-destructive'
                  )}
                />
                {errors.horaFim && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.horaFim}
                  </p>
                )}
              </div>
            </div>

            {duracao && duracao > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Duração: <span className="font-medium text-foreground">{duracao} hora{duracao !== 1 ? 's' : ''}</span>
                </span>
              </div>
            )}
          </div>

          {/* Seção: Disponibilidade */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Disponibilidade</h3>
                <p className="text-xs text-muted-foreground">Quando o turno estará disponível</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'uteis', label: 'Dias úteis', desc: 'Seg a Sex' },
                { id: 'recorrente', label: 'Recorrência', desc: 'Escolher dias' },
                { id: 'custom', label: 'Personalizado', desc: 'Período específico' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setDisponibilidade(option.id as typeof disponibilidade);
                    // Limpar dias da semana ao trocar de opção
                    if (option.id === 'uteis') {
                      setDiasSemana([]);
                    }
                  }}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all duration-200",
                    disponibilidade === option.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{option.label}</span>
                    {disponibilidade === option.id && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{option.desc}</span>
                </button>
              ))}
            </div>

            {/* Seleção de Dias da Semana para Recorrência */}
            {disponibilidade === 'recorrente' && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                <Label className="text-sm font-medium">Selecione os dias da semana</Label>
                <p className="text-xs text-muted-foreground">O turno estará disponível toda semana nesses dias</p>
                <div className="flex gap-2 justify-center">
                  {diasSemanaConfig.map((dia) => (
                    <button
                      key={dia.value}
                      type="button"
                      onClick={() => handleToggleDia(dia.value)}
                      title={dia.fullLabel}
                      className={cn(
                        "h-11 w-11 rounded-full font-semibold text-sm transition-all duration-200",
                        "border-2",
                        diasSemana.includes(dia.value)
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background border-muted-foreground/20 text-muted-foreground hover:bg-muted hover:border-muted-foreground/40"
                      )}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
                {errors.diasSemana && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.diasSemana}
                  </p>
                )}
              </div>
            )}

            {/* Campos de datas para período personalizado */}
            {disponibilidade === 'custom' && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataInicio" className="text-sm">Data de Início</Label>
                    <Input
                      id="dataInicio"
                      type="text"
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      value={dataInicio}
                      onChange={(e) => {
                        const masked = e.target.value
                          .replace(/\D/g, '')
                          .replace(/(\d{2})(\d)/, '$1/$2')
                          .replace(/(\d{2})(\d)/, '$1/$2')
                          .replace(/(\/\d{4})\d+?$/, '$1');
                        setDataInicio(masked);
                        setErrors((prev) => {
                          const novo = { ...prev };
                          delete novo.dataInicio;
                          return novo;
                        });
                      }}
                      className={cn(
                        "h-11",
                        errors.dataInicio && 'border-destructive focus-visible:ring-destructive'
                      )}
                    />
                    {errors.dataInicio && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.dataInicio}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataFim" className="text-sm">Data de Fim</Label>
                    <Input
                      id="dataFim"
                      type="text"
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      value={dataFim}
                      onChange={(e) => {
                        const masked = e.target.value
                          .replace(/\D/g, '')
                          .replace(/(\d{2})(\d)/, '$1/$2')
                          .replace(/(\d{2})(\d)/, '$1/$2')
                          .replace(/(\/\d{4})\d+?$/, '$1');
                        setDataFim(masked);
                        setErrors((prev) => {
                          const novo = { ...prev };
                          delete novo.dataFim;
                          return novo;
                        });
                      }}
                      className={cn(
                        "h-11",
                        errors.dataFim && 'border-destructive focus-visible:ring-destructive'
                      )}
                    />
                    {errors.dataFim && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.dataFim}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seção: Vagas por Setor - v2.0 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Vagas por Setor</h3>
                <p className="text-xs text-muted-foreground">Defina quantos agendamentos simultâneos por setor</p>
              </div>
              {totalVagas > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                  <span className="text-2xl font-bold text-primary">{totalVagas}</span>
                  <span className="text-xs text-muted-foreground">total</span>
                </div>
              )}
            </div>

            {setoresSelecionados.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground bg-muted/30 rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Selecione os setores abaixo para configurar as vagas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {setoresSelecionados.map(slug => {
                  const setor = setoresDisponiveis.find(s => s.slug === slug);
                  const vagas = vagasPorSetor[slug] || 1;
                  const corSetor = getSetorColor(slug);
                  
                  return (
                    <div 
                      key={slug} 
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{ 
                        backgroundColor: corSetor.bg,
                        borderColor: corSetor.border 
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-8 rounded-full"
                          style={{ backgroundColor: corSetor.bgSolid }}
                        />
                        <span className="font-medium text-sm" style={{ color: corSetor.text }}>
                          {setor?.nome || slug}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleVagasSetor(slug, -1)}
                          disabled={vagas <= 1}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            "bg-white/80 hover:bg-white border shadow-sm",
                            vagas <= 1 && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={vagas}
                          onChange={(e) => handleSetVagasSetor(slug, parseInt(e.target.value) || 1)}
                          className="w-12 h-8 text-center font-bold text-lg bg-white/80 border rounded-md"
                        />
                        
                        <button
                          type="button"
                          onClick={() => handleVagasSetor(slug, 1)}
                          disabled={vagas >= 10}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            "bg-white/80 hover:bg-white border shadow-sm",
                            vagas >= 10 && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        
                        <span className="text-xs text-muted-foreground ml-1 w-10">
                          vaga{vagas !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {errors.numeroVagas && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.numeroVagas}
              </p>
            )}
          </div>

          {/* Seção: Setores */}
          <div className={cn(
            "space-y-4",
            errors.setores && "p-4 rounded-xl bg-destructive/5 border border-destructive/20"
          )}>
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                errors.setores ? "bg-destructive/10" : "bg-primary/10"
              )}>
                <Briefcase className={cn("h-4 w-4", errors.setores ? "text-destructive" : "text-primary")} />
              </div>
              <div>
                <h3 className={cn("font-semibold text-sm", errors.setores && "text-destructive")}>Setores</h3>
                <p className="text-xs text-muted-foreground">Quais setores podem usar este turno</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Label htmlFor="todos-setores" className="cursor-pointer font-medium text-sm">
                    Todos os setores
                  </Label>
                </div>
                <Switch
                  id="todos-setores"
                  checked={todosSetores}
                  onCheckedChange={(checked: boolean) => {
                    handleTodosSetores(checked);
                    setErrors((prev) => {
                      const novo = { ...prev };
                      delete novo.setores;
                      return novo;
                    });
                  }}
                />
              </div>

              {loadingSetores ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando setores...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {setoresDisponiveis.map((setor) => (
                    <button
                      key={setor.id}
                      type="button"
                      onClick={() => {
                        handleToggleSetor(setor.slug);
                        setErrors((prev) => {
                          const novo = { ...prev };
                          delete novo.setores;
                          return novo;
                        });
                      }}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left",
                        setoresSelecionados.includes(setor.slug)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="font-medium text-sm">{setor.nome}</span>
                      {setoresSelecionados.includes(setor.slug) && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.setores && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-2">
                <AlertCircle className="h-3 w-3" />
                {errors.setores}
              </p>
            )}
          </div>

          {/* Resumo do Turno */}
          {isFormValid && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Resumo do Turno
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{horaInicio} - {horaFim}</span>
                    {duracao && (
                      <Badge variant="secondary" className="text-xs">
                        {duracao}h
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{getDisponibilidadeLabel()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{totalVagas} vaga{totalVagas !== 1 ? 's' : ''} total</span>
                  </div>
                </div>
              </div>
              {/* v2.0: Mostrar vagas por setor */}
              {setoresSelecionados.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Capacidade por setor:</p>
                  <div className="flex flex-wrap gap-2">
                    {setoresSelecionados.map(slug => {
                      const setor = setoresDisponiveis.find(s => s.slug === slug);
                      const vagas = vagasPorSetor[slug] || 1;
                      const corSetor = getSetorColor(slug);
                      return (
                        <Badge 
                          key={slug} 
                          variant="outline" 
                          className="text-xs px-2 py-1"
                          style={{ 
                            backgroundColor: corSetor.bg,
                            borderColor: corSetor.border,
                            color: corSetor.text
                          }}
                        >
                          {setor?.nome || slug}: {vagas} vaga{vagas !== 1 ? 's' : ''}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t border-border/50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={criando}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            className="px-8"
            disabled={criando || !isFormValid}
          >
            {criando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Turno'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
