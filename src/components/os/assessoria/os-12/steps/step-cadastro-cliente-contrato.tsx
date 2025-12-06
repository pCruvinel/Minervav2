import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar as CalendarIcon, Building2 } from 'lucide-react';
import { format, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/components/ui/utils';
import { CadastrarLead, type CadastrarLeadHandle, type FormDataCompleto } from '@/components/os/shared/steps/cadastrar-lead';

const TIPOS_CONTRATO = [
    { value: 'mensal', label: 'Mensal', duracao: 1 },
    { value: 'trimestral', label: 'Trimestral', duracao: 3 },
    { value: 'semestral', label: 'Semestral', duracao: 6 },
    { value: 'anual', label: 'Anual', duracao: 12 },
];

export interface StepCadastroClienteContratoHandle {
    validate: () => boolean;
}

interface StepCadastroClienteContratoProps {
    data: {
        leadId?: string;
        clienteId?: string;
        tipoContrato: string;
        dataInicioContrato: string;
        dataFimContrato: string;
        valorMensal: string;
    };
    onDataChange: (d: any) => void;
    readOnly?: boolean;
}

export const StepCadastroClienteContrato = forwardRef<StepCadastroClienteContratoHandle, StepCadastroClienteContratoProps>(
    ({ data, onDataChange, readOnly }, ref) => {
        const leadRef = React.useRef<CadastrarLeadHandle>(null);
        const [selectedLeadId, setSelectedLeadId] = useState<string>(data.leadId || data.clienteId || '');
        const [showCombobox, setShowCombobox] = useState(false);
        const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);

        // Estado do formulário de lead (compatível com CadastrarLead)
        const [formData, setFormData] = useState<FormDataCompleto>({
            nome: '',
            cpfCnpj: '',
            tipo: '',
            tipoEmpresa: '',
            nomeResponsavel: '',
            cargoResponsavel: '',
            telefone: '',
            email: '',
            tipoEdificacao: '',
            qtdUnidades: '',
            qtdBlocos: '',
            qtdPavimentos: '',
            tipoTelhado: '',
            possuiElevador: false,
            possuiPiscina: false,
            cep: '',
            endereco: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
        });

        // Expor método de validação
        useImperativeHandle(ref, () => ({
            validate: () => {
                if (!leadRef.current) return false;
                return leadRef.current.validate();
            }
        }));

        const handleSelectLead = (leadId: string, leadData?: any) => {
            setSelectedLeadId(leadId);
            onDataChange({ ...data, leadId, clienteId: leadId });
        };

        const handleInputChange = (field: string, value: any) => {
            if (readOnly) return;
            onDataChange({ ...data, [field]: value });
        };

    const handleTipoContratoChange = (tipo: string) => {
        if (readOnly) return;
        const tipoConfig = TIPOS_CONTRATO.find(t => t.value === tipo);
        if (tipoConfig && data.dataInicioContrato) {
            const dataInicio = new Date(data.dataInicioContrato);
            const dataFim = tipoConfig.duracao === 12
                ? addYears(dataInicio, 1)
                : addMonths(dataInicio, tipoConfig.duracao);
            onDataChange({
                ...data,
                tipoContrato: tipo,
                dataFimContrato: dataFim.toISOString(),
            });
        } else {
            handleInputChange('tipoContrato', tipo);
        }
    };

    const handleDataInicioChange = (date: Date | undefined) => {
        if (readOnly || !date) return;
        const tipoConfig = TIPOS_CONTRATO.find(t => t.value === data.tipoContrato);
        const dataFim = tipoConfig
            ? (tipoConfig.duracao === 12 ? addYears(date, 1) : addMonths(date, tipoConfig.duracao))
            : addYears(date, 1);
        onDataChange({
            ...data,
            dataInicioContrato: date.toISOString(),
            dataFimContrato: dataFim.toISOString(),
        });
    };

    const formatCurrency = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        const amount = Number(numbers) / 100;
        return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const dataInicio = data.dataInicioContrato ? new Date(data.dataInicioContrato) : undefined;
    const dataFim = data.dataFimContrato ? new Date(data.dataFimContrato) : undefined;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Cadastro do Cliente - Contrato de Assessoria</h2>
                    <p className="text-sm text-muted-foreground">
                        Preencha os dados do cliente e configure o tipo de contrato recorrente
                    </p>
                </div>
            </div>

            {/* Componente CadastrarLead Reutilizável */}
            <CadastrarLead
                ref={leadRef}
                selectedLeadId={selectedLeadId}
                onSelectLead={handleSelectLead}
                showCombobox={showCombobox}
                onShowComboboxChange={setShowCombobox}
                showNewLeadDialog={showNewLeadDialog}
                onShowNewLeadDialogChange={setShowNewLeadDialog}
                formData={formData}
                onFormDataChange={setFormData}
                readOnly={readOnly}
            />

            {/* Configuração do Contrato */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Configuração do Contrato
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="tipoContrato">Tipo de Contrato <span className="text-destructive">*</span></Label>
                        <Select
                            value={data.tipoContrato}
                            onValueChange={handleTipoContratoChange}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="tipoContrato">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIPOS_CONTRATO.map((tipo) => (
                                    <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="valorMensal">Valor Mensal <span className="text-destructive">*</span></Label>
                        <Input
                            id="valorMensal"
                            value={data.valorMensal}
                            onChange={(e) => handleInputChange('valorMensal', formatCurrency(e.target.value))}
                            placeholder="R$ 0,00"
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Data de Início <span className="text-destructive">*</span></Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn('w-full justify-start text-left font-normal', !dataInicio && 'text-muted-foreground')}
                                    disabled={readOnly}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dataInicio ? format(dataInicio, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dataInicio}
                                    onSelect={handleDataInicioChange}
                                    locale={ptBR}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>Data de Término (calculada)</Label>
                        <Input
                            value={dataFim ? format(dataFim, 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Calculada automaticamente com base no tipo de contrato</p>
                    </div>
                </div>
            </div>

            <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                    <strong>Contrato Recorrente:</strong> Este contrato inclui visitas semanais obrigatórias (OS-08)
                    e possibilidade de aprovação de reformas (OS-07). Após ativação, o sistema gerará
                    automaticamente as parcelas e agendamentos.
                </AlertDescription>
            </Alert>
        </div>
    );
});

StepCadastroClienteContrato.displayName = 'StepCadastroClienteContrato';