/**
 * StepSelecaoCentroCusto - Etapa de Seleção de Centro de Custo (OS-10)
 *
 * Permite selecionar o centro de custo onde o colaborador será alocado.
 * Usa o componente reutilizável CentroCustoSelector.
 *
 * @example
 * ```tsx
 * <StepSelecaoCentroCusto
 *   data={stepData}
 *   onDataChange={setStepData}
 *   readOnly={false}
 * />
 * ```
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Building2 } from 'lucide-react';
import { CentroCustoSelector } from '@/components/shared/centro-custo-selector';

interface OS10StepData {
    centroCusto: string;
    centroCustoNome: string;
    obraVinculada: string;
}

interface StepSelecaoCentroCustoProps {
    data: OS10StepData;
    onDataChange: (data: OS10StepData) => void;
    readOnly?: boolean;
}

export function StepSelecaoCentroCusto({ data, onDataChange, readOnly }: StepSelecaoCentroCustoProps) {
    const handleCentroCustoChange = (ccId: string, ccData: { nome: string; cliente?: { nome_razao_social: string } } | null) => {
        if (readOnly) return;
        onDataChange({
            ...data,
            centroCusto: ccId,
            centroCustoNome: ccData?.nome || '',
            obraVinculada: ccData?.cliente?.nome_razao_social || '',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Seleção do Centro de Custo</h2>
                    <p className="text-sm text-muted-foreground">
                        Selecione o centro de custo onde o colaborador será alocado
                    </p>
                </div>
            </div>

            {/* Seleção de Centro de Custo */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Centro de Custo
                </h3>

                <CentroCustoSelector
                    value={data.centroCusto}
                    onChange={handleCentroCustoChange}
                    disabled={readOnly}
                    required
                    label="Centro de Custo Ativo"
                    showDetails
                />

                <p className="text-xs text-muted-foreground">
                    O custo do colaborador será automaticamente rateado neste centro de custo
                </p>
            </div>

            {/* Alerta informativo */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Importante:</strong> O colaborador contratado terá seu custo diário rateado
                    automaticamente no centro de custo selecionado. Certifique-se de escolher o centro
                    de custo correto.
                </AlertDescription>
            </Alert>
        </div>
    );
}