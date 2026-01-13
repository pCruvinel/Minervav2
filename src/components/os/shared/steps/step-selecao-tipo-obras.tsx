import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';

interface StepSelecaoTipoObrasProps {
    data: {
        tipoOS?: string;
    };
    onDataChange: (data: { tipoOS: string }) => void;
    disabled?: boolean;
}

export function StepSelecaoTipoObras({ data, onDataChange, disabled }: StepSelecaoTipoObrasProps) {
    // Mapeamento de descrições para cada tipo de OS
    const osDescriptions: Record<string, string> = {
        'OS 01: Perícia de Fachada': 'Inspeção técnica e laudo de fachadas',
        'OS 02: Revitalização de Fachada': 'Projeto de revitalização e restauração',
        'OS 03: Reforço Estrutural': 'Reforço estrutural de edificações',
        'OS 04: Outros': 'Outros serviços de obras não categorizados',
    };

    return (
        <div className="space-y-6">
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Selecione o tipo de ordem de serviço que será criada. Esta definição é crucial para o fluxo de trabalho.
                </AlertDescription>
            </Alert>

            <div className="space-y-3">
                <RadioGroup
                    value={data.tipoOS}
                    onValueChange={(value) => onDataChange({ tipoOS: value })}
                    className="space-y-3"
                    disabled={disabled}
                >
                    {Object.entries(osDescriptions).map(([tipo, descricao]) => (
                        <div key={tipo} className={`flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/5 transition-colors ${data.tipoOS === tipo ? 'border-primary bg-primary/5' : ''}`}>
                            <RadioGroupItem value={tipo} id={tipo.replace(/\s+/g, '-').toLowerCase()} />
                            <Label htmlFor={tipo.replace(/\s+/g, '-').toLowerCase()} className="flex-1 cursor-pointer">
                                <div>
                                    <div className="text-base font-medium">{tipo}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {descricao}
                                    </div>
                                </div>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {data.tipoOS && (
                <Card className="bg-success/5 border-success/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-success" />
                            <div>
                                <div className="text-sm font-medium">Tipo selecionado:</div>
                                <div className="text-base">
                                    {data.tipoOS}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {data.tipoOS && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Após a conclusão desta OS Comercial, será criada automaticamente uma OS 13 (Start de Contrato) para a execução da obra.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
