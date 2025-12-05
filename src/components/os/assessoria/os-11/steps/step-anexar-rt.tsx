import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileCheck, Upload, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StepAnexarRTProps {
    data: {
        arquivoRT: string | null;
        numeroRT: string;
        dataRT: string;
        profissionalResponsavel: string;
        crea: string;
    };
    onDataChange: (d: any) => void;
    readOnly?: boolean;
}

export function StepAnexarRT({ data, onDataChange, readOnly }: StepAnexarRTProps) {
    const handleInputChange = (field: string, value: any) => {
        if (readOnly) return;
        onDataChange({ ...data, [field]: value });
    };

    const handleFileUpload = () => {
        if (readOnly) return;
        // Simular upload de arquivo RT
        const filename = `RT-${data.numeroRT || Date.now()}.pdf`;
        onDataChange({ ...data, arquivoRT: filename });
    };

    const handleRemoveFile = () => {
        if (readOnly) return;
        onDataChange({ ...data, arquivoRT: null });
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
                    <div className="space-y-2">
                        <Label htmlFor="profissionalResponsavel">
                            Nome do Profissional <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="profissionalResponsavel"
                            value={data.profissionalResponsavel}
                            onChange={(e) => handleInputChange('profissionalResponsavel', e.target.value)}
                            placeholder="Nome completo do engenheiro/arquiteto"
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="crea">
                            CREA/CAU <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="crea"
                            value={data.crea}
                            onChange={(e) => handleInputChange('crea', e.target.value)}
                            placeholder="Ex: CREA-SP 123456"
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="numeroRT">
                            Número da ART/RRT <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="numeroRT"
                            value={data.numeroRT}
                            onChange={(e) => handleInputChange('numeroRT', e.target.value)}
                            placeholder="Número do documento"
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dataRT">
                            Data de Emissão
                        </Label>
                        <Input
                            id="dataRT"
                            type="date"
                            value={data.dataRT}
                            onChange={(e) => handleInputChange('dataRT', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>
                </div>
            </div>

            {/* Upload do Arquivo */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Documento de Responsabilidade Técnica
                </h3>

                {!data.arquivoRT ? (
                    <Card className="border-dashed">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center gap-4 py-8">
                                <div className="p-4 bg-muted rounded-full">
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">Anexar documento ART/RRT</p>
                                    <p className="text-xs text-muted-foreground">PDF, máximo 10MB</p>
                                </div>
                                <Button onClick={handleFileUpload} disabled={readOnly}>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Selecionar Arquivo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-success/50 bg-success/5">
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-success/10 rounded-lg">
                                        <FileCheck className="w-5 h-5 text-success" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{data.arquivoRT}</p>
                                        <p className="text-xs text-muted-foreground">Documento anexado</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-success">Anexado</Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemoveFile}
                                        disabled={readOnly}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
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