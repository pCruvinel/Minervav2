import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

interface EtapaStartContratoProps {
    /** Função chamada ao clicar em iniciar */
    onStart: () => void;
    /** Estado de carregamento */
    isLoading: boolean;
    /** Se está criando a OS filha ou processando */
    isProcessing?: boolean;
    /** Modo somente leitura */
    readOnly?: boolean;
    /** Se a ação já foi concluída (histórico) */
    isCompleted?: boolean;
    /** Nome do cliente para mensagem de confirmação */
    clienteNome?: string;
}

export function EtapaStartContrato({
    onStart,
    isLoading,
    isProcessing = false,
    readOnly = false,
    isCompleted = false,
    clienteNome = "Cliente"
}: EtapaStartContratoProps) {
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleConfirm = () => {
        setShowConfirmModal(false);
        onStart();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Mensagem de Parabéns de Topo */}
            <Alert className="border-success/20 bg-success/5">
                <Check className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                    <strong>Parabéns!</strong> Você chegou à última etapa do fluxo comercial.
                </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center justify-center py-12 gap-6">
                <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
                    isProcessing || isLoading ? "bg-primary/10" : "bg-success/10"
                )}>
                    {(isProcessing || isLoading) ? (
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    ) : (
                        <Send className="h-10 w-10 text-success" />
                    )}
                </div>

                <div className="text-center max-w-lg mx-auto">
                    <h3 className="font-medium mb-2 text-xl">Start de Contrato</h3>

                    {/* Texto removido conforme solicitado, deixando apenas o título ou mensagem de sucesso */}
                    {isCompleted && (
                        <p className="text-sm text-muted-foreground mb-6">
                            Sucesso! Contrato assinado e Start de Obra iniciado.
                        </p>
                    )}

                    {!isCompleted && !readOnly && (
                        <Button
                            size="lg"
                            onClick={() => setShowConfirmModal(true)}
                            disabled={isLoading || isProcessing}
                            className="bg-success hover:bg-success/90 text-white min-w-[200px]"
                        >
                            {isLoading || isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Criar Contrato
                                </>
                            )}
                        </Button>
                    )}

                    {isCompleted && (
                        <div className="flex items-center justify-center gap-2 text-success font-medium">
                            <Check className="h-5 w-5" />
                            <span>Fluxo Concluído com Sucesso</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Card de Resumo das Ações */}
            <Card className="bg-primary/5 border-primary/20 max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-base">Resumo das Ações Automáticas:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <p className="text-sm font-medium">Conclusão da OS Comercial</p>
                            <p className="text-xs text-muted-foreground">Esta ordem de serviço será arquivada como "Concluído" no histórico.<br />Você poderá consultar o histórico em qualquer momento na própria OS de Start de Contrato</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <p className="text-sm font-medium">Ativação do Cliente</p>
                            <p className="text-xs text-muted-foreground">Status do cliente será atualizado de "Lead" para "Cliente Ativo".</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <p className="text-sm font-medium">Iniciaremos o Start de Contrato de Obras (OS-13)</p>
                            <p className="text-xs text-muted-foreground">Redirecionaremos para o Start de Contrato de Obras</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Confirmação */}
            <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Atenção</AlertDialogTitle>
                        <AlertDialogDescription>
                            Atenção, você será redirecionado para iniciar o contrato de obras do cliente <strong>{clienteNome}</strong>, se não tiver interesse de inicia-lo agora, cancele e execute esta ação depois.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm} className="bg-success hover:bg-success/90">
                            Confirmar e Iniciar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
