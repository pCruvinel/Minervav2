import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ClipboardCheck, Camera, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const QUESTIONARIO = [
    { id: 'q1', pergunta: 'Estado geral da estrutura', categoria: 'Estrutura' },
    { id: 'q2', pergunta: 'Presença de fissuras ou rachaduras', categoria: 'Estrutura' },
    { id: 'q3', pergunta: 'Condição das instalações elétricas', categoria: 'Instalações' },
    { id: 'q4', pergunta: 'Condição das instalações hidráulicas', categoria: 'Instalações' },
    { id: 'q5', pergunta: 'Estado da pintura e acabamento', categoria: 'Acabamento' },
    { id: 'q6', pergunta: 'Condição do telhado/cobertura', categoria: 'Cobertura' },
    { id: 'q7', pergunta: 'Presença de infiltrações', categoria: 'Umidade' },
    { id: 'q8', pergunta: 'Condição das esquadrias', categoria: 'Acabamento' },
];

interface StepRealizarVisitaProps {
    data: {
        visitaRealizada: boolean;
        dataRealizacao: string;
        horaChegada: string;
        horaSaida: string;
        respostas: Record<string, string>;
        fotos: string[];
        observacoesVisita: string;
    };
    onDataChange: (d: any) => void;
    readOnly?: boolean;
}

export function StepRealizarVisita({ data, onDataChange, readOnly }: StepRealizarVisitaProps) {
    const handleInputChange = (field: string, value: any) => {
        if (readOnly) return;
        onDataChange({ ...data, [field]: value });
    };

    const handleRespostaChange = (questionId: string, value: string) => {
        if (readOnly) return;
        onDataChange({
            ...data,
            respostas: { ...data.respostas, [questionId]: value }
        });
    };

    const handleFotoUpload = () => {
        if (readOnly) return;
        // Simular upload de foto
        const newFoto = `foto-${Date.now()}.jpg`;
        onDataChange({
            ...data,
            fotos: [...(data.fotos || []), newFoto]
        });
    };

    const categorias = [...new Set(QUESTIONARIO.map(q => q.categoria))];

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
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={data.visitaRealizada}
                                onCheckedChange={(checked) => handleInputChange('visitaRealizada', checked)}
                                disabled={readOnly}
                            />
                            <div>
                                <Label className="text-base">Visita Realizada</Label>
                                <p className="text-sm text-muted-foreground">Confirme que a visita foi concluída</p>
                            </div>
                        </div>
                        {data.visitaRealizada && (
                            <Badge className="bg-success">Concluída</Badge>
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
                    <div className="space-y-2">
                        <Label htmlFor="dataRealizacao">Data da Visita</Label>
                        <Input
                            id="dataRealizacao"
                            type="text"
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
                            disabled={readOnly}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="horaChegada">Hora Chegada</Label>
                        <Input
                            id="horaChegada"
                            type="time"
                            value={data.horaChegada}
                            onChange={(e) => handleInputChange('horaChegada', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="horaSaida">Hora Saída</Label>
                        <Input
                            id="horaSaida"
                            type="time"
                            value={data.horaSaida}
                            onChange={(e) => handleInputChange('horaSaida', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>
                </div>
            </div>

            {/* Questionário */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Questionário Técnico
                </h3>

                {categorias.map((categoria) => (
                    <Card key={categoria}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{categoria}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {QUESTIONARIO.filter(q => q.categoria === categoria).map((questao) => (
                                <div key={questao.id} className="space-y-2">
                                    <Label htmlFor={questao.id}>{questao.pergunta}</Label>
                                    <Textarea
                                        id={questao.id}
                                        value={data.respostas?.[questao.id] || ''}
                                        onChange={(e) => handleRespostaChange(questao.id, e.target.value)}
                                        placeholder="Descreva suas observações..."
                                        rows={2}
                                        disabled={readOnly}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Upload de Fotos */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Registro Fotográfico
                </h3>

                <div className="flex flex-wrap gap-4">
                    <Button variant="outline" onClick={handleFotoUpload} disabled={readOnly}>
                        <Camera className="w-4 h-4 mr-2" />
                        Tirar Foto
                    </Button>
                    <Button variant="outline" onClick={handleFotoUpload} disabled={readOnly}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload de Arquivo
                    </Button>
                </div>

                {(data.fotos || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {data.fotos.map((foto, index) => (
                            <Badge key={index} variant="outline">{foto}</Badge>
                        ))}
                    </div>
                )}
                <p className="text-xs text-muted-foreground">
                    {(data.fotos || []).length} foto(s) anexada(s)
                </p>
            </div>

            {/* Observações */}
            <div className="space-y-2">
                <Label htmlFor="observacoesVisita">Observações Gerais da Visita</Label>
                <Textarea
                    id="observacoesVisita"
                    value={data.observacoesVisita}
                    onChange={(e) => handleInputChange('observacoesVisita', e.target.value)}
                    placeholder="Observações adicionais, pontos de atenção, recomendações..."
                    rows={4}
                    disabled={readOnly}
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