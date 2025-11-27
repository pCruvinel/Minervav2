// OS 06: [Nome da OS 06] - Sistema Minerva ERP
'use client';

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { PrimaryButton } from '../ui/primary-button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';

interface OS06WorkflowPageProps {
    onBack?: () => void;
}

type EtapaOS06 = 'identificacao' | 'analise' | 'concluida';

export function OS06WorkflowPage({ onBack }: OS06WorkflowPageProps) {
    const [etapaAtual, setEtapaAtual] = useState<EtapaOS06>('identificacao');

    const renderEtapaIdentificacao = () => (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">1</span>
                    </div>
                    <div>
                        <CardTitle>Identificação da OS 06</CardTitle>
                        <p className="text-sm text-neutral-600 mt-1">
                            Componente básico para OS 06 - Implementação pendente
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Esta é uma implementação básica da OS 06. Funcionalidades completas serão implementadas em sprint futuro.
                    </AlertDescription>
                </Alert>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                    {onBack && (
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                    )}
                    <PrimaryButton onClick={() => setEtapaAtual('analise')}>
                        Continuar
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                    </PrimaryButton>
                </div>
            </CardContent>
        </Card>
    );

    const renderEtapaAnalise = () => (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-semibold text-purple-600">2</span>
                    </div>
                    <div>
                        <CardTitle>Análise da OS 06</CardTitle>
                        <p className="text-sm text-neutral-600 mt-1">
                            Etapa de análise - Funcionalidade básica
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-900 font-medium mb-1">
                        Análise em andamento
                    </p>
                    <p className="text-sm text-purple-700">
                        Esta é uma implementação básica. A análise real será implementada futuramente.
                    </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <Button variant="outline" onClick={() => setEtapaAtual('identificacao')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>

                    <PrimaryButton onClick={() => setEtapaAtual('concluida')}>
                        Concluir
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                    </PrimaryButton>
                </div>
            </CardContent>
        </Card>
    );

    const renderEtapaConcluida = () => (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <CardTitle>OS 06 Concluída</CardTitle>
                        <p className="text-sm text-neutral-600 mt-1">
                            Processo básico finalizado com sucesso
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-green-900 mb-1">
                                OS 06 Finalizada com Sucesso
                            </p>
                            <p className="text-sm text-green-700">
                                Implementação básica concluída. Funcionalidades completas serão desenvolvidas em sprint futuro.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-neutral-200">
                    {onBack && (
                        <PrimaryButton onClick={onBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar ao Menu
                        </PrimaryButton>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    // Timeline de Etapas
    const renderTimeline = () => {
        const etapas = [
            { id: 'identificacao', numero: 1, titulo: 'Identificação', status: etapaAtual === 'identificacao' ? 'atual' : 'concluida' },
            { id: 'analise', numero: 2, titulo: 'Análise', status: etapaAtual === 'analise' ? 'atual' : etapaAtual === 'identificacao' ? 'pendente' : 'concluida' },
            { id: 'concluida', numero: 3, titulo: 'Concluída', status: etapaAtual === 'concluida' ? 'atual' : ['identificacao', 'analise'].includes(etapaAtual) ? 'pendente' : 'concluida' },
        ];

        return (
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {etapas.map((etapa, index) => (
                        <React.Fragment key={etapa.id}>
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    ${etapa.status === 'concluida' ? 'bg-green-500 text-white' : ''}
                    ${etapa.status === 'atual' ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                    ${etapa.status === 'pendente' ? 'bg-neutral-200 text-neutral-500' : ''}
                  `}
                                >
                                    {etapa.status === 'concluida' ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        etapa.numero
                                    )}
                                </div>
                                <p
                                    className={`
                    text-xs text-center max-w-[80px]
                    ${etapa.status === 'atual' ? 'font-semibold text-primary' : ''}
                    ${etapa.status === 'concluida' ? 'text-green-600' : ''}
                    ${etapa.status === 'pendente' ? 'text-neutral-500' : ''}
                  `}
                                >
                                    {etapa.titulo}
                                </p>
                            </div>

                            {index < etapas.length - 1 && (
                                <div
                                    className={`
                    flex-1 h-0.5 mx-2
                    ${etapa.status === 'concluida' ? 'bg-green-500' : 'bg-neutral-200'}
                  `}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-teal-600">06</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold">OS 06: [Nome da OS 06]</h1>
                            <p className="text-neutral-600 mt-1">
                                Implementação básica - Funcionalidades completas em desenvolvimento
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                        Status: Implementação Básica
                    </Badge>
                </div>

                {/* Timeline */}
                {renderTimeline()}

                {/* Conteúdo da Etapa */}
                {etapaAtual === 'identificacao' && renderEtapaIdentificacao()}
                {etapaAtual === 'analise' && renderEtapaAnalise()}
                {etapaAtual === 'concluida' && renderEtapaConcluida()}
            </div>
        </div>
    );
}