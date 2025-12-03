import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users } from 'lucide-react';

const DEPARTAMENTOS = [
    'Obras',
    'Assessoria',
    'Administrativo',
    'Financeiro',
    'RH',
    'Diretoria',
];

const URGENCIAS = [
    { value: 'baixa', label: 'Baixa - Até 30 dias' },
    { value: 'normal', label: 'Normal - Até 15 dias' },
    { value: 'alta', label: 'Alta - Até 7 dias' },
    { value: 'urgente', label: 'Urgente - Até 3 dias' },
];

interface StepAberturaSolicitacaoProps {
    data: {
        dataAbertura: string;
        solicitante: string;
        departamento: string;
        urgencia: string;
        justificativa: string;
    };
    onDataChange: (data: any) => void;
    readOnly?: boolean;
}

export function StepAberturaSolicitacao({ data, onDataChange, readOnly }: StepAberturaSolicitacaoProps) {
    const handleInputChange = (field: string, value: any) => {
        if (readOnly) return;
        onDataChange({ ...data, [field]: value });
    };

    const formatDate = (isoDate: string) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Abertura de Solicitação de Mão de Obra</h2>
                    <p className="text-sm text-muted-foreground">
                        Preencha as informações iniciais para solicitar contratação de novos colaboradores
                    </p>
                </div>
            </div>

            {/* Informações da Solicitação */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Informações da Solicitação
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dataAbertura">
                            Data de Abertura
                        </Label>
                        <Input
                            id="dataAbertura"
                            value={formatDate(data.dataAbertura)}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Preenchido automaticamente</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="urgencia">
                            Nível de Urgência <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.urgencia}
                            onValueChange={(value: string) => handleInputChange('urgencia', value)}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="urgencia">
                                <SelectValue placeholder="Selecione a urgência" />
                            </SelectTrigger>
                            <SelectContent>
                                {URGENCIAS.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="solicitante">
                            Nome do Solicitante <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="solicitante"
                            value={data.solicitante}
                            onChange={(e) => handleInputChange('solicitante', e.target.value)}
                            placeholder="Nome completo do solicitante"
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="departamento">
                            Departamento/Setor <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.departamento}
                            onValueChange={(value: string) => handleInputChange('departamento', value)}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="departamento">
                                <SelectValue placeholder="Selecione o departamento" />
                            </SelectTrigger>
                            <SelectContent>
                                {DEPARTAMENTOS.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="justificativa">
                        Justificativa da Contratação <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        id="justificativa"
                        value={data.justificativa}
                        onChange={(e) => handleInputChange('justificativa', e.target.value)}
                        placeholder="Descreva o motivo da necessidade de contratação, se é substituição, aumento de demanda, novo projeto, etc."
                        rows={4}
                        disabled={readOnly}
                    />
                </div>
            </div>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Esta solicitação será encaminhada ao RH para processamento.
                    Todos os campos marcados com <span className="text-destructive">*</span> são obrigatórios.
                </AlertDescription>
            </Alert>
        </div>
    );
}