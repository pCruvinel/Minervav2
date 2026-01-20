import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

interface StepSelecaoTipoObrasProps {
    data: {
        tipoOS?: string;
        descricaoOutros?: string;
    };
    onDataChange: (data: { tipoOS?: string; descricaoOutros?: string }) => void;
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

    const isOutros = data.tipoOS === 'OS 04: Outros';

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <RadioGroup
                    value={data.tipoOS}
                    onValueChange={(value) => onDataChange({ ...data, tipoOS: value })}
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

            {/* Campo de descrição para OS 04: Outros */}
            {isOutros && (
                <div className="space-y-2 pt-2">
                    <Label htmlFor="descricao-outros" className="text-sm font-medium">
                        Descreva o tipo de serviço: <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="descricao-outros"
                        placeholder="Ex: Impermeabilização de laje, Instalação de guarda-corpos..."
                        value={data.descricaoOutros || ''}
                        onChange={(e) => onDataChange({ ...data, descricaoOutros: e.target.value })}
                        disabled={disabled}
                        className="w-full"
                    />
                </div>
            )}
        </div>
    );
}

