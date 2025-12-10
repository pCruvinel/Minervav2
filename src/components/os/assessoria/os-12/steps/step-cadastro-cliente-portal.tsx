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

import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { logger } from '@/lib/utils/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, AlertCircle, Eye, EyeOff, RefreshCw, Building2 } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { toast } from '@/lib/utils/safe-toast';
import { useClientes } from '@/lib/hooks/use-clientes';
import { FileUploadUnificado, FileWithComment } from '@/components/ui/file-upload-unificado';

export interface StepCadastroClientePortalData {
    clienteId?: string;
    clienteNome?: string;
    senhaPortal?: string;
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
        const [showPassword, setShowPassword] = useState(false);
        const [errors, setErrors] = useState<Record<string, string>>({});

        // Hooks - buscar clientes do tipo CLIENTE (não leads)
        const { clientes, loading: loadingClientes } = useClientes('CLIENTE');

        // Cliente selecionado
        const selectedCliente = clientes.find(c => c.id === data.clienteId);

        /**
         * Gera senha automática segura
         */
        const generatePassword = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
            const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
            const numbers = '23456789';

            let password = '';
            password += uppercase[Math.floor(Math.random() * uppercase.length)];
            password += numbers[Math.floor(Math.random() * numbers.length)];

            for (let i = 2; i < 10; i++) {
                password += chars[Math.floor(Math.random() * chars.length)];
            }

            password = password.split('').sort(() => Math.random() - 0.5).join('');
            onDataChange({ ...data, senhaPortal: password });
            toast.success('Senha gerada com sucesso!');
        };

        /**
         * Valida campos obrigatórios
         */
        const validate = (): boolean => {
            const newErrors: Record<string, string> = {};

            if (!data.clienteId) {
                newErrors.clienteId = 'Selecione um cliente';
            }

            if (!data.senhaPortal || data.senhaPortal.length < 8) {
                newErrors.senhaPortal = 'Senha deve ter no mínimo 8 caracteres';
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

                {/* SEÇÃO B: Senha do Portal */}
                {data.clienteId && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Acesso ao Portal do Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="senhaPortal">Senha de Acesso *</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            id="senhaPortal"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.senhaPortal || ''}
                                            onChange={(e) => onDataChange({ ...data, senhaPortal: e.target.value })}
                                            placeholder="Mínimo 8 caracteres"
                                            disabled={readOnly}
                                            className={errors.senhaPortal ? 'border-destructive' : ''}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-2 top-1/2 -translate-y-1/2"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={generatePassword}
                                        disabled={readOnly}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Gerar
                                    </Button>
                                </div>
                                {errors.senhaPortal && (
                                    <p className="text-sm text-destructive">{errors.senhaPortal}</p>
                                )}
                            </div>

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    O portal do cliente será criado automaticamente ao avançar. Um e-mail com as credenciais será enviado ao cliente.
                                </AlertDescription>
                            </Alert>
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
