import React, { useMemo } from 'react';
import { Card } from '../ui/card';
import { toast } from '../../lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from './workflow-stepper';
import { WorkflowFooter } from './workflow-footer';
import { StepCadastroClienteContrato } from './steps/os12/step-cadastro-cliente-contrato';
import { StepDefinicaoSLA } from './steps/os12/step-definicao-sla';
import { StepSetupRecorrencia } from './steps/os12/step-setup-recorrencia';
import { StepAlocacaoEquipe } from './steps/os12/step-alocacao-equipe';
import { StepConfigCalendario } from './steps/os12/step-config-calendario';
import { StepInicioServicos } from './steps/os12/step-inicio-servicos';
import { ChevronLeft, Info } from 'lucide-react';
import { useWorkflowState } from '../../lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '../../lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '../../lib/hooks/use-workflow-completion';

const steps: WorkflowStep[] = [
    { id: 1, title: 'Cadastro do Cliente', short: 'Cliente', responsible: 'Assessoria', status: 'active' },
    { id: 2, title: 'Definição de SLA', short: 'SLA', responsible: 'Gestor', status: 'pending' },
    { id: 3, title: 'Setup de Recorrência', short: 'Recorrência', responsible: 'ADM', status: 'pending' },
    { id: 4, title: 'Alocação de Equipe', short: 'Equipe', responsible: 'Gestor', status: 'pending' },
    { id: 5, title: 'Configuração Calendário', short: 'Calendário', responsible: 'Sistema', status: 'pending' },
    { id: 6, title: 'Início dos Serviços', short: 'Início', responsible: 'Sistema', status: 'pending' },
];

interface OS12WorkflowPageProps {
    onBack?: () => void;
    osId?: string;
}

export function OS12WorkflowPage({ onBack, osId }: OS12WorkflowPageProps) {
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
        tipoContrato: 'mensal',
        dataInicioContrato: '',
        dataFimContrato: '',
        valorMensal: '',
    };

    // Etapa 2: Definição de SLA
    const etapa2Data = formDataByStep[2] || {
        tempoResposta: '',
        visitasSemanais: 1,
        diasAtendimento: [],
        horarioInicio: '',
        horarioFim: '',
        servicosIncluidos: [],
        penalidades: '',
    };

    // Etapa 3: Setup de Recorrência
    const etapa3Data = formDataByStep[3] || {
        frequenciaCobranca: 'mensal',
        diaPagamento: '',
        formaPagamento: '',
        valorContrato: '',
        reajusteAnual: true,
        percentualReajuste: '5',
        parcelasGeradas: [],
    };

    // Etapa 4: Alocação de Equipe
    const etapa4Data = formDataByStep[4] || {
        tecnicoResponsavel: '',
        equipeSuporteIds: [],
        coordenadorId: '',
    };

    // Etapa 5: Configuração do Calendário
    const etapa5Data = formDataByStep[5] || {
        visitasAgendadas: [],
        diasSemana: [],
        horarioVisita: '',
        alertasConfigurados: true,
    };

    // Etapa 6: Início dos Serviços
    const etapa6Data = formDataByStep[6] || {
        contratoAtivado: false,
        dataAtivacao: '',
        primeiraVisitaAgendada: false,
        observacoes: '',
    };

    const setEtapa1Data = (d: any) => setStepData(1, d);
    const setEtapa2Data = (d: any) => setStepData(2, d);
    const setEtapa3Data = (d: any) => setStepData(3, d);
    const setEtapa4Data = (d: any) => setStepData(4, d);
    const setEtapa5Data = (d: any) => setStepData(5, d);
    const setEtapa6Data = (d: any) => setStepData(6, d);

    const completionRules = useMemo(() => ({
        1: (d: any) => !!(d.nomeCliente && d.cpfCnpj && d.tipoContrato),
        2: (d: any) => !!(d.visitasSemanais && d.diasAtendimento?.length > 0),
        3: (d: any) => !!(d.frequenciaCobranca && d.valorContrato),
        4: (d: any) => !!(d.tecnicoResponsavel),
        5: (d: any) => !!(d.diasSemana?.length > 0),
        6: (d: any) => !!(d.contratoAtivado),
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
                            <h1 className="text-2xl">OS-12: Assessoria Técnica Mensal/Anual</h1>
                            {osId && <p className="text-muted-foreground">OS #{osId}</p>}
                            <p className="text-sm text-muted-foreground">Contrato de Assessoria Recorrente</p>
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
                            <StepCadastroClienteContrato data={etapa1Data} onDataChange={setEtapa1Data} readOnly={isHistoricalNavigation} />
                        )}
                        {currentStep === 2 && (
                            <StepDefinicaoSLA data={etapa2Data} onDataChange={setEtapa2Data} readOnly={isHistoricalNavigation} />
                        )}
                        {currentStep === 3 && (
                            <StepSetupRecorrencia
                                data={etapa3Data}
                                onDataChange={setEtapa3Data}
                                readOnly={isHistoricalNavigation}
                                valorMensal={etapa1Data.valorMensal}
                                dataInicio={etapa1Data.dataInicioContrato}
                            />
                        )}
                        {currentStep === 4 && (
                            <StepAlocacaoEquipe data={etapa4Data} onDataChange={setEtapa4Data} readOnly={isHistoricalNavigation} />
                        )}
                        {currentStep === 5 && (
                            <StepConfigCalendario
                                data={etapa5Data}
                                onDataChange={setEtapa5Data}
                                readOnly={isHistoricalNavigation}
                                slaData={etapa2Data}
                            />
                        )}
                        {currentStep === 6 && (
                            <StepInicioServicos
                                data={etapa6Data}
                                onDataChange={setEtapa6Data}
                                readOnly={isHistoricalNavigation}
                                clienteData={etapa1Data}
                                slaData={etapa2Data}
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