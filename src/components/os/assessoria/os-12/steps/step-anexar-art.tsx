/**
 * StepAnexarART - Etapa 2 da OS-12
 * 
 * Upload da Anotação de Responsabilidade Técnica (ART)
 */

import React from 'react';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUploadUnificado, FileWithComment } from '@/components/ui/file-upload-unificado';

export interface StepAnexarARTData {
    arquivos?: FileWithComment[];
}

export interface StepAnexarARTProps {
    data: StepAnexarARTData;
    onDataChange: (data: StepAnexarARTData) => void;
    readOnly?: boolean;
    osId?: string;
}

export function StepAnexarART({ data, onDataChange, readOnly, osId }: StepAnexarARTProps) {
    const arquivos = data.arquivos || [];
    const isComplete = arquivos.length > 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl mb-1">Anexar ART</h2>
                <p className="text-sm text-muted-foreground">
                    Anexe a Anotação de Responsabilidade Técnica (ART) do contrato de assessoria
                </p>
            </div>

            {/* Status */}
            <div className="border border-border rounded-lg p-6 bg-background">
                <div className="flex items-start gap-4">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: isComplete ? 'var(--success)' : 'var(--primary)' }}
                    >
                        {isComplete ? (
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                            <FileText className="w-6 h-6 text-white" />
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="text-base mb-2">
                            {isComplete ? 'ART anexada com sucesso!' : 'Aguardando anexo da ART'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {isComplete
                                ? 'A ART foi anexada e está pronta para validação.'
                                : 'Anexe o arquivo da ART em formato PDF.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <FileUploadUnificado
                label="Anexar ART da Assessoria"
                files={arquivos}
                onFilesChange={(files) => onDataChange({ arquivos: files })}
                disabled={readOnly}
                osId={osId}
                maxFiles={1}
                acceptedTypes={['application/pdf']}
            />

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    A ART é obrigatória para formalizar a responsabilidade técnica do contrato de assessoria.
                </AlertDescription>
            </Alert>
        </div>
    );
}
