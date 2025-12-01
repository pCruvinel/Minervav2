import React, { useMemo } from 'react';
import { Card } from '../ui/card';
import { toast } from '../../lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from './workflow-stepper';
import { WorkflowFooter } from './workflow-footer';
import { StepCadastroCliente } from './steps/os11/step-cadastro-cliente';
import { StepAgendarVisita } from './steps/os11/step-agendar-visita';
import { StepRealizarVisita } from './steps/os11/step-realizar-visita';
import { StepAnexarRT } from './steps/os11/step-anexar-rt';
import { StepGerarDocumento } from './steps/os11/step-gerar-documento';
import { StepEnviarCliente } from './steps/os11/step-enviar-cliente';
import { ChevronLeft, Info } from 'lucide-react';
import { useWorkflowState } from '../../lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '../../lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '../../lib/hooks/use-workflow-completion';

const steps: WorkflowStep[] = [
    { id: 1, title: 'Cadastrar Cliente', short: 'Cliente', responsible: 'Assessoria', status: 'active' },
    { id: 2, title: 'Agendar Visita', short: 'Agendar', responsible: 'Assessoria', status: 'pending' },
    { id: 3, title: 'Realizar Visita', short: 'Visita', responsible: 'Técnico', status: 'pending' },
    { id: 4, title: 'Anexar RT', short: 'RT', responsible: 'Técnico', status: 'pending' },
    { id: 5, title: 'Gerar Documento', short: 'PDF', responsible: 'Sistema', status: 'pending' },
    { id: 6, title: 'Enviar ao Cliente', short: 'Envio', responsible: 'Sistema', status: 'pending' },
];

interface OS11WorkflowPageProps {
    onBack?: () => void;
    osId?: string;
}

export function OS11WorkflowPage({ onBack, osId }: OS11WorkflowPageProps) {
    const {
        currentStep,
        setCurrentStep,
        lastActiveStep,
        setLastActiveStep,
        isHistoricalNavigation,
        setIsHistoricalNavigation,
        formDataByStep,
        setStepData,
        saveStep,
        completedSteps: completedStepsFromHook,
        isLoading: isLoadingData
    } = useWorkflowState({
        osId,
        totalSteps: steps.length
    });

    const {
        handleStepClick,
        handleReturnToActive,
        handleNextStep,
        handlePrevStep
    } = useWorkflowNavigation({
        totalSteps: steps.length,
        currentStep,
        setCurrentStep,
        lastActiveStep,
        setLastActiveStep,
        isHistoricalNavigation,
        setIsHistoricalNavigation,
        onSaveStep: (step) => saveStep(step, false)
    });

    // Etapa 1: Cadastro do Cliente
    const etapa1Data = formDataByStep[1] || {
        clienteId: '',
        nomeCliente: '',
        cpfCnpj: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        tipoImovel: '',
        observacoes: '',
    };

    // Etapa 2: Agendar Visita
    const etapa2Data = formDataByStep[2] || {
        dataVisita: '',
        horarioVisita: '',
        tecnicoResponsavel: '',
        duracaoEstimada: '',
        instrucoes: '',
    };

    // Etapa 3: Realizar Visita
    const etapa3Data = formDataByStep[3] || {
        visitaRealizada: false,
        dataRealizacao: '',
        horaChegada: '',
        horaSaida: '',
        respostas: {},
        fotos: [],
        observacoesVisita: '',
    };

    // Etapa 4: Anexar RT
    const etapa4Data = formDataByStep[4] || {
        arquivoRT: null,
        numeroRT: '',
        dataRT: '',
        profissionalResponsavel: '',
        crea: '',
    };

    // Etapa 5: Gerar Documento
    const etapa5Data = formDataByStep[5] || {
        documentoGerado: false,
        urlDocumento: '',
        dataGeracao: '',
        templateUsado: 'laudo-tecnico',
    };

    // Etapa 6: Enviar ao Cliente
    const etapa6Data = formDataByStep[6] || {
        enviado: false,
        dataEnvio: '',
        emailEnviado: '',
        confirmacaoRecebimento: false,
    };

    const setEtapa1Data = (d: any) => setStepData(1, d);
    const setEtapa2Data = (d: any) => setStepData(2, d);
    const setEtapa3Data = (d: any) => setStepData(3, d);
    const setEtapa4Data = (d: any) => setStepData(4, d);
    const setEtapa5Data = (d: any) => setStepData(5, d);
    const setEtapa6Data = (d: any) => setStepData(6, d);

    const completionRules = useMemo(() => ({
        1: (d: any) => !!(d.nomeCliente && d.cpfCnpj && d.endereco),
        2: (d: any) => !!(d.dataVisita && d.tecnicoResponsavel),
        3: (d: any) => !!(d.visitaRealizada),
        4: (d: any) => !!(d.arquivoRT && d.numeroRT),
        5: (d: any) => !!(d.documentoGerado),
        6: (d: any) => !!(d.enviado),
    }), []);

    const { completedSteps } = useWorkflowCompletion({
        currentStep,
        formDataByStep,
        completionRules,
        completedStepsFromHook
    });

    const handleSaveStep = async () => {
        try {
            await saveStep(currentStep, true);
            toast.success('Dados salvos com sucesso!');
        } catch {
            toast.error('Erro ao salvar dados');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-white border-b border-border">
                <div className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span>Voltar</span>
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl">OS-11: Laudo Pontual Assessoria</h1>
                            {osId && <p className="text-muted-foreground">OS #{osId}</p>}
                            <p className="text-sm text-muted-foreground">Emissão de Laudo Técnico Pontual</p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <WorkflowStepper
                        steps={steps}
                        currentStep={currentStep}
                        onStepClick={handleStepClick}
                        completedSteps={completedSteps}
                        lastActiveStep={lastActiveStep || undefined}
                    />

                    {isHistoricalNavigation && lastActiveStep && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
                            <button
                                onClick={handleReturnToActive}
                                className="bg-warning hover:bg-warning text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all hover:shadow-xl font-medium"
                            >
                                <ChevronLeft className="w-4 h-4 rotate-180" />
                                <span className="font-semibold text-sm">Voltar para Etapa {lastActiveStep}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isHistoricalNavigation && (
                <div className="mt-4 bg-primary/5 border-l-4 border-primary p-4 mx-6 rounded-r-lg flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-primary text-sm">Modo de Visualização Histórica</h4>
                        <p className="text-primary text-sm">
                            Você está visualizando dados de uma etapa já concluída.
                            {lastActiveStep && <> Você estava trabalhando na <strong>Etapa {lastActiveStep}</strong>.</>}
                        </p>
                    </div>
                </div>
            )}

            <div className="px-6 py-6">
                <Card className="max-w-5xl mx-auto">
                    <div className="p-6">
                        {currentStep === 1 && (
                            <StepCadastroCliente data={etapa1Data} onDataChange={setEtapa1Data} readOnly={isHistoricalNavigation} />
                        )}
                        {currentStep === 2 && (
                            <StepAgendarVisita data={etapa2Data} onDataChange={setEtapa2Data} readOnly={isHistoricalNavigation} />
                        )}
                        {currentStep === 3 && (
                            <StepRealizarVisita data={etapa3Data} onDataChange={setEtapa3Data} readOnly={isHistoricalNavigation} />
                        )}
                        {currentStep === 4 && (
                            <StepAnexarRT data={etapa4Data} onDataChange={setEtapa4Data} readOnly={isHistoricalNavigation} />
                        )}
                        {currentStep === 5 && (
                            <StepGerarDocumento
                                data={etapa5Data}
                                onDataChange={setEtapa5Data}
                                readOnly={isHistoricalNavigation}
                                clienteData={etapa1Data}
                                visitaData={etapa3Data}
                                rtData={etapa4Data}
                            />
                        )}
                        {currentStep === 6 && (
                            <StepEnviarCliente
                                data={etapa6Data}
                                onDataChange={setEtapa6Data}
                                readOnly={isHistoricalNavigation}
                                clienteEmail={etapa1Data.email}
                                documentoUrl={etapa5Data.urlDocumento}
                            />
                        )}
                    </div>
                </Card>
            </div>

            <WorkflowFooter
                currentStep={currentStep}
                totalSteps={steps.length}
                onPrevStep={handlePrevStep}
                onNextStep={handleNextStep}
                onSaveDraft={handleSaveStep}
                readOnlyMode={isHistoricalNavigation}
                onReturnToActive={handleReturnToActive}
                isLoading={isLoadingData}
            />
        </div>
    );
}