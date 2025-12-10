/**
 * StepPlanoManutencao - Etapa 3 da OS-12
 * 
 * Upload do plano de manutenção do condomínio
 */

import React from 'react';
import { ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUploadUnificado, FileWithComment } from '@/components/ui/file-upload-unificado';

export interface StepPlanoManutencaoData {
    arquivos?: FileWithComment[];
    descricao?: string;
    vigenciaInicio?: string;
    vigenciaFim?: string;
}

export interface StepPlanoManutencaoProps {
    data: StepPlanoManutencaoData;
    onDataChange: (data: StepPlanoManutencaoData) => void;
    readOnly?: boolean;
    osId?: string;
}

export function StepPlanoManutencao({ data, onDataChange, readOnly, osId }: StepPlanoManutencaoProps) {
    const arquivos = data.arquivos || [];
    const isComplete = arquivos.length > 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl mb-1">Plano de Manutenção</h2>
                <p className="text-sm text-muted-foreground">
                    Faça upload do plano de manutenção do condomínio
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
                            <ClipboardList className="w-6 h-6 text-white" />
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="text-base mb-2">
                            {isComplete ? 'Plano de manutenção anexado!' : 'Aguardando plano de manutenção'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {isComplete
                                ? 'O plano de manutenção foi anexado com sucesso.'
                                : 'Anexe o arquivo do plano de manutenção em formato PDF.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <FileUploadUnificado
                label="Anexar Plano de Manutenção"
                files={arquivos}
                onFilesChange={(files) => onDataChange({ ...data, arquivos: files })}
                disabled={readOnly}
                osId={osId}
                maxFiles={3}
                acceptedTypes={['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']}
            />

            <div className="space-y-2">
                <Label htmlFor="descricao">Observações sobre o plano</Label>
                <Textarea
                    id="descricao"
                    value={data.descricao || ''}
                    onChange={(e) => onDataChange({ ...data, descricao: e.target.value })}
                    placeholder="Descreva pontos importantes do plano de manutenção..."
                    disabled={readOnly}
                    rows={4}
                />
            </div>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    O plano de manutenção define as atividades e periodicidade das ações de manutenção preventiva do condomínio.
                </AlertDescription>
            </Alert>
        </div>
    );
}
