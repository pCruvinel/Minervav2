import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Mail, MessageCircle, FileText, Loader2, Info, Variable } from 'lucide-react';
import {
    useMessageTemplates,
    MensagemTemplate,
    CreateTemplatePayload,
    extrairVariaveis,
} from '@/lib/hooks/use-message-templates';
import { MessageChannel } from '@/lib/types/messaging';

// ============================================================
// Variáveis disponíveis para templates
// ============================================================

const VARIAVEIS_DISPONIVEIS = [
    { nome: 'cliente_nome', descricao: 'Nome do cliente/contato' },
    { nome: 'cliente_email', descricao: 'Email do cliente' },
    { nome: 'cliente_telefone', descricao: 'Telefone do cliente' },
    { nome: 'os_codigo', descricao: 'Código da OS (ex: CC13001)' },
    { nome: 'os_tipo', descricao: 'Tipo da OS (ex: Assessoria Lead)' },
    { nome: 'proposta_valor', descricao: 'Valor da proposta formatado' },
    { nome: 'contrato_numero', descricao: 'Número do contrato' },
    { nome: 'data_atual', descricao: 'Data atual formatada' },
    { nome: 'empresa_nome', descricao: 'Nome da empresa (Minerva)' },
    { nome: 'link_documento', descricao: 'Link para download do documento' },
];

// ============================================================
// Form Modal Component
// ============================================================

interface TemplateFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template?: MensagemTemplate;
    onSubmit: (data: CreateTemplatePayload) => Promise<void>;
    isSubmitting: boolean;
}

function TemplateFormModal({
    open,
    onOpenChange,
    template,
    onSubmit,
    isSubmitting,
}: TemplateFormModalProps) {
    const [nome, setNome] = useState(template?.nome || '');
    const [canal, setCanal] = useState<MessageChannel>(template?.canal || 'email');
    const [assunto, setAssunto] = useState(template?.assunto || '');
    const [corpo, setCorpo] = useState(template?.corpo || '');
    const [variaveisDetectadas, setVariaveisDetectadas] = useState<string[]>([]);

    const isEditing = !!template;

    // Detectar variáveis quando o corpo muda
    const handleCorpoChange = (value: string) => {
        setCorpo(value);
        setVariaveisDetectadas(extrairVariaveis(value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nome.trim() || !corpo.trim()) {
            toast.error('Nome e corpo são obrigatórios');
            return;
        }

        if (canal === 'email' && !assunto.trim()) {
            toast.error('Assunto é obrigatório para email');
            return;
        }

        await onSubmit({
            nome: nome.trim(),
            canal,
            assunto: canal === 'email' ? assunto.trim() : undefined,
            corpo: corpo.trim(),
            variaveis: variaveisDetectadas,
        });

        // Reset form
        if (!isEditing) {
            setNome('');
            setCanal('email');
            setAssunto('');
            setCorpo('');
            setVariaveisDetectadas([]);
        }
    };

    const inserirVariavel = (variavel: string) => {
        const cursorPosition = corpo.length;
        const newCorpo = corpo.slice(0, cursorPosition) + `{{${variavel}}}` + corpo.slice(cursorPosition);
        handleCorpoChange(newCorpo);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Template' : 'Novo Template'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Edite os campos do template de mensagem.'
                            : 'Crie um novo template para envio de mensagens.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do Template *</Label>
                            <Input
                                id="nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Ex: Envio de Proposta"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="canal">Canal *</Label>
                            <Select value={canal} onValueChange={(v) => setCanal(v as MessageChannel)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="email">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="whatsapp">
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="h-4 w-4" />
                                            WhatsApp
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {canal === 'email' && (
                        <div className="space-y-2">
                            <Label htmlFor="assunto">Assunto *</Label>
                            <Input
                                id="assunto"
                                value={assunto}
                                onChange={(e) => setAssunto(e.target.value)}
                                placeholder="Ex: Sua proposta está pronta - {{os_codigo}}"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="corpo">Corpo da Mensagem *</Label>
                            <span className="text-xs text-muted-foreground">
                                Use {'{{variavel}}'} para inserir variáveis dinâmicas
                            </span>
                        </div>
                        <Textarea
                            id="corpo"
                            value={corpo}
                            onChange={(e) => handleCorpoChange(e.target.value)}
                            placeholder="Olá {{cliente_nome}},&#10;&#10;Sua proposta referente à OS {{os_codigo}} está disponível..."
                            rows={6}
                        />
                    </div>

                    {/* Variáveis Disponíveis */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Variable className="h-4 w-4" />
                            <span>Variáveis Disponíveis (clique para inserir)</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {VARIAVEIS_DISPONIVEIS.map((v) => (
                                <Badge
                                    key={v.nome}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                                    onClick={() => inserirVariavel(v.nome)}
                                    title={v.descricao}
                                >
                                    {`{{${v.nome}}}`}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Variáveis Detectadas */}
                    {variaveisDetectadas.length > 0 && (
                        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                            <div className="flex items-center gap-2 text-sm text-success mb-2">
                                <Info className="h-4 w-4" />
                                <span>Variáveis detectadas no template:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {variaveisDetectadas.map((v) => (
                                    <Badge key={v} variant="secondary" className="bg-success/20 text-success">
                                        {v}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Salvar Alterações' : 'Criar Template'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================
// Main Templates Manager Component
// ============================================================

export function TemplatesManager() {
    const {
        templates,
        isLoading,
        createTemplate,
        updateTemplate,
        deleteTemplate,
    } = useMessageTemplates();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<MensagemTemplate | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleCreate = async (data: CreateTemplatePayload) => {
        setIsSubmitting(true);
        const result = await createTemplate(data);
        setIsSubmitting(false);

        if (result) {
            toast.success('Template criado com sucesso');
            setIsFormOpen(false);
        } else {
            toast.error('Erro ao criar template');
        }
    };

    const handleUpdate = async (data: CreateTemplatePayload) => {
        if (!editingTemplate) return;

        setIsSubmitting(true);
        const success = await updateTemplate(editingTemplate.id, data);
        setIsSubmitting(false);

        if (success) {
            toast.success('Template atualizado com sucesso');
            setEditingTemplate(undefined);
        } else {
            toast.error('Erro ao atualizar template');
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        const success = await deleteTemplate(id);
        setDeletingId(null);

        if (success) {
            toast.success('Template excluído com sucesso');
        } else {
            toast.error('Erro ao excluir template');
        }
    };

    const handleToggleAtivo = async (template: MensagemTemplate) => {
        const success = await updateTemplate(template.id, { ativo: !template.ativo });
        if (success) {
            toast.success(template.ativo ? 'Template desativado' : 'Template ativado');
        }
    };

    const openEditModal = (template: MensagemTemplate) => {
        setEditingTemplate(template);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Templates de Mensagens
                    </CardTitle>
                    <CardDescription>
                        Gerencie os templates para envio de emails e mensagens WhatsApp
                    </CardDescription>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Template
                </Button>
            </CardHeader>

            <CardContent>
                {templates.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum template cadastrado</p>
                        <Button variant="outline" className="mt-4" onClick={() => setIsFormOpen(true)}>
                            Criar primeiro template
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Canal</TableHead>
                                <TableHead>Variáveis</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell className="font-medium">{template.nome}</TableCell>
                                    <TableCell>
                                        <Badge variant={template.canal === 'email' ? 'default' : 'secondary'}>
                                            {template.canal === 'email' ? (
                                                <Mail className="mr-1 h-3 w-3" />
                                            ) : (
                                                <MessageCircle className="mr-1 h-3 w-3" />
                                            )}
                                            {template.canal === 'email' ? 'Email' : 'WhatsApp'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {(template.variaveis || []).slice(0, 3).map((v) => (
                                                <Badge key={v} variant="outline" className="text-xs">
                                                    {v}
                                                </Badge>
                                            ))}
                                            {(template.variaveis || []).length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{(template.variaveis || []).length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={template.ativo}
                                            onCheckedChange={() => handleToggleAtivo(template)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditModal(template)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(template.id)}
                                                disabled={deletingId === template.id}
                                            >
                                                {deletingId === template.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {/* Create Modal */}
            <TemplateFormModal
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleCreate}
                isSubmitting={isSubmitting}
            />

            {/* Edit Modal */}
            <TemplateFormModal
                open={!!editingTemplate}
                onOpenChange={(open) => !open && setEditingTemplate(undefined)}
                template={editingTemplate}
                onSubmit={handleUpdate}
                isSubmitting={isSubmitting}
            />
        </Card>
    );
}
