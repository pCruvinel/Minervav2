/**
 * ModalConviteColaborador - Convite em Lote
 * 
 * Permite enviar múltiplos convites de uma vez
 * Campos: Nome, Email
 */
'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Plus, Trash2, Mail, Send, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

// ============================================================
// TIPOS
// ============================================================

interface ConviteItem {
    id: string;
    nome: string;
    email: string;
}


interface ModalConviteColaboradorProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

// ============================================================
// COMPONENTE
// ============================================================

export function ModalConviteColaborador({
    open,
    onClose,
    onSuccess,
}: ModalConviteColaboradorProps) {
    const [convites, setConvites] = useState<ConviteItem[]>([
        { id: crypto.randomUUID(), nome: '', email: '' }
    ]);
    const [loading, setLoading] = useState(false);


    // Adicionar nova linha
    const handleAddConvite = () => {
        setConvites(prev => [
            ...prev,
            { id: crypto.randomUUID(), nome: '', email: '' }
        ]);
    };

    // Remover linha
    const handleRemoveConvite = (id: string) => {
        if (convites.length === 1) return;
        setConvites(prev => prev.filter(c => c.id !== id));
    };

    // Atualizar campo
    const handleUpdateConvite = (id: string, field: keyof ConviteItem, value: string) => {
        setConvites(prev =>
            prev.map(c => c.id === id ? { ...c, [field]: value } : c)
        );
    };

    // Validar convites
    const validateConvites = (): boolean => {
        for (const convite of convites) {
            if (!convite.email || !convite.email.includes('@')) {
                toast.error('Email inválido', {
                    description: `O email "${convite.email || 'vazio'}" é inválido.`
                });
                return false;
            }
        }
        return true;
    };

    // Enviar convites
    const handleEnviarConvites = async () => {
        if (!validateConvites()) return;

        setLoading(true);

        try {
            // Filtrar convites com email preenchido
            const convitesValidos = convites
                .filter(c => c.email && c.email.includes('@'))
                .map(c => ({
                    email: c.email.trim().toLowerCase(),
                    nome: c.nome.trim() || null,
                }));

            if (convitesValidos.length === 0) {
                toast.error('Nenhum convite válido para enviar');
                return;
            }

            logger.info(`Enviando ${convitesValidos.length} convite(s)...`);

            // Chamar Edge Function (rota /invite-users dentro do Hono)
            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: {
                    invites: convitesValidos,
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) throw error;

            const { results } = data;
            const totalSuccess = results?.success?.length || 0;
            const totalFailed = results?.failed?.length || 0;

            if (totalSuccess > 0) {
                toast.success(`${totalSuccess} convite(s) enviado(s) com sucesso!`, {
                    description: totalFailed > 0
                        ? `${totalFailed} convite(s) falharam.`
                        : 'Os usuários receberão um email para confirmar.'
                });
            }

            if (totalFailed > 0 && totalSuccess === 0) {
                toast.error('Falha ao enviar convites', {
                    description: results.failed.map((f: any) => f.error).join(', ')
                });
                return;
            }

            // Limpar e fechar
            setConvites([{ id: crypto.randomUUID(), nome: '', email: '' }]);
            onSuccess?.();
            onClose();

        } catch (err: any) {
            logger.error('Erro ao enviar convites:', err);
            toast.error('Erro ao enviar convites', {
                description: err.message || 'Tente novamente.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset ao fechar
    const handleClose = () => {
        setConvites([{ id: crypto.randomUUID(), nome: '', email: '' }]);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-[60rem] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Convidar Colaboradores
                    </DialogTitle>
                    <DialogDescription>
                        Envie convites por email. Os usuários receberão um link para criar sua conta.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Lista de Convites */}
                    {convites.map((convite, index) => (
                        <div
                            key={convite.id}
                            className="grid grid-cols-11 gap-2 items-end p-3 bg-muted/30 rounded-lg"
                        >
                            {/* Nome */}
                            <div className="col-span-5 space-y-1">
                                {index === 0 && <Label className="text-xs">Nome</Label>}
                                <Input
                                    placeholder="Nome completo"
                                    value={convite.nome}
                                    onChange={(e) => handleUpdateConvite(convite.id, 'nome', e.target.value)}
                                />
                            </div>

                            {/* Email */}
                            <div className="col-span-5 space-y-1">
                                {index === 0 && <Label className="text-xs">Email *</Label>}
                                <Input
                                    type="email"
                                    placeholder="email@empresa.com"
                                    value={convite.email}
                                    onChange={(e) => handleUpdateConvite(convite.id, 'email', e.target.value)}
                                />
                            </div>

                            {/* Remover */}
                            <div className="col-span-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveConvite(convite.id)}
                                    disabled={convites.length === 1}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Botão Adicionar */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddConvite}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar outro convite
                    </Button>

                    {/* Info */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Os colaboradores receberão um email com link para definir senha e acessar o sistema. Após o aceite, você poderá completar o cadastro (CPF, endereço, dados bancários, etc.) na página de Detalhes do Colaborador.
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleEnviarConvites} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Enviar {convites.length > 1 ? `${convites.length} Convites` : 'Convite'}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
