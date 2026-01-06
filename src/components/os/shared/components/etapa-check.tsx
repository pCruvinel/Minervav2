import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EtapaCheckProps {
    /** Título da ação (ex: "Contrato Assinado") */
    title: string;
    /** Descrição explicativa */
    description: string;
    /** Estado de confirmação */
    checked: boolean;
    /** Data da confirmação (ISO string) */
    date?: string;
    /** Nome do usuário que confirmou */
    confirmedBy?: string;
    /** Callback ao confirmar */
    onConfirm: () => void;
    /** Callback para desfazer (opcional) */
    onUndo?: () => void;
    /** Estado de leitura */
    readOnly?: boolean;
    /** Texto do botão de confirmação */
    actionLabel?: string;
    /** Ícone opcional no alerta */
    icon?: React.ElementType;
}

export function EtapaCheck({
    title,
    description,
    checked,
    date,
    confirmedBy,
    onConfirm,
    onUndo,
    readOnly = false,
    actionLabel = "Confirmar",
    icon: Icon = AlertCircle
}: EtapaCheckProps) {

    if (checked) {
        return (
            <Card className="bg-success/5 border-success/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <h3 className="font-medium text-lg text-foreground">{title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        Confirmado em: {date ? format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Data não registrada'}
                                        {confirmedBy && ` por ${confirmedBy}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {!readOnly && onUndo && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onUndo}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                                Desfazer
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Alert>
                <Icon className="h-4 w-4" />
                <AlertDescription>{description}</AlertDescription>
            </Alert>

            <Card>
                <CardContent className="pt-6 flex flex-col items-center justify-center gap-4 py-8">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center space-y-1 max-w-md">
                        <h3 className="font-medium">{title}</h3>
                        <p className="text-sm text-muted-foreground">
                            {readOnly
                                ? "Este item não foi confirmado nesta etapa."
                                : "Clique no botão abaixo apenas quando a ação estiver concluída."
                            }
                        </p>
                    </div>

                    {!readOnly && (
                        <Button
                            onClick={onConfirm}
                            size="lg"
                            className="mt-2 min-w-[200px]"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {actionLabel}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
