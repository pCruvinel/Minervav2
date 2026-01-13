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

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail } from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
import { FileUploadUnificado, FileWithComment } from '@/components/ui/file-upload-unificado';
import { LeadCadastro, LeadCadastroHandle, LeadCompleto } from '@/components/os/shared/lead-cadastro';

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
        const leadCadastroRef = useRef<LeadCadastroHandle>(null);

        // Validar campos obrigatórios
        const validate = (): boolean => {
            // 1. Validar LeadCadastro
            if (leadCadastroRef.current && !leadCadastroRef.current.validate()) {
                return false;
            }

            if (!data.clienteId) {
                toast.error('Selecione um cliente para continuar');
                return false;
            }

            return true;
        };

        // Expor métodos via ref
        useImperativeHandle(ref, () => ({
            validate,
            getClienteId: () => data.clienteId
        }));

        const handleLeadChange = (leadId: string, leadData?: LeadCompleto) => {
            onDataChange({
                ...data,
                clienteId: leadId,
                clienteNome: leadData?.identificacao?.nome || data.clienteNome
            });
        };

        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl mb-1">Cadastro do Cliente e Portal</h2>
                    <p className="text-sm text-muted-foreground">
                        Selecione o cliente e configure o acesso ao portal
                    </p>
                </div>

                {/* SEÇÃO A: Lead Cadastro (Substitui Seleção Manual) */}
                <LeadCadastro
                    ref={leadCadastroRef}
                    selectedLeadId={data.clienteId}
                    onLeadChange={handleLeadChange}
                    readOnly={readOnly}
                    statusFilter="cliente"
                    showEdificacao={false} // Simplificado para OS-12
                    showEndereco={true}
                />

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
