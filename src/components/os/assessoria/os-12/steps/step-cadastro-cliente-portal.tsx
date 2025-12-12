"use client";

/**
 * StepCadastroClientePortal - Etapa 1 da OS-12
 * 
 * Funcionalidades:
 * - Seleção de cliente existente ou cadastro de novo
 * - Upload de documentos do cliente
 * - Geração de senha para portal do cliente
 * - Placeholder para integração futura com Supabase Edge Function
 */

import { forwardRef, useImperativeHandle, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, AlertCircle, Building2, Mail } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { toast } from '@/lib/utils/safe-toast';
import { useClientes } from '@/lib/hooks/use-clientes';
import { FileUploadUnificado, FileWithComment } from '@/components/ui/file-upload-unificado';

export interface StepCadastroClientePortalData {
    clienteId?: string;
    clienteNome?: string;
    documentos?: FileWithComment[];
}

export interface StepCadastroClientePortalProps {
    data: StepCadastroClientePortalData;
    onDataChange: (data: StepCadastroClientePortalData) => void;
    readOnly?: boolean;
    osId?: string;
}

export interface StepCadastroClientePortalHandle {
    validate: () => boolean;
    getClienteId: () => string | undefined;
}

export const StepCadastroClientePortal = forwardRef<StepCadastroClientePortalHandle, StepCadastroClientePortalProps>(
    function StepCadastroClientePortal({ data, onDataChange, readOnly = false, osId }, ref) {
        const [showCombobox, setShowCombobox] = useState(false);
        const [errors, setErrors] = useState<Record<string, string>>({});

        // Hooks - buscar clientes do tipo CLIENTE (não leads)
        const { clientes, loading: loadingClientes } = useClientes('CLIENTE');

        // Cliente selecionado
        const selectedCliente = clientes.find(c => c.id === data.clienteId);

        /**
         * Valida campos obrigatórios
         */
        const validate = (): boolean => {
            const newErrors: Record<string, string> = {};

            if (!data.clienteId) {
                newErrors.clienteId = 'Selecione um cliente';
            }

            setErrors(newErrors);

            if (Object.keys(newErrors).length > 0) {
                toast.error('Preencha os campos obrigatórios');
                return false;
            }

            return true;
        };

        // Expor métodos via ref
        useImperativeHandle(ref, () => ({
            validate,
            getClienteId: () => data.clienteId
        }));

        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl mb-1">Cadastro do Cliente e Portal</h2>
                    <p className="text-sm text-muted-foreground">
                        Selecione o cliente e configure o acesso ao portal
                    </p>
                </div>

                {/* SEÇÃO A: Seleção de Cliente */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Selecionar Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!data.clienteId ? (
                            <Popover open={showCombobox} onOpenChange={setShowCombobox}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={showCombobox}
                                        className={cn(
                                            "w-full justify-between",
                                            errors.clienteId && "border-destructive"
                                        )}
                                        disabled={readOnly || loadingClientes}
                                    >
                                        {loadingClientes ? 'Carregando clientes...' : 'Selecione um cliente'}
                                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar por nome, CNPJ..." />
                                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                        <CommandList>
                                            <CommandGroup>
                                                {clientes.map((cliente) => (
                                                    <CommandItem
                                                        key={cliente.id}
                                                        value={cliente.nome_razao_social}
                                                        onSelect={() => {
                                                            onDataChange({
                                                                ...data,
                                                                clienteId: cliente.id,
                                                                clienteNome: cliente.nome_razao_social
                                                            });
                                                            setShowCombobox(false);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 w-full">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback>
                                                                    {cliente.nome_razao_social?.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="font-medium">{cliente.nome_razao_social}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {cliente.cpf_cnpj} • {cliente.telefone}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        ) : (
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback className="bg-primary text-white">
                                                    {selectedCliente?.nome_razao_social?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-semibold text-lg">{selectedCliente?.nome_razao_social}</div>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <div>CNPJ: {selectedCliente?.cpf_cnpj || 'Não informado'}</div>
                                                    <div>Telefone: {selectedCliente?.telefone || 'Não informado'}</div>
                                                    <div>Email: {selectedCliente?.email || 'Não informado'}</div>
                                                </div>
                                            </div>
                                        </div>
                                        {!readOnly && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDataChange({ ...data, clienteId: '', clienteNome: '' })}
                                            >
                                                Alterar
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {errors.clienteId && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.clienteId}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* SEÇÃO B: Informativo sobre Convite por E-mail */}
                {data.clienteId && (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-primary" />
                                Acesso ao Portal do Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Convite por E-mail:</strong> Ao concluir o cadastro do contrato, um e-mail será enviado automaticamente para o cliente com um link seguro para criar sua senha de acesso ao portal.
                                </AlertDescription>
                            </Alert>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>O cliente receberá:</p>
                                <ul className="list-disc list-inside ml-2">
                                    <li>Link para definir sua própria senha</li>
                                    <li>Instruções de acesso ao portal</li>
                                    <li>Dados de contato do suporte</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* SEÇÃO C: Upload de Documentos */}
                {data.clienteId && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Documentos do Cliente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FileUploadUnificado
                                label="Documentos (Contrato, Ata, etc.)"
                                files={data.documentos || []}
                                onFilesChange={(files) => onDataChange({ ...data, documentos: files })}
                                disabled={readOnly}
                                osId={osId}
                                maxFiles={5}
                                maxFileSize={10}
                                acceptedTypes={['application/pdf', 'image/jpeg', 'image/png']}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }
);
