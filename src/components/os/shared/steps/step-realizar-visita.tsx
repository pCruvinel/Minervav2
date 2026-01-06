/**
 * StepRealizarVisita - Componente reutilizável para confirmação de visita
 * 
 * Usado em:
 * - OS 1-4 (Obras): Etapa 5 - Realizar Visita (Técnica)
 * - OS 1-4 (Obras): Etapa 11 - Realizar Visita (Apresentação)
 * - OS 5-6, 7, 8, 11, 12: Etapas de visita
 * 
 * Funcionalidades:
 * - Switch para confirmar realização da visita
 * - Campo de observações para anotações
 * - Card de confirmação com data
 * - Modo read-only para etapas concluídas
 * - Suporte para diferentes tipos (Técnica, Apresentação, etc)
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Check, ClipboardList } from 'lucide-react';

// =====================================================
// TYPES
// =====================================================

export interface StepRealizarVisitaData {
    visitaRealizada?: boolean;
    dataVisita?: string;
    observacoes?: string;
}

interface StepRealizarVisitaProps {
    data: StepRealizarVisitaData;
    onDataChange: (data: StepRealizarVisitaData) => void;
    readOnly?: boolean;
    /** Tipo de visita para customizar textos */
    tipoVisita?: 'tecnica' | 'apresentacao' | 'custom';
    /** Título personalizado (override automático baseado em tipoVisita) */
    titulo?: string;
    /** Descrição personalizada */
    descricao?: string;
    /** Label do switch personalizado */
    labelSwitch?: string;
    /** Mostrar campo de observações (default: true) */
    showObservacoes?: boolean;
    /** Placeholder do campo de observações */
    observacoesPlaceholder?: string;
}

// =====================================================
// COMPONENTE
// =====================================================

export function StepRealizarVisita({
    data,
    onDataChange,
    readOnly = false,
    tipoVisita = 'tecnica',
    titulo,
    descricao,
    labelSwitch,
    showObservacoes = true,
    observacoesPlaceholder,
}: StepRealizarVisitaProps) {
    // Textos baseados no tipo de visita
    const textos = {
        tecnica: {
            titulo: 'Confirmar Realização da Visita Técnica',
            descricao: 'Marque a caixa abaixo para confirmar que a visita técnica foi realizada.',
            labelSwitch: 'Visita técnica realizada',
            observacoesPlaceholder: 'Observações sobre a visita técnica (condições do local, acesso, etc.)',
            alertDescricao: 'Confirme a realização da visita técnica ao local.',
        },
        apresentacao: {
            titulo: 'Confirmar Realização da Visita de Apresentação',
            descricao: 'Marque a caixa abaixo para confirmar que a apresentação da proposta foi realizada.',
            labelSwitch: 'Apresentação realizada',
            observacoesPlaceholder: 'Observações sobre a apresentação (feedback do cliente, dúvidas, etc.)',
            alertDescricao: 'Confirme a realização da visita de apresentação da proposta.',
        },
        custom: {
            titulo: titulo || 'Confirmar Realização da Visita',
            descricao: descricao || 'Marque a caixa abaixo para confirmar que a visita foi realizada.',
            labelSwitch: labelSwitch || 'Visita realizada',
            observacoesPlaceholder: observacoesPlaceholder || 'Observações sobre a visita...',
            alertDescricao: 'Confirme a realização da visita.',
        },
    };

    const config = textos[tipoVisita];

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleVisitaChange = (visitaRealizada: boolean) => {
        if (readOnly) return;
        onDataChange({
            ...data,
            visitaRealizada,
            dataVisita: visitaRealizada ? new Date().toISOString().split('T')[0] : undefined,
        });
    };

    const handleObservacoesChange = (observacoes: string) => {
        if (readOnly) return;
        onDataChange({
            ...data,
            observacoes,
        });
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="space-y-6">
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    {config.alertDescricao}
                </AlertDescription>
            </Alert>

            {/* Confirmação da Visita */}
            <div className="flex flex-col items-center justify-center py-12 gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center">
                    <h3 className="font-medium mb-2">
                        {titulo || config.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {descricao || config.descricao}
                    </p>
                    <div className="flex items-center space-x-3 justify-center">
                        <Switch
                            id="visitaRealizada"
                            checked={data.visitaRealizada ?? false}
                            onCheckedChange={handleVisitaChange}
                            disabled={readOnly}
                        />
                        <Label htmlFor="visitaRealizada" className="cursor-pointer">
                            {labelSwitch || config.labelSwitch}
                        </Label>
                    </div>
                </div>
            </div>

            {/* Card de Confirmação */}
            {data.visitaRealizada && (
                <Card className="bg-success/5 border-success/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-success" />
                            <div>
                                <p className="text-sm font-medium">Visita confirmada!</p>
                                <p className="text-sm text-muted-foreground">
                                    Data: {data.dataVisita
                                        ? new Date(data.dataVisita + 'T00:00:00').toLocaleDateString('pt-BR')
                                        : new Date().toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Campo de Observações */}
            {showObservacoes && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="observacoes" className="font-medium">
                                    Observações
                                </Label>
                            </div>
                            <Textarea
                                id="observacoes"
                                placeholder={observacoesPlaceholder || config.observacoesPlaceholder}
                                value={data.observacoes ?? ''}
                                onChange={(e) => handleObservacoesChange(e.target.value)}
                                disabled={readOnly}
                                rows={4}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Opcional: Adicione observações relevantes sobre a visita.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

