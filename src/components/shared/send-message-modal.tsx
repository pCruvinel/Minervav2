import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, MessageCircle, Send, Loader2, FileText, User, AlertCircle } from 'lucide-react';
import { useSendEmail } from '@/lib/hooks/use-send-email';
import { useSendWhatsApp } from '@/lib/hooks/use-send-whatsapp';
import {
    useMessageTemplates,
    substituirVariaveis,
} from '@/lib/hooks/use-message-templates';
import { MessageChannel } from '@/lib/types/messaging';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ============================================================
// Types
// ============================================================

export interface SendMessageContext {
    tipo: 'os' | 'cliente' | 'proposta' | 'contrato' | 'laudo';
    id: string;
    codigo?: string;
}

export interface SendMessageDestinatario {
    nome: string;
    email?: string;
    telefone?: string;
}

export interface SendMessageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    destinatario: SendMessageDestinatario;
    contexto?: SendMessageContext;
    variaveis?: Record<string, string>;
    canalPadrao?: MessageChannel;
    onSuccess?: () => void;
}

// ============================================================
// Component
// ============================================================

export function SendMessageModal({
    open,
    onOpenChange,
    destinatario,
    contexto,
    variaveis = {},
    canalPadrao = 'email',
    onSuccess,
}: SendMessageModalProps) {
    const [canal, setCanal] = useState<MessageChannel>(canalPadrao);
    const [templateId, setTemplateId] = useState<string>('');
    const [assunto, setAssunto] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [isSending, setIsSending] = useState(false);

    const { sendEmail, isLoading: isLoadingEmail } = useSendEmail();
    const { sendWhatsApp, isLoading: isLoadingWhatsApp, isConnected: whatsAppConnected } = useSendWhatsApp();
    const { templates, getTemplatesByCanal } = useMessageTemplates();

    // Preparar variáveis padrão
    const variaveisCompletas: Record<string, string> = {
        cliente_nome: destinatario.nome,
        cliente_email: destinatario.email || '',
        cliente_telefone: destinatario.telefone || '',
        data_atual: new Date().toLocaleDateString('pt-BR'),
        empresa_nome: 'Minerva Engenharia',
        ...variaveis,
        ...(contexto?.codigo ? { os_codigo: contexto.codigo } : {}),
    };

    // Templates disponíveis para o canal selecionado
    const templatesDisponiveis = getTemplatesByCanal(canal);

    // Verificar se pode enviar pelo canal selecionado
    const canSendEmail = !!destinatario.email;
    const canSendWhatsApp = !!destinatario.telefone && whatsAppConnected;

    // Reset ao abrir
    useEffect(() => {
        if (open) {
            setCanal(canalPadrao);
            setTemplateId('');
            setAssunto('');
            setMensagem('');
        }
    }, [open, canalPadrao]);

    // Aplicar template
    const handleTemplateChange = (id: string) => {
        setTemplateId(id);

        if (!id) {
            setAssunto('');
            setMensagem('');
            return;
        }

        const template = templates.find(t => t.id === id);
        if (template) {
            setAssunto(substituirVariaveis(template.assunto || '', variaveisCompletas));
            setMensagem(substituirVariaveis(template.corpo, variaveisCompletas));
        }
    };

    // Enviar mensagem
    const handleSend = async () => {
        if (!mensagem.trim()) {
            toast.error('Digite uma mensagem para enviar');
            return;
        }

        setIsSending(true);

        try {
            let success = false;

            if (canal === 'email') {
                if (!destinatario.email) {
                    toast.error('Destinatário não possui email cadastrado');
                    return;
                }

                if (!assunto.trim()) {
                    toast.error('Digite um assunto para o email');
                    return;
                }

                success = await sendEmail({
                    to: destinatario.email,
                    subject: assunto,
                    html: mensagem.replace(/\n/g, '<br>'),
                    text: mensagem,
                });
            } else {
                if (!destinatario.telefone) {
                    toast.error('Destinatário não possui telefone cadastrado');
                    return;
                }

                const result = await sendWhatsApp({
                    telefone: destinatario.telefone,
                    mensagem: mensagem,
                });
                success = result.success;
            }

            if (success) {
                toast.success(
                    canal === 'email'
                        ? `Email enviado para ${destinatario.email}`
                        : `WhatsApp enviado para ${destinatario.telefone}`
                );
                onOpenChange(false);
                onSuccess?.();
            } else {
                toast.error('Falha ao enviar mensagem. Tente novamente.');
            }
        } catch {
            toast.error('Erro ao enviar mensagem');
        } finally {
            setIsSending(false);
        }
    };

    const isLoading = isSending || isLoadingEmail || isLoadingWhatsApp;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Enviar Mensagem
                    </DialogTitle>
                    <DialogDescription>
                        Envie uma mensagem para {destinatario.nome}
                        {contexto?.codigo && (
                            <Badge variant="outline" className="ml-2">
                                {contexto.codigo}
                            </Badge>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Destinatário */}
                    <div className="p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{destinatario.nome}</span>
                        </div>
                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            {destinatario.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {destinatario.email}
                                </span>
                            )}
                            {destinatario.telefone && (
                                <span className="flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3" />
                                    {destinatario.telefone}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Canal */}
                    <Tabs value={canal} onValueChange={(v) => setCanal(v as MessageChannel)}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="email" disabled={!canSendEmail}>
                                <Mail className="mr-2 h-4 w-4" />
                                Email
                            </TabsTrigger>
                            <TabsTrigger value="whatsapp" disabled={!canSendWhatsApp}>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                WhatsApp
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="email" className="space-y-4 mt-4">
                            {!canSendEmail && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Destinatário não possui email cadastrado.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </TabsContent>

                        <TabsContent value="whatsapp" className="space-y-4 mt-4">
                            {!whatsAppConnected && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        WhatsApp não configurado. Acesse Configurações {'>'} Sistema para conectar.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Template */}
                    {templatesDisponiveis.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="template" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Template (opcional)
                            </Label>
                            <Select value={templateId} onValueChange={handleTemplateChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um template..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Sem template</SelectItem>
                                    {templatesDisponiveis.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Assunto (só para email) */}
                    {canal === 'email' && (
                        <div className="space-y-2">
                            <Label htmlFor="assunto">Assunto *</Label>
                            <Input
                                id="assunto"
                                value={assunto}
                                onChange={(e) => setAssunto(e.target.value)}
                                placeholder="Digite o assunto do email"
                            />
                        </div>
                    )}

                    {/* Mensagem */}
                    <div className="space-y-2">
                        <Label htmlFor="mensagem">Mensagem *</Label>
                        <Textarea
                            id="mensagem"
                            value={mensagem}
                            onChange={(e) => setMensagem(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            rows={6}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={isLoading || (canal === 'email' && !canSendEmail) || (canal === 'whatsapp' && !canSendWhatsApp)}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Enviar {canal === 'email' ? 'Email' : 'WhatsApp'}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
