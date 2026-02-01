import { forwardRef, useImperativeHandle } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileCheck } from 'lucide-react';
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { anexarRTSchema } from '@/lib/validations/os11-schemas';
import { FormInput } from '@/components/ui/form-input';
import { FileUploadUnificado, type FileWithComment } from '@/components/ui/file-upload-unificado';
import { toast } from 'sonner';

interface StepAnexarRTData {
    arquivoRT: FileWithComment[];
    numeroRT: string;
    dataRT: string;
    profissionalResponsavel: string;
    crea: string;
}

interface StepAnexarRTProps {
    data: StepAnexarRTData;
    onDataChange: (d: StepAnexarRTData) => void;
    readOnly?: boolean;
}

export interface StepAnexarRTHandle {
    isFormValid: () => boolean;
    validate: () => boolean;
}

export const StepAnexarRT = forwardRef<StepAnexarRTHandle, StepAnexarRTProps>(
    ({ data, onDataChange, readOnly }, ref) => {
        
        const {
            errors,
            touched,
            validateField,
            markFieldTouched,
            validateAll,
            markAllTouched
        } = useFieldValidation(anexarRTSchema);

        useImperativeHandle(ref, () => ({
            isFormValid: () => {
                const isValidSchema = validateAll(data);
                const hasFile = !!data.arquivoRT;
                return isValidSchema && hasFile;
            },
            validate: () => {
                markAllTouched();
                const isValidSchema = validateAll(data);
                const hasFile = !!data.arquivoRT;
                
                if (!hasFile) {
                    toast.error('É obrigatório anexar o documento de RT');
                }
                
                return isValidSchema && hasFile;
            }
        }), [data, validateAll, markAllTouched]);

        const handleInputChange = (field: keyof StepAnexarRTData, value: any) => {
            if (readOnly) return;
            const newData = { ...data, [field]: value };
            onDataChange(newData);
            
            if (touched[field]) {
                validateField(field as any, value);
            }
        };

        const handleBlur = (field: keyof StepAnexarRTData) => {
            markFieldTouched(field as any);
            validateField(field as any, data[field]);
        };

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FileCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl mb-1">Anexar RT (Responsabilidade Técnica)</h2>
                        <p className="text-sm text-muted-foreground">
                            Anexe o documento de Responsabilidade Técnica (ART/RRT)
                        </p>
                    </div>
                </div>

                {/* Dados do Profissional */}
                <div className="space-y-4">
                    <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                        Dados do Profissional Responsável
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            id="profissionalResponsavel"
                            label="Nome do Profissional"
                            value={data.profissionalResponsavel}
                            onChange={(e) => handleInputChange('profissionalResponsavel', e.target.value)}
                            onBlur={() => handleBlur('profissionalResponsavel')}
                            placeholder="Nome completo do engenheiro/arquiteto"
                            disabled={readOnly}
                            required
                            error={touched.profissionalResponsavel ? errors.profissionalResponsavel : undefined}
                            success={touched.profissionalResponsavel && !errors.profissionalResponsavel && !!data.profissionalResponsavel}
                        />

                        <FormInput
                            id="crea"
                            label="CREA/CAU"
                            value={data.crea}
                            onChange={(e) => handleInputChange('crea', e.target.value)}
                            onBlur={() => handleBlur('crea')}
                            placeholder="Ex: CREA-SP 123456"
                            disabled={readOnly}
                            required
                            error={touched.crea ? errors.crea : undefined}
                            success={touched.crea && !errors.crea && !!data.crea}
                        />

                        <FormInput
                            id="numeroRT"
                            label="Número da ART/RRT"
                            value={data.numeroRT}
                            onChange={(e) => handleInputChange('numeroRT', e.target.value)}
                            onBlur={() => handleBlur('numeroRT')}
                            placeholder="Número do documento"
                            disabled={readOnly}
                            required
                            error={touched.numeroRT ? errors.numeroRT : undefined}
                            success={touched.numeroRT && !errors.numeroRT && !!data.numeroRT}
                        />

                        <FormInput
                            id="dataRT"
                            label="Data de Emissão"
                            placeholder="dd/mm/aaaa"
                            maxLength={10}
                            value={data.dataRT}
                            onChange={(e) => {
                                const masked = e.target.value
                                    .replace(/\D/g, '')
                                    .replace(/(\d{2})(\d)/, '$1/$2')
                                    .replace(/(\d{2})(\d)/, '$1/$2')
                                    .replace(/(\/\d{4})\d+?$/, '$1');
                                handleInputChange('dataRT', masked);
                            }}
                            onBlur={() => handleBlur('dataRT')}
                            disabled={readOnly}
                            error={touched.dataRT ? errors.dataRT : undefined}
                            success={touched.dataRT && !errors.dataRT && !!data.dataRT}
                        />
                    </div>
                </div>

                {/* Upload do Arquivo */}
                <div className="space-y-4">
                    <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                        Documento de Responsabilidade Técnica
                    </h3>

                    <FileUploadUnificado
                        label="Documento de Responsabilidade Técnica"
                        files={data.arquivoRT || []}
                        onFilesChange={(files) => handleInputChange('arquivoRT', files)}
                        maxFiles={1}
                        maxFileSize={10}
                        acceptedTypes={['application/pdf']}
                        etapaId="4"
                        etapaNome="Anexar RT"
                        disabled={readOnly}
                    />
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        O documento de Responsabilidade Técnica (ART ou RRT) é obrigatório para emissão do laudo técnico
                        e será anexado ao documento final.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
);

StepAnexarRT.displayName = 'StepAnexarRT';