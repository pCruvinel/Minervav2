import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Lock } from 'lucide-react';
import { useEffect } from 'react';

// Mapeamento de setor_slug para nome legível
const SETOR_LABELS: Record<string, string> = {
    'obras': 'Obras',
    'assessoria': 'Assessoria',
    'administrativo': 'Administrativo',
    'financeiro': 'Financeiro',
    'rh': 'RH',
    'diretoria': 'Diretoria',
};

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
        solicitanteId?: string;
        departamento: string;
        urgencia: string;
        justificativa: string;
    };
    onDataChange: (data: any) => void;
    readOnly?: boolean;
    currentUser?: {
        id: string;
        nome_completo: string;
        setor_slug?: string;
    };
}

export function StepAberturaSolicitacao({ data, onDataChange, readOnly, currentUser }: StepAberturaSolicitacaoProps) {
    // Auto-preencher dados do usuário logado quando o componente monta
    useEffect(() => {
        if (currentUser && !data.solicitanteId) {
            const setorDisplay = currentUser.setor_slug
                ? (SETOR_LABELS[currentUser.setor_slug] || currentUser.setor_slug)
                : '';

            onDataChange({
                ...data,
                solicitante: currentUser.nome_completo,
                solicitanteId: currentUser.id,
                departamento: setorDisplay,
            });
        }
    }, [currentUser]);

    const handleInputChange = (field: string, value: any) => {
        if (readOnly) return;
        // Não permitir alteração de solicitante e departamento
        if (field === 'solicitante' || field === 'departamento') return;
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
                        <Label htmlFor="solicitante" className="flex items-center gap-1">
                            Nome do Solicitante
                            <Lock className="w-3 h-3 text-muted-foreground" />
                        </Label>
                        <Input
                            id="solicitante"
                            value={data.solicitante}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Preenchido automaticamente com o usuário logado</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="departamento" className="flex items-center gap-1">
                            Departamento/Setor
                            <Lock className="w-3 h-3 text-muted-foreground" />
                        </Label>
                        <Input
                            id="departamento"
                            value={data.departamento}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Preenchido automaticamente com o setor do usuário</p>
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

        </div>
    );
}
