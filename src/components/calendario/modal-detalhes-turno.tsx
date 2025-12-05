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
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { useUpdateTurno, useDeleteTurno } from '../../lib/hooks/use-turnos';
import { useSetores } from '../../lib/hooks/use-setores';
import { logger } from '../../lib/utils/logger';
import { Turno } from '../../lib/hooks/use-turnos';
import { AlertCircle, Clock, Calendar, Users, Palette, Briefcase, Edit, Trash2, Loader2 } from 'lucide-react';

interface ModalDetalhesTurnoProps {
    open: boolean;
    onClose: () => void;
    turno: Turno | null;
    onSuccess?: () => void;
}

const coresTurno = [
    { nome: 'Verde', classe: 'bg-success', valor: 'verde' },
    { nome: 'Vermelho', classe: 'bg-destructive', valor: 'verm' },
    { nome: 'Azul', classe: 'bg-info', valor: 'azul' }
];

interface ValidationErrors {
    horaInicio?: string;
    horaFim?: string;
    dataInicio?: string;
    dataFim?: string;
    numeroVagas?: string;
    setores?: string;
}

export function ModalDetalhesTurno({ open, onClose, turno, onSuccess }: ModalDetalhesTurnoProps) {
    const [horaInicio, setHoraInicio] = useState('09:00');
    const [horaFim, setHoraFim] = useState('11:00');
    const [recorrencia, setRecorrencia] = useState<'todos' | 'uteis' | 'custom'>('uteis');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [diasSemana, setDiasSemana] = useState<number[]>([]);
    const [numeroVagas, setNumeroVagas] = useState([5]);
    const [corSelecionada, setCorSelecionada] = useState(coresTurno[0].classe);
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
            setCorSelecionada(coresTurno.find(c => c.valor === turno.cor)?.classe || 'bg-primary');
            setSetoresSelecionados(turno.setores);
            setTodosSetores(turno.setores.length === setoresDisponiveis.length);
            setErrors({});
            setModoEdicao(false);
        }
    }, [turno, open, setoresDisponiveis]);

    // Validar horários
    const validarHorarios = (): boolean => {
        const erros: ValidationErrors = {};

        // Validar horaInicio
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

        // Validar horaFim
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

            // Validar duração (1h a 12h)
            const [inicioH, inicioM] = horaInicio.split(':').map(Number);
            const [fimH, fimM] = horaFim.split(':').map(Number);
            const duracao = (fimH + fimM / 60) - (inicioH + inicioM / 60);
            if (duracao < 1) {
                erros.horaFim = 'Duração mínima é 1 hora';
            } else if (duracao > 12) {
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
            // Verificar se intervalo é <= 30 dias
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
            erros.setores = 'Selecione ao menos um dia da semana para recorrência personalizada';
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
            return camposPreenchidos && dataInicio && dataFim && !temErros;
        }

        return camposPreenchidos && !temErros;
    }, [horaInicio, horaFim, numeroVagas, setoresSelecionados, todosSetores, dataInicio, dataFim, recorrencia, errors]);

    const handleToggleSetor = (setor: string) => {
        if (setoresSelecionados.includes(setor)) {
            setSetoresSelecionados(setoresSelecionados.filter(s => s !== setor));
        } else {
            setSetoresSelecionados([...setoresSelecionados, setor]);
        }
    };

    const handleTodosSetores = (checked: boolean) => {
        setTodosSetores(checked);
        if (checked) {
            setSetoresSelecionados(setoresDisponiveis.map(s => s.slug));
        } else {
            setSetoresSelecionados([]);
        }
    };

    const handleSalvar = async () => {
        if (!turno?.id) return;

        // Validar formulário completo
        if (!validarFormulario()) {
            toast.error('Corrija os erros antes de salvar');
            return;
        }

        try {
            // Atualizar turno via hook
            await atualizarTurno({
                horaInicio,
                horaFim,
                vagasTotal: numeroVagas[0],
                setores: todosSetores ? setoresDisponiveis.map(s => s.slug) : setoresSelecionados,
                cor: coresTurno.find(c => c.classe === corSelecionada)?.valor || 'verde',
                tipoRecorrencia: recorrencia,
                dataInicio: recorrencia === 'custom' ? dataInicio : undefined,
                dataFim: recorrencia === 'custom' ? dataFim : undefined,
                diasSemana: recorrencia === 'custom' ? diasSemana : undefined,
            });

            // Resetar modo edição
            setModoEdicao(false);

            // Callback de sucesso
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

    // Resetar errors ao fechar modal
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setErrors({});
            setModoEdicao(false);
            onClose();
        }
    };

    if (!turno) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                {/* Header com Gradiente */}
                <ModalHeaderPadrao
                    title={modoEdicao ? "Editar Turno" : "Detalhes do Turno"}
                    description={modoEdicao ? "Edite as configurações do turno." : "Visualize e gerencie as configurações do turno."}
                    icon={modoEdicao ? Edit : Briefcase}
                    theme={modoEdicao ? "warning" : "info"}
                />

                <div className="space-y-6 p-6">
                    {/* Informações do Turno */}
                    <div className="bg-muted/30 rounded-xl p-4 space-y-2 border border-border/50">
                        <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>Turno ID: {turno.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Horário: {turno.horaInicio} - {turno.horaFim}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Vagas: {turno.vagasTotal}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Recorrência: {turno.tipoRecorrencia === 'todos' ? 'Todos os dias' : turno.tipoRecorrencia === 'uteis' ? 'Dias úteis' : 'Personalizada'}
                        </div>
                    </div>

                    {/* Botões de Ação (apenas visualização) */}
                    {!modoEdicao && (
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setModoEdicao(true)}
                                className="flex items-center gap-2 hover:bg-muted/50"
                            >
                                <Edit className="h-4 w-4" />
                                Editar Turno
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeletar}
                                disabled={deletando}
                                className="flex items-center gap-2"
                            >
                                {deletando ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Excluir Turno
                            </Button>
                        </div>
                    )}

                    {/* Horários */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <Label className="font-medium">Horários</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="horaInicio">Hora de Início</Label>
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
                                    disabled={!modoEdicao}
                                    className={errors.horaInicio ? 'border-destructive focus:border-destructive' : ''}
                                />
                                {errors.horaInicio && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.horaInicio}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="horaFim">Hora de Fim</Label>
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
                                    disabled={!modoEdicao}
                                    className={errors.horaFim ? 'border-destructive focus:border-destructive' : ''}
                                />
                                {errors.horaFim && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.horaFim}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recorrência */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <Label className="font-medium">Recorrência</Label>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="todos" className="cursor-pointer font-normal">
                                    Todos os dias
                                </Label>
                                <Switch
                                    id="todos"
                                    checked={recorrencia === 'todos'}
                                    onCheckedChange={(checked) => checked && setRecorrencia('todos')}
                                    disabled={!modoEdicao}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="uteis" className="cursor-pointer font-normal">
                                    Dias úteis (Seg-Sex)
                                </Label>
                                <Switch
                                    id="uteis"
                                    checked={recorrencia === 'uteis'}
                                    onCheckedChange={(checked) => checked && setRecorrencia('uteis')}
                                    disabled={!modoEdicao}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="custom" className="cursor-pointer font-normal">
                                    Definir datas
                                </Label>
                                <Switch
                                    id="custom"
                                    checked={recorrencia === 'custom'}
                                    onCheckedChange={(checked) => checked && setRecorrencia('custom')}
                                    disabled={!modoEdicao}
                                />
                            </div>
                        </div>

                        {/* Campos de datas (aparecem apenas se "Definir datas" for selecionado) */}
                        {recorrencia === 'custom' && (
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="dataInicio">Data de Início</Label>
                                    <Input
                                        id="dataInicio"
                                        type="date"
                                        value={dataInicio}
                                        onChange={(e) => {
                                            setDataInicio(e.target.value);
                                            setErrors((prev) => {
                                                const novo = { ...prev };
                                                delete novo.dataInicio;
                                                return novo;
                                            });
                                        }}
                                        disabled={!modoEdicao}
                                        className={errors.dataInicio ? 'border-destructive focus:border-destructive' : ''}
                                    />
                                    {errors.dataInicio && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.dataInicio}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dataFim">Data de Fim</Label>
                                    <Input
                                        id="dataFim"
                                        type="date"
                                        value={dataFim}
                                        onChange={(e) => {
                                            setDataFim(e.target.value);
                                            setErrors((prev) => {
                                                const novo = { ...prev };
                                                delete novo.dataFim;
                                                return novo;
                                            });
                                        }}
                                        disabled={!modoEdicao}
                                        className={errors.dataFim ? 'border-destructive focus:border-destructive' : ''}
                                    />
                                    {errors.dataFim && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.dataFim}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Seleção de Dias da Semana (apenas para custom) */}
                        {recorrencia === 'custom' && (
                            <div className="space-y-3 pt-2">
                                <Label className="text-sm font-medium">Dias da Semana</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { label: 'Dom', value: 0 },
                                        { label: 'Seg', value: 1 },
                                        { label: 'Ter', value: 2 },
                                        { label: 'Qua', value: 3 },
                                        { label: 'Qui', value: 4 },
                                        { label: 'Sex', value: 5 },
                                        { label: 'Sáb', value: 6 },
                                    ].map((dia) => (
                                        <div key={dia.value} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`dia-${dia.value}`}
                                                checked={diasSemana.includes(dia.value)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setDiasSemana([...diasSemana, dia.value].sort());
                                                    } else {
                                                        setDiasSemana(diasSemana.filter(d => d !== dia.value));
                                                    }
                                                }}
                                                disabled={!modoEdicao}
                                            />
                                            <Label
                                                htmlFor={`dia-${dia.value}`}
                                                className="cursor-pointer font-normal text-sm"
                                            >
                                                {dia.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {recorrencia === 'custom' && diasSemana.length === 0 && (
                                    <p className="text-sm text-warning flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        Selecione ao menos um dia da semana
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Número de Vagas */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <Label className="font-medium">Número de Vagas</Label>
                            </div>
                            <span className="text-lg font-semibold text-primary">{numeroVagas[0]}</span>
                        </div>
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
                            disabled={!modoEdicao}
                            min={1}
                            max={10}
                            step={1}
                            className={errors.numeroVagas ? 'border-destructive' : ''}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1</span>
                            <span>10</span>
                        </div>
                        {errors.numeroVagas && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.numeroVagas}
                            </p>
                        )}
                    </div>

                    {/* Cor do Turno */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-primary" />
                            <Label className="font-medium">Cor do Turno</Label>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {coresTurno.map((cor) => (
                                <button
                                    key={cor.classe}
                                    type="button"
                                    onClick={() => setCorSelecionada(cor.classe)}
                                    disabled={!modoEdicao}
                                    className={`
                    relative w-12 h-12 rounded-full transition-all duration-200
                    hover:scale-105 shadow-sm border-2
                    ${cor.classe} opacity-90 hover:opacity-100
                    ${corSelecionada === cor.classe ? 'ring-2 ring-offset-2 ring-primary scale-105 border-transparent shadow-md' : 'border-border opacity-70'}
                    ${!modoEdicao ? 'cursor-not-allowed opacity-60' : ''}
                  `}
                                    title={cor.nome}
                                >
                                    {corSelecionada === cor.classe && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-6 h-6 bg-white/95 rounded-full flex items-center justify-center shadow-sm border border-white/20">
                                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Setores */}
                    <div className={`space-y-2 ${errors.setores ? 'p-4 rounded-xl bg-destructive/5 border border-destructive/20' : ''}`}>
                        <div className="flex items-center gap-2">
                            <Briefcase className={`h-4 w-4 ${errors.setores ? 'text-destructive' : 'text-primary'}`} />
                            <Label className={`font-medium ${errors.setores ? 'text-destructive' : ''}`}>Setores</Label>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="todos-setores" className="cursor-pointer font-normal">
                                    Todos
                                </Label>
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
                                    disabled={!modoEdicao}
                                />
                            </div>
                            {loadingSetores ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Carregando setores...
                                </div>
                            ) : (
                                setoresDisponiveis.map((setor) => (
                                    <div key={setor.id} className="flex items-center justify-between">
                                        <Label htmlFor={setor.id} className="cursor-pointer font-normal">
                                            {setor.nome}
                                        </Label>
                                        <Switch
                                            id={setor.id}
                                            checked={setoresSelecionados.includes(setor.slug)}
                                            onCheckedChange={() => {
                                                handleToggleSetor(setor.slug);
                                                setErrors((prev) => {
                                                    const novo = { ...prev };
                                                    delete novo.setores;
                                                    return novo;
                                                });
                                            }}
                                            disabled={!modoEdicao}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                        {errors.setores && (
                            <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                                <AlertCircle className="h-4 w-4" />
                                {errors.setores}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-6 bg-muted/30 border-t border-border/50">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={atualizando}
                        className="px-6 hover:bg-muted/50"
                    >
                        {modoEdicao ? 'Cancelar' : 'Fechar'}
                    </Button>
                    {modoEdicao && (
                        <Button
                            onClick={handleSalvar}
                            className="px-8 bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200"
                            disabled={atualizando || !isFormValid}
                            title={!isFormValid ? 'Corrija os erros antes de salvar' : ''}
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
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}