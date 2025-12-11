/**
 * AnnouncementsManager - Gerenciador de Avisos do Sistema
 *
 * CRUD completo para gerenciar avisos no Quadro de Avisos da Home.
 * Acesso restrito: admin, diretor, diretoria
 */
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Megaphone,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    AlertTriangle,
    Info,
    CheckCircle,
    Calendar,
    RefreshCw
} from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';

// ============================================================
// TIPOS
// ============================================================

interface Aviso {
    id: string;
    titulo: string;
    mensagem: string;
    tipo: 'info' | 'alert' | 'warning' | 'success';
    ativo: boolean;
    validade: string | null;
    created_at: string;
    created_by: string | null;
}

type AvisoTipo = 'info' | 'alert' | 'warning' | 'success';

interface AvisoFormData {
    titulo: string;
    mensagem: string;
    tipo: AvisoTipo;
    ativo: boolean;
    validade: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const TIPO_CONFIG: Record<AvisoTipo, { label: string; icon: typeof Info; color: string }> = {
    info: { label: 'Informativo', icon: Info, color: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
    alert: { label: 'Alerta', icon: AlertTriangle, color: 'bg-red-500/10 text-red-700 border-red-500/30' },
    warning: { label: 'Atenção', icon: AlertTriangle, color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' },
    success: { label: 'Sucesso', icon: CheckCircle, color: 'bg-green-500/10 text-green-700 border-green-500/30' },
};

const INITIAL_FORM: AvisoFormData = {
    titulo: '',
    mensagem: '',
    tipo: 'info',
    ativo: true,
    validade: '',
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function AnnouncementsManager() {
    const { currentUser } = useAuth();
    const [avisos, setAvisos] = useState<Aviso[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Estados do modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAviso, setEditingAviso] = useState<Aviso | null>(null);
    const [formData, setFormData] = useState<AvisoFormData>(INITIAL_FORM);

    // Estados do dialog de confirmação
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [avisoToDelete, setAvisoToDelete] = useState<Aviso | null>(null);

    // Carregar avisos
    const loadAvisos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('sistema_avisos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAvisos(data || []);
        } catch (err) {
            console.error('[AnnouncementsManager] Erro ao carregar:', err);
            toast.error('Erro ao carregar avisos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAvisos();
    }, []);

    // Abrir modal para criar
    const handleCreate = () => {
        setEditingAviso(null);
        setFormData(INITIAL_FORM);
        setIsModalOpen(true);
    };

    // Abrir modal para editar
    const handleEdit = (aviso: Aviso) => {
        setEditingAviso(aviso);
        setFormData({
            titulo: aviso.titulo,
            mensagem: aviso.mensagem,
            tipo: aviso.tipo,
            ativo: aviso.ativo,
            validade: aviso.validade || '',
        });
        setIsModalOpen(true);
    };

    // Salvar aviso (criar ou atualizar)
    const handleSave = async () => {
        if (!formData.titulo.trim() || !formData.mensagem.trim()) {
            toast.error('Preencha título e mensagem');
            return;
        }

        try {
            setSaving(true);

            const payload = {
                titulo: formData.titulo.trim(),
                mensagem: formData.mensagem.trim(),
                tipo: formData.tipo,
                ativo: formData.ativo,
                validade: formData.validade || null,
                ...(editingAviso ? {} : { created_by: currentUser?.id }),
            };

            if (editingAviso) {
                // Atualizar
                const { error } = await supabase
                    .from('sistema_avisos')
                    .update(payload)
                    .eq('id', editingAviso.id);

                if (error) throw error;
                toast.success('Aviso atualizado com sucesso');
            } else {
                // Criar
                const { error } = await supabase
                    .from('sistema_avisos')
                    .insert(payload);

                if (error) throw error;
                toast.success('Aviso criado com sucesso');
            }

            setIsModalOpen(false);
            loadAvisos();
        } catch (err) {
            console.error('[AnnouncementsManager] Erro ao salvar:', err);
            toast.error('Erro ao salvar aviso');
        } finally {
            setSaving(false);
        }
    };

    // Confirmar exclusão
    const handleDeleteClick = (aviso: Aviso) => {
        setAvisoToDelete(aviso);
        setDeleteDialogOpen(true);
    };

    // Excluir aviso
    const handleDelete = async () => {
        if (!avisoToDelete) return;

        try {
            const { error } = await supabase
                .from('sistema_avisos')
                .delete()
                .eq('id', avisoToDelete.id);

            if (error) throw error;
            toast.success('Aviso excluído com sucesso');
            loadAvisos();
        } catch (err) {
            console.error('[AnnouncementsManager] Erro ao excluir:', err);
            toast.error('Erro ao excluir aviso');
        } finally {
            setDeleteDialogOpen(false);
            setAvisoToDelete(null);
        }
    };

    // Toggle ativo/inativo rápido
    const handleToggleAtivo = async (aviso: Aviso) => {
        try {
            const { error } = await supabase
                .from('sistema_avisos')
                .update({ ativo: !aviso.ativo })
                .eq('id', aviso.id);

            if (error) throw error;
            toast.success(aviso.ativo ? 'Aviso desativado' : 'Aviso ativado');
            loadAvisos();
        } catch (err) {
            console.error('[AnnouncementsManager] Erro ao toggle:', err);
            toast.error('Erro ao alterar status');
        }
    };

    // Formatar data
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Megaphone className="h-6 w-6 text-primary" />
                            <div>
                                <CardTitle>Gerenciar Avisos</CardTitle>
                                <CardDescription>
                                    Crie e gerencie avisos do Quadro de Avisos na Home
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={loadAvisos} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Atualizar
                            </Button>
                            <Button onClick={handleCreate}>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Aviso
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Lista de Avisos */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : avisos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <Megaphone className="h-12 w-12 mb-3 opacity-30" />
                            <p>Nenhum aviso cadastrado</p>
                            <Button variant="link" onClick={handleCreate}>
                                Criar primeiro aviso
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="w-[300px]">Título</TableHead>
                                    <TableHead>Validade</TableHead>
                                    <TableHead>Criado em</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {avisos.map((aviso) => {
                                    const config = TIPO_CONFIG[aviso.tipo];
                                    const Icon = config.icon;
                                    const isExpired = aviso.validade && new Date(aviso.validade) < new Date();

                                    return (
                                        <TableRow key={aviso.id} className={!aviso.ativo ? 'opacity-50' : ''}>
                                            <TableCell>
                                                <Switch
                                                    checked={aviso.ativo}
                                                    onCheckedChange={() => handleToggleAtivo(aviso)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={config.color}>
                                                    <Icon className="h-3 w-3 mr-1" />
                                                    {config.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{aviso.titulo}</p>
                                                    <p className="text-sm text-muted-foreground truncate max-w-[280px]">
                                                        {aviso.mensagem}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {aviso.validade ? (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span className={isExpired ? 'text-destructive' : ''}>
                                                            {new Date(aviso.validade).toLocaleDateString('pt-BR')}
                                                        </span>
                                                        {isExpired && (
                                                            <Badge variant="destructive" className="text-[10px] ml-1">
                                                                Expirado
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Sem validade</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(aviso.created_at)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(aviso)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteClick(aviso)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Criar/Editar */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAviso ? 'Editar Aviso' : 'Novo Aviso'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAviso
                                ? 'Atualize as informações do aviso'
                                : 'Preencha os dados para criar um novo aviso'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Título */}
                        <div className="space-y-2">
                            <Label htmlFor="titulo">Título *</Label>
                            <Input
                                id="titulo"
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                placeholder="Ex: Manutenção programada"
                            />
                        </div>

                        {/* Mensagem */}
                        <div className="space-y-2">
                            <Label htmlFor="mensagem">Mensagem *</Label>
                            <Textarea
                                id="mensagem"
                                value={formData.mensagem}
                                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                                placeholder="Descreva o aviso..."
                                rows={3}
                            />
                        </div>

                        {/* Tipo */}
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select
                                value={formData.tipo}
                                onValueChange={(value: AvisoTipo) => setFormData({ ...formData, tipo: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(TIPO_CONFIG).map(([key, config]) => {
                                        const Icon = config.icon;
                                        return (
                                            <SelectItem key={key} value={key}>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    {config.label}
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Validade */}
                        <div className="space-y-2">
                            <Label htmlFor="validade">Data de Validade (opcional)</Label>
                            <Input
                                id="validade"
                                type="date"
                                value={formData.validade}
                                onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Deixe em branco para aviso sem prazo de expiração
                            </p>
                        </div>

                        {/* Ativo */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Aviso Ativo</Label>
                                <p className="text-xs text-muted-foreground">
                                    Avisos inativos não aparecem no quadro
                                </p>
                            </div>
                            <Switch
                                checked={formData.ativo}
                                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingAviso ? 'Salvar Alterações' : 'Criar Aviso'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de Confirmação de Exclusão */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Aviso</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir o aviso "{avisoToDelete?.titulo}"?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
