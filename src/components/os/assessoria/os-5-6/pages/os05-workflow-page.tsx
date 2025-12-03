// OS 05: [Nome da OS 05] - Sistema Minerva ERP
'use client';

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OS05WorkflowPageProps {
    onBack?: () => void;
}

type EtapaOS05 = 'identificacao' | 'processamento' | 'concluida';

export function OS05WorkflowPage({ onBack }: OS05WorkflowPageProps) {
    const [etapaAtual, setEtapaAtual] = useState<EtapaOS05>('identificacao');

    const renderEtapaIdentificacao = () => (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">1</span>
                    </div>
                    <div>
                        <CardTitle>Identificação da OS 05</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Componente básico para OS 05 - Implementação pendente
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Esta é uma implementação básica da OS 05. Funcionalidades completas serão implementadas em sprint futuro.
                    </AlertDescription>
                </Alert>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    {onBack && (
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                    )}
                    <PrimaryButton onClick={() => setEtapaAtual('processamento')}>
                        Continuar
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                    </PrimaryButton>
                </div>
            </CardContent>
        </Card>
    );

    const renderEtapaProcessamento = () => (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">2</span>
                    </div>
                    <div>
                        <CardTitle>Processamento da OS 05</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Etapa de processamento - Funcionalidade básica
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm text-primary font-medium mb-1">
                        Processamento em andamento
                    </p>
                    <p className="text-sm text-primary">
                        Esta é uma implementação básica. O processamento real será implementado futuramente.
                    </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
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
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-success" />
                    </div>
                    <div>
                        <CardTitle>OS 05 Concluída</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Processo básico finalizado com sucesso
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-success mb-1">
                                OS 05 Finalizada com Sucesso
                            </p>
                            <p className="text-sm text-success">
                                Implementação básica concluída. Funcionalidades completas serão desenvolvidas em sprint futuro.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-border">
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
            { id: 'processamento', numero: 2, titulo: 'Processamento', status: etapaAtual === 'processamento' ? 'atual' : etapaAtual === 'identificacao' ? 'pendente' : 'concluida' },
            { id: 'concluida', numero: 3, titulo: 'Concluída', status: etapaAtual === 'concluida' ? 'atual' : ['identificacao', 'processamento'].includes(etapaAtual) ? 'pendente' : 'concluida' },
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
                    ${etapa.status === 'concluida' ? 'bg-success text-white' : ''}
                    ${etapa.status === 'atual' ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                    ${etapa.status === 'pendente' ? 'bg-muted text-muted-foreground' : ''}
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
                    ${etapa.status === 'concluida' ? 'text-success' : ''}
                    ${etapa.status === 'pendente' ? 'text-muted-foreground' : ''}
                  `}
                                >
                                    {etapa.titulo}
                                </p>
                            </div>

                            {index < etapas.length - 1 && (
                                <div
                                    className={`
                    flex-1 h-0.5 mx-2
                    ${etapa.status === 'concluida' ? 'bg-success' : 'bg-muted'}
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
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-warning">05</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold">OS 05: [Nome da OS 05]</h1>
                            <p className="text-muted-foreground mt-1">
                                Implementação básica - Funcionalidades completas em desenvolvimento
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-warning/5 text-warning border-warning/20">
                        Status: Implementação Básica
                    </Badge>
                </div>

                {/* Timeline */}
                {renderTimeline()}

                {/* Conteúdo da Etapa */}
                {etapaAtual === 'identificacao' && renderEtapaIdentificacao()}
                {etapaAtual === 'processamento' && renderEtapaProcessamento()}
                {etapaAtual === 'concluida' && renderEtapaConcluida()}
            </div>
        </div>
    );
}