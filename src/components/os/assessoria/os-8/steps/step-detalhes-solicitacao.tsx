import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StepLayout } from '@/components/os/shared/wrappers/step-layout';
import { 
    FormDetalhesVisita, 
    DetalhesSolicitacaoData,
    EMPTY_DETALHES_DATA,
    FormDetalhesVisitaRef
} from '../shared/form-detalhes-visita';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';

// Re-exportar tipos para compatibilidade
export type { DetalhesSolicitacaoData as StepDetalhesSolicitacaoData };
export { EMPTY_DETALHES_DATA };

interface StepDetalhesSolicitacaoProps {
    data: DetalhesSolicitacaoData;
    onDataChange: (data: DetalhesSolicitacaoData) => void;
    readOnly?: boolean;
    osId?: string;
}

export interface StepDetalhesSolicitacaoRef {
    validate: () => boolean;
}

export const StepDetalhesSolicitacao = forwardRef<StepDetalhesSolicitacaoRef, StepDetalhesSolicitacaoProps>(({ 
    data, 
    onDataChange, 
    readOnly, 
    osId 
}, ref) => {
    const formRef = useRef<FormDetalhesVisitaRef>(null);

    // Expor validação para o componente pai (WorkflowPage)
    useImperativeHandle(ref, () => ({
        validate: () => {
            return formRef.current?.validate() ?? false;
        }
    }));

    return (
        <StepLayout
            title="Detalhes da Solicitação"
            description="Informe os detalhes técnicos da vistoria solicitada"
        >
            <FormDetalhesVisita
                ref={formRef}
                data={data}
                onDataChange={onDataChange}
                readOnly={readOnly}
                osId={osId}
                variant="internal"
                useCards={false}
            />
        </StepLayout>
    );
});

StepDetalhesSolicitacao.displayName = 'StepDetalhesSolicitacao';
