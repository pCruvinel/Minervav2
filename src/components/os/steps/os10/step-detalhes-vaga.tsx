import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar as CalendarIcon, FileText, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/components/ui/utils';

const ESCOLARIDADES = [
    'Fundamental Incompleto',
    'Fundamental Completo',
    'Médio Incompleto',
    'Médio Completo',
    'Técnico',
    'Superior Incompleto',
    'Superior Completo',
    'Pós-Graduação',
    'Mestrado',
    'Doutorado',
];

const EXPERIENCIAS = [
    { value: 'nenhuma', label: 'Sem experiência necessária' },
    { value: '6_meses', label: 'Mínimo 6 meses' },
    { value: '1_ano', label: 'Mínimo 1 ano' },
    { value: '2_anos', label: 'Mínimo 2 anos' },
    { value: '3_anos', label: 'Mínimo 3 anos' },
    { value: '5_anos', label: 'Mínimo 5 anos' },
    { value: '10_anos', label: 'Mínimo 10 anos' },
];

const BENEFICIOS_DISPONIVEIS = [
    'Vale Transporte',
    'Vale Alimentação',
    'Vale Refeição',
    'Plano de Saúde',
    'Plano Odontológico',
    'Seguro de Vida',
    'Auxílio Creche',
    'Gympass',
    'PLR',
    'Cesta Básica',
];

const HABILIDADES_SUGERIDAS = [
    'Trabalho em equipe',
    'Proatividade',
    'Organização',
    'Comunicação',
    'Liderança',
    'Conhecimento técnico',
    'CNH categoria B',
    'CNH categoria D',
    'NR-35 (Trabalho em Altura)',
    'NR-10 (Segurança em Eletricidade)',
    'NR-18 (Construção Civil)',
    'Pacote Office',
    'AutoCAD',
    'MS Project',
];

interface StepDetalhesVagaProps {
    data: {
        habilidadesNecessarias: string[];
        experienciaMinima: string;
        escolaridade: string;
        salarioPrevisto: string;
        beneficios: string[];
        observacoes: string;
        dataInicioDesejada: string;
    };
    onDataChange: (data: any) => void;
    readOnly?: boolean;
}

export function StepDetalhesVaga({ data, onDataChange, readOnly }: StepDetalhesVagaProps) {
    const handleInputChange = (field: string, value: any) => {
        if (readOnly) return;
        onDataChange({ ...data, [field]: value });
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (readOnly) return;
        if (date) {
            handleInputChange('dataInicioDesejada', date.toISOString());
        }
    };

    const toggleHabilidade = (habilidade: string) => {
        if (readOnly) return;
        const current = data.habilidadesNecessarias || [];
        if (current.includes(habilidade)) {
            handleInputChange('habilidadesNecessarias', current.filter((h: string) => h !== habilidade));
        } else {
            handleInputChange('habilidadesNecessarias', [...current, habilidade]);
        }
    };

    const toggleBeneficio = (beneficio: string) => {
        if (readOnly) return;
        const current = data.beneficios || [];
        if (current.includes(beneficio)) {
            handleInputChange('beneficios', current.filter((b: string) => b !== beneficio));
        } else {
            handleInputChange('beneficios', [...current, beneficio]);
        }
    };

    const dataInicio = data.dataInicioDesejada ? new Date(data.dataInicioDesejada) : undefined;

    const formatCurrency = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        const amount = Number(numbers) / 100;
        return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleSalarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return;
        const formatted = formatCurrency(e.target.value);
        handleInputChange('salarioPrevisto', formatted);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Detalhes da Vaga</h2>
                    <p className="text-sm text-muted-foreground">
                        Defina os requisitos, habilidades e condições da vaga
                    </p>
                </div>
            </div>

            {/* Requisitos */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Requisitos da Vaga
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="experienciaMinima">
                            Experiência Mínima <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.experienciaMinima}
                            onValueChange={(value: string) => handleInputChange('experienciaMinima', value)}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="experienciaMinima">
                                <SelectValue placeholder="Selecione a experiência" />
                            </SelectTrigger>
                            <SelectContent>
                                {EXPERIENCIAS.map((exp) => (
                                    <SelectItem key={exp.value} value={exp.value}>
                                        {exp.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="escolaridade">
                            Escolaridade Mínima <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.escolaridade}
                            onValueChange={(value: string) => handleInputChange('escolaridade', value)}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="escolaridade">
                                <SelectValue placeholder="Selecione a escolaridade" />
                            </SelectTrigger>
                            <SelectContent>
                                {ESCOLARIDADES.map((esc) => (
                                    <SelectItem key={esc} value={esc}>
                                        {esc}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Habilidades */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Habilidades Necessárias
                </h3>

                <div className="space-y-2">
                    <Label>Selecione as habilidades requeridas</Label>
                    <div className="flex flex-wrap gap-2">
                        {HABILIDADES_SUGERIDAS.map((habilidade) => {
                            const isSelected = (data.habilidadesNecessarias || []).includes(habilidade);
                            return (
                                <Badge
                                    key={habilidade}
                                    variant={isSelected ? 'default' : 'outline'}
                                    className={cn(
                                        'cursor-pointer transition-all',
                                        isSelected ? 'bg-primary' : 'hover:bg-muted',
                                        readOnly && 'cursor-not-allowed opacity-70'
                                    )}
                                    onClick={() => toggleHabilidade(habilidade)}
                                >
                                    {isSelected ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                                    {habilidade}
                                </Badge>
                            );
                        })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {(data.habilidadesNecessarias || []).length} habilidade(s) selecionada(s)
                    </p>
                </div>
            </div>

            {/* Remuneração e Benefícios */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Remuneração e Benefícios
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="salarioPrevisto">
                            Salário Previsto
                        </Label>
                        <Input
                            id="salarioPrevisto"
                            value={data.salarioPrevisto}
                            onChange={handleSalarioChange}
                            placeholder="R$ 0,00"
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Data de Início Desejada
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !dataInicio && 'text-muted-foreground'
                                    )}
                                    disabled={readOnly}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dataInicio ? format(dataInicio, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione a data'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dataInicio}
                                    onSelect={handleDateSelect}
                                    locale={ptBR}
                                    disabled={(date: Date) => date < new Date() || !!readOnly}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Benefícios Oferecidos</Label>
                    <div className="flex flex-wrap gap-2">
                        {BENEFICIOS_DISPONIVEIS.map((beneficio) => {
                            const isSelected = (data.beneficios || []).includes(beneficio);
                            return (
                                <Badge
                                    key={beneficio}
                                    variant={isSelected ? 'default' : 'outline'}
                                    className={cn(
                                        'cursor-pointer transition-all',
                                        isSelected ? 'bg-success' : 'hover:bg-muted',
                                        readOnly && 'cursor-not-allowed opacity-70'
                                    )}
                                    onClick={() => toggleBeneficio(beneficio)}
                                >
                                    {isSelected ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                                    {beneficio}
                                </Badge>
                            );
                        })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {(data.beneficios || []).length} benefício(s) selecionado(s)
                    </p>
                </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
                <Label htmlFor="observacoes">Observações Adicionais</Label>
                <Textarea
                    id="observacoes"
                    value={data.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    placeholder="Informações adicionais sobre a vaga, requisitos específicos, etc."
                    rows={4}
                    disabled={readOnly}
                />
            </div>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Estas informações serão utilizadas pelo RH para conduzir o processo seletivo
                    e encontrar o candidato ideal para a vaga.
                </AlertDescription>
            </Alert>
        </div>
    );
}