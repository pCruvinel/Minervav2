import { forwardRef, useImperativeHandle } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { realizarVisitaSchema } from '@/lib/validations/os11-schemas';
import { QUESTIONARIO_VISITA } from '@/lib/constants/os11-constants';
import { FormInput } from '@/components/ui/form-input';
import { FormTextarea } from '@/components/ui/form-textarea';
import { FormSwitch } from '@/components/ui/form-switch';
import { FileUploadUnificado, FileWithComment } from '@/components/ui/file-upload-unificado';
import { toast } from 'sonner';

interface StepRealizarVisitaData {
    visitaRealizada: boolean;
    dataRealizacao: string;
    horaChegada: string;
    horaSaida: string;
    respostas: Record<string, string>;
    fotos: FileWithComment[];
    observacoesVisita: string;
}

interface StepRealizarVisitaProps {
    data: StepRealizarVisitaData;
    onDataChange: (data: StepRealizarVisitaData) => void;
    readOnly?: boolean;
    osId?: string;
}

export interface StepRealizarVisitaHandle {
    isFormValid: () => boolean;
    validate: () => boolean;
}

export const StepRealizarVisita = forwardRef<StepRealizarVisitaHandle, StepRealizarVisitaProps>(
    ({ data, onDataChange, readOnly, osId }, ref) => {
        
        const {
            errors,
            touched,
            validateField,
            markFieldTouched,
            validateAll,
            markAllTouched
        } = useFieldValidation(realizarVisitaSchema);

        useImperativeHandle(ref, () => ({
            isFormValid: () => validateAll(data),
            validate: () => {
                markAllTouched();
                const isValid = validateAll(data);
                
                if (!isValid) {
                    if (errors.respostas) toast.error(errors.respostas);
                    else if (errors.fotos) toast.error(errors.fotos);
                    else toast.error('Verifique os campos obrigatórios');
                }
                
                // Validação extra para questionário se schema não cobrir visualmente (mas cobrirá no submit)
                return isValid;
            }
        }), [data, validateAll, markAllTouched, errors]);

        const handleInputChange = (field: keyof StepRealizarVisitaData, value: boolean | string | FileWithComment[] | Record<string, string>) => {
            if (readOnly) return;
            const newData = { ...data, [field]: value };
            onDataChange(newData);
            
            if (touched[field]) {
                validateField(field as string, value);
            }
        };

        const handleBlur = (field: keyof StepRealizarVisitaData) => {
            markFieldTouched(field as string);
            validateField(field as string, data[field]);
        };

        const handleRespostaChange = (questionId: string, value: string) => {
            if (readOnly) return;
            const newRespostas = { ...data.respostas, [questionId]: value };

            const newData = { ...data, respostas: newRespostas };
            onDataChange(newData);

            // Validar respostas como um todo se necessário, ou só na submissão
            // Para feedback imediato, precisaríamos de touched específico por pergunta
        };

        const categorias = [...new Set(QUESTIONARIO_VISITA.map(q => q.categoria))];
        const hasRespostasError = !!errors.respostas && touched.respostas; // Touched em 'respostas' pode ser setado no submit

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ClipboardCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl mb-1">Realizar Visita Técnica</h2>
                        <p className="text-sm text-muted-foreground">
                            Preencha o questionário técnico e anexe fotos da vistoria
                        </p>
                    </div>
                </div>

                {/* Confirmação da Visita */}
                <Card className={data.visitaRealizada ? 'border-success/50 bg-success/5' : ''}>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 w-full">
                                <FormSwitch
                                    id="visitaRealizada"
                                    label="Visita Realizada (Confirme para liberar o questionário)"
                                    checked={data.visitaRealizada}
                                    onCheckedChange={(checked) => handleInputChange('visitaRealizada', checked)}
                                    disabled={readOnly}
                                    error={touched.visitaRealizada ? errors.visitaRealizada : undefined}
                                />
                            </div>
                            {data.visitaRealizada && (
                                <Badge className="bg-success ml-auto">Concluída</Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Horários */}
                <div className="space-y-4">
                    <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                        Registro de Horários
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            id="dataRealizacao"
                            label="Data da Visita"
                            placeholder="dd/mm/aaaa"
                            maxLength={10}
                            value={data.dataRealizacao}
                            onChange={(e) => {
                                const masked = e.target.value
                                    .replace(/\D/g, '')
                                    .replace(/(\d{2})(\d)/, '$1/$2')
                                    .replace(/(\d{2})(\d)/, '$1/$2')
                                    .replace(/(\/\d{4})\d+?$/, '$1');
                                handleInputChange('dataRealizacao', masked);
                            }}
                            onBlur={() => handleBlur('dataRealizacao')}
                            disabled={readOnly}
                            error={touched.dataRealizacao ? errors.dataRealizacao : undefined}
                            success={touched.dataRealizacao && !errors.dataRealizacao && !!data.dataRealizacao}
                        />
                        <FormInput
                            id="horaChegada"
                            label="Hora Chegada"
                            type="time"
                            value={data.horaChegada}
                            onChange={(e) => handleInputChange('horaChegada', e.target.value)}
                            onBlur={() => handleBlur('horaChegada')}
                            disabled={readOnly}
                            error={touched.horaChegada ? errors.horaChegada : undefined}
                            success={touched.horaChegada && !errors.horaChegada && !!data.horaChegada}
                        />
                        <FormInput
                            id="horaSaida"
                            label="Hora Saída"
                            type="time"
                            value={data.horaSaida}
                            onChange={(e) => handleInputChange('horaSaida', e.target.value)}
                            onBlur={() => handleBlur('horaSaida')}
                            disabled={readOnly}
                            error={touched.horaSaida ? errors.horaSaida : undefined}
                            success={touched.horaSaida && !errors.horaSaida && !!data.horaSaida}
                        />
                    </div>
                </div>

                {/* Questionário */}
                <div className="space-y-4">
                    <h3 className="text-base border-b border-border pb-2 flex justify-between items-center" style={{ color: 'var(--primary)' }}>
                        <span>Questionário Técnico</span>
                        {hasRespostasError && (
                            <span className="text-sm text-destructive">{errors.respostas}</span>
                        )}
                    </h3>

                    {categorias.map((categoria) => (
                        <Card key={categoria} className={hasRespostasError ? "border-destructive/50" : ""}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">{categoria}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {QUESTIONARIO_VISITA.filter(q => q.categoria === categoria).map((questao) => (
                                    <div key={questao.id} className="space-y-2">
                                        <FormTextarea
                                            id={questao.id}
                                            label={questao.pergunta}
                                            value={data.respostas?.[questao.id] || ''}
                                            onChange={(e) => handleRespostaChange(questao.id, e.target.value)}
                                            placeholder="Descreva suas observações..."
                                            rows={2}
                                            disabled={readOnly || !data.visitaRealizada}
                                            // Se validação por questão for necessária, implementaremos lógica específica
                                            // Por enquanto, validação global em 'respostas'
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Upload de Fotos */}
                <div className="space-y-4">
                    <h3 className="text-base border-b border-border pb-2 flex justify-between items-center" style={{ color: 'var(--primary)' }}>
                        <span>Registro Fotográfico</span>
                        {touched.fotos && errors.fotos && (
                            <span className="text-sm text-destructive">{errors.fotos}</span>
                        )}
                    </h3>

                    <FileUploadUnificado
                        label="Fotos da Visita"
                        files={data.fotos || []}
                        onFilesChange={(files) => handleInputChange('fotos', files)}
                        disabled={readOnly}
                        osId={osId}
                        etapaId="3"
                        etapaNome="Realizar Visita"
                        maxFiles={10}
                        maxFileSize={5}
                        acceptedTypes={['image/jpeg', 'image/png', 'image/jpg']}
                    />
                </div>

                {/* Observações */}
                <div className="space-y-2">
                    <FormTextarea
                        id="observacoesVisita"
                        label="Observações Gerais da Visita"
                        value={data.observacoesVisita}
                        onChange={(e) => handleInputChange('observacoesVisita', e.target.value)}
                        onBlur={() => handleBlur('observacoesVisita')}
                        placeholder="Observações adicionais, pontos de atenção, recomendações..."
                        rows={4}
                        disabled={readOnly}
                        error={touched.observacoesVisita ? errors.observacoesVisita : undefined}
                    />
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Todas as informações preenchidas serão utilizadas para gerar o Laudo Técnico automaticamente.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
);

StepRealizarVisita.displayName = 'StepRealizarVisita';