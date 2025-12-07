import { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
} from '../ui/dialog';
import { ModalHeaderPadrao } from '../ui/modal-header-padrao';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useUpdateTurno, useDeleteTurno } from '../../lib/hooks/use-turnos';
import { useSetores } from '../../lib/hooks/use-setores';
import { logger } from '../../lib/utils/logger';
import { Turno } from '../../lib/hooks/use-turnos';
import { AlertCircle, Clock, Calendar, Users, Palette, Briefcase, Edit, Trash2, Loader2, Check, Info, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalDetalhesTurnoProps {
    open: boolean;
    onClose: () => void;
    turno: Turno | null;
    onSuccess?: () => void;
}

const coresTurno = [
    { nome: 'Verde', classe: 'bg-success', valor: 'verde', ring: 'ring-success' },
    { nome: 'Vermelho', classe: 'bg-destructive', valor: 'verm', ring: 'ring-destructive' },
    { nome: 'Azul', classe: 'bg-info', valor: 'azul', ring: 'ring-info' }
];

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

export function ModalDetalhesTurno({ open, onClose, turno, onSuccess }: ModalDetalhesTurnoProps) {
    const [horaInicio, setHoraInicio] = useState('09:00');
    const [horaFim, setHoraFim] = useState('11:00');
    const [recorrencia, setRecorrencia] = useState<'todos' | 'uteis' | 'custom'>('uteis');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [diasSemana, setDiasSemana] = useState<number[]>([]);
    const [numeroVagas, setNumeroVagas] = useState([5]);
    const [corSelecionada, setCorSelecionada] = useState(coresTurno[0].valor);
    const [setoresSelecionados, setSetoresSelecionados] = useState<string[]>([]);
    const [todosSetores, setTodosSetores] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [modoEdicao, setModoEdicao] = useState(false);

    const { mutate: atualizarTurno, loading: atualizando } = useUpdateTurno(turno?.id || '');
    const { mutate: deletarTurno, loading: deletando } = useDeleteTurno();
    const { setores: setoresDisponiveis, loading: loadingSetores } = useSetores();

    // Carregar dados do turno quando ele muda
    useEffect(() => {
        if (turno && open) {
            setHoraInicio(turno.horaInicio);
            setHoraFim(turno.horaFim);
            setRecorrencia(turno.tipoRecorrencia);
            setDataInicio(turno.dataInicio || '');
            setDataFim(turno.dataFim || '');
            setDiasSemana(turno.diasSemana || []);
            setNumeroVagas([turno.vagasTotal]);
            setCorSelecionada(turno.cor || 'verde');
            setSetoresSelecionados(turno.setores);
            setTodosSetores(turno.setores.length === setoresDisponiveis.length);
            setErrors({});
            setModoEdicao(false);
        }
    }, [turno, open, setoresDisponiveis]);

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

    // Validar datas (se recorrência = custom)
    const validarDatas = (): boolean => {
        if (recorrencia !== 'custom') return true;

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

    // Validar número de vagas
    const validarVagas = (): boolean => {
        const erros: ValidationErrors = {};

        if (!numeroVagas || numeroVagas.length === 0) {
            erros.numeroVagas = 'Número de vagas é obrigatório';
        } else {
            const vagas = numeroVagas[0];
            if (vagas <= 0) {
                erros.numeroVagas = 'Deve ser um número positivo';
            } else if (vagas > 10) {
                erros.numeroVagas = 'Máximo 10 vagas';
            }
        }

        setErrors((prev) => ({ ...prev, ...erros }));
        return Object.keys(erros).length === 0;
    };

    // Validar setores
    const validarSetores = (): boolean => {
        const erros: ValidationErrors = {};

        if (!todosSetores && setoresSelecionados.length === 0) {
            erros.setores = 'Selecione ao menos um setor';
        }

        setErrors((prev) => ({ ...prev, ...erros }));
        return Object.keys(erros).length === 0;
    };

    // Validar dias da semana (para recorrência custom)
    const validarDiasSemana = (): boolean => {
        const erros: ValidationErrors = {};

        if (recorrencia === 'custom' && diasSemana.length === 0) {
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
        const camposPreenchidos =
            horaInicio && horaFim && numeroVagas.length > 0 && (todosSetores || setoresSelecionados.length > 0);

        if (recorrencia === 'custom') {
            return camposPreenchidos && dataInicio && dataFim && diasSemana.length > 0 && !temErros;
        }

        return camposPreenchidos && !temErros;
    }, [horaInicio, horaFim, numeroVagas, setoresSelecionados, todosSetores, dataInicio, dataFim, recorrencia, diasSemana, errors]);

    const handleToggleSetor = (setor: string) => {
        if (setoresSelecionados.includes(setor)) {
            setSetoresSelecionados(setoresSelecionados.filter(s => s !== setor));
        } else {
            setSetoresSelecionados([...setoresSelecionados, setor]);
        }
        setTodosSetores(false);
    };

    const handleTodosSetores = (checked: boolean) => {
        setTodosSetores(checked);
        if (checked) {
            setSetoresSelecionados(setoresDisponiveis.map(s => s.slug));
        } else {
            setSetoresSelecionados([]);
        }
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
        if (!turno?.id) return;

        if (!validarFormulario()) {
            toast.error('Corrija os erros antes de salvar');
            return;
        }

        try {
            await atualizarTurno({
                horaInicio,
                horaFim,
                vagasTotal: numeroVagas[0],
                setores: todosSetores ? setoresDisponiveis.map(s => s.slug) : setoresSelecionados,
                cor: corSelecionada,
                tipoRecorrencia: recorrencia,
                dataInicio: recorrencia === 'custom' ? dataInicio : undefined,
                dataFim: recorrencia === 'custom' ? dataFim : undefined,
                diasSemana: recorrencia === 'custom' ? diasSemana : undefined,
            });

            setModoEdicao(false);
            onSuccess?.();
        } catch (error) {
            toast.error('Erro ao atualizar turno. Tente novamente.');
            logger.error('Erro ao atualizar turno:', error);
        }
    };

    const handleDeletar = async () => {
        if (!turno?.id) return;

        const confirmado = window.confirm(
            'Tem certeza que deseja excluir este turno?\n\nEsta ação não pode ser desfeita e todos os agendamentos futuros serão cancelados.'
        );

        if (!confirmado) return;

        try {
            await deletarTurno(turno.id);
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error('Erro ao excluir turno. Tente novamente.');
            logger.error('Erro ao excluir turno:', error);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setErrors({});
            setModoEdicao(false);
            onClose();
        }
    };

    const getRecorrenciaLabel = () => {
        switch (recorrencia) {
            case 'todos': return 'Todos os dias';
            case 'uteis': return 'Dias úteis (Seg-Sex)';
            case 'custom': return 'Personalizada';
            default: return '';
        }
    };

    const corAtual = coresTurno.find(c => c.valor === corSelecionada);
    const duracao = calcularDuracao();

    if (!turno) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                <ModalHeaderPadrao
                    title={modoEdicao ? "Editar Turno" : "Detalhes do Turno"}
                    description={modoEdicao ? "Edite as configurações do turno." : "Visualize e gerencie as configurações do turno."}
                    icon={modoEdicao ? Edit : Eye}
                    theme={modoEdicao ? "warning" : "info"}
                />

                <div className="space-y-6 p-6">
                    {/* Resumo do Turno (modo visualização) */}
                    {!modoEdicao && (
                        <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Horário</p>
                                            <p className="font-semibold">{turno.horaInicio} - {turno.horaFim}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Recorrência</p>
                                            <p className="font-semibold">{getRecorrenciaLabel()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Users className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Vagas</p>
                                            <p className="font-semibold">{turno.vagasTotal} disponíveis</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", corAtual?.classe || 'bg-primary')}>
                                            <Palette className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Cor</p>
                                            <p className="font-semibold">{corAtual?.nome || 'Verde'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Setores */}
                            {turno.setores.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border/50">
                                    <p className="text-xs text-muted-foreground mb-2">Setores</p>
                                    <div className="flex flex-wrap gap-2">
                                        {turno.setores.map(slug => {
                                            const setor = setoresDisponiveis.find(s => s.slug === slug);
                                            return (
                                                <Badge key={slug} variant="secondary">
                                                    {setor?.nome || slug}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botões de Ação (modo visualização) */}
                    {!modoEdicao && (
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setModoEdicao(true)}
                                className="flex-1 h-11"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Turno
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeletar}
                                disabled={deletando}
                                className="h-11"
                            >
                                {deletando ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Formulário de Edição */}
                    {modoEdicao && (
                        <>
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

                            {/* Seção: Recorrência */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Calendar className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Recorrência</h3>
                                        <p className="text-xs text-muted-foreground">Quando o turno estará disponível</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'todos', label: 'Todos os dias', desc: 'Dom a Sáb' },
                                        { id: 'uteis', label: 'Dias úteis', desc: 'Seg a Sex' },
                                        { id: 'custom', label: 'Personalizado', desc: 'Escolher dias' },
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setRecorrencia(option.id as typeof recorrencia)}
                                            className={cn(
                                                "p-4 rounded-xl border-2 text-left transition-all duration-200",
                                                recorrencia === option.id
                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-sm">{option.label}</span>
                                                {recorrencia === option.id && (
                                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                        <Check className="h-3 w-3 text-primary-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">{option.desc}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Campos de datas para recorrência personalizada */}
                                {recorrencia === 'custom' && (
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

                                        {/* Seleção de Dias da Semana - Estilo iOS/Android */}
                                        <div className="space-y-3">
                                            <Label className="text-sm text-muted-foreground">Dias da Semana</Label>
                                            <div className="flex gap-2">
                                                {diasSemanaConfig.map((dia) => (
                                                    <button
                                                        key={dia.value}
                                                        type="button"
                                                        onClick={() => handleToggleDia(dia.value)}
                                                        title={dia.fullLabel}
                                                        className={cn(
                                                            "h-10 w-10 rounded-full font-semibold text-sm transition-all duration-200",
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
                                    </div>
                                )}
                            </div>

                            {/* Seção: Vagas */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm">Número de Vagas</h3>
                                        <p className="text-xs text-muted-foreground">Quantos agendamentos simultâneos</p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                                        <span className="text-2xl font-bold text-primary">{numeroVagas[0]}</span>
                                        <span className="text-xs text-muted-foreground">vagas</span>
                                    </div>
                                </div>

                                <div className="px-2">
                                    <Slider
                                        value={numeroVagas}
                                        onValueChange={(value) => {
                                            setNumeroVagas(value);
                                            setErrors((prev) => {
                                                const novo = { ...prev };
                                                delete novo.numeroVagas;
                                                return novo;
                                            });
                                        }}
                                        min={1}
                                        max={10}
                                        step={1}
                                        className="py-4"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                                        <span>1</span>
                                        <span>5</span>
                                        <span>10</span>
                                    </div>
                                </div>
                                {errors.numeroVagas && (
                                    <p className="text-xs text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.numeroVagas}
                                    </p>
                                )}
                            </div>

                            {/* Seção: Cor do Turno */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Palette className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Cor do Turno</h3>
                                        <p className="text-xs text-muted-foreground">Para identificação visual no calendário</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    {coresTurno.map((cor) => (
                                        <button
                                            key={cor.valor}
                                            type="button"
                                            onClick={() => setCorSelecionada(cor.valor)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200",
                                                corSelecionada === cor.valor
                                                    ? `border-current ${cor.ring} ring-2 ring-offset-2 bg-muted/50`
                                                    : "border-border hover:border-muted-foreground"
                                            )}
                                        >
                                            <div className={cn("w-8 h-8 rounded-full shadow-sm", cor.classe)} />
                                            <span className={cn(
                                                "font-medium text-sm",
                                                corSelecionada === cor.valor ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {cor.nome}
                                            </span>
                                        </button>
                                    ))}
                                </div>
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
                        </>
                    )}
                </div>

                <DialogFooter className="p-6 bg-muted/30 border-t border-border/50">
                    {!modoEdicao ? (
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="px-6"
                        >
                            Fechar
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setModoEdicao(false);
                                    // Restaurar valores originais
                                    if (turno) {
                                        setHoraInicio(turno.horaInicio);
                                        setHoraFim(turno.horaFim);
                                        setRecorrencia(turno.tipoRecorrencia);
                                        setDataInicio(turno.dataInicio || '');
                                        setDataFim(turno.dataFim || '');
                                        setDiasSemana(turno.diasSemana || []);
                                        setNumeroVagas([turno.vagasTotal]);
                                        setCorSelecionada(turno.cor || 'verde');
                                        setSetoresSelecionados(turno.setores);
                                        setErrors({});
                                    }
                                }}
                                disabled={atualizando}
                                className="px-6"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSalvar}
                                className="px-8"
                                disabled={atualizando || !isFormValid}
                            >
                                {atualizando ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar Alterações'
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
