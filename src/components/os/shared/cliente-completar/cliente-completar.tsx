"use client";

/**
 * ClienteCompletar - Componente orquestrador para completar dados do Cliente
 * 
 * Usado em OS de execução (11, 12, 13) para coletar:
 * - Documentos obrigatórios do cliente
 * - Aniversário do gestor (para lembretes)
 * 
 * @example
 * ```tsx
 * const ref = useRef<ClienteCompletarHandle>(null);
 * 
 * <ClienteCompletar
 *   ref={ref}
 *   clienteId={clienteId}
 *   onDocumentosChange={handleDocChange}
 * />
 * 
 * // Para validar e salvar:
 * const isValid = ref.current?.validate();
 * const success = await ref.current?.save();
 * ```
 */

import { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CalendarDays, Cake, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/components/ui/utils';
import { logger } from '@/lib/utils/logger';
import { supabase } from '@/lib/supabase-client';
import { toast } from '@/lib/utils/safe-toast';

// Sub-componentes
import { ClienteDocumentosUpload, type ClienteDocumentosUploadHandle } from './cliente-documentos-upload';

// Tipos
import type { ClienteCompletarProps, ClienteCompletarHandle, TipoDocumentoCliente } from '../lead-cadastro/types';
import type { FileWithComment } from '@/components/ui/file-upload-unificado';

export const ClienteCompletar = forwardRef<ClienteCompletarHandle, ClienteCompletarProps>(
    function ClienteCompletar(
        { clienteId, tipoCliente, tipoEmpresa, readOnly = false, onDocumentosChange, onAniversarioChange },
        ref
    ) {
        // Estados
        const [aniversarioGestor, setAniversarioGestor] = useState<Date | undefined>();
        const [documentos, setDocumentos] = useState<Record<TipoDocumentoCliente, FileWithComment[]>>({
            documento_foto: [],
            comprovante_residencia: [],
            contrato_social: [],
            ata_eleicao: [],
            logo_cliente: [],
        });
        const [errors, setErrors] = useState<Record<string, string>>({});

        // Refs para sub-componentes
        const documentosRef = useRef<ClienteDocumentosUploadHandle>(null);

        /**
         * Valida todos os campos obrigatórios
         */
        const validate = (): boolean => {
            const newErrors: Record<string, string> = {};

            // Validar documentos
            const docsValid = documentosRef.current?.validate() ?? false;

            // Aniversário é opcional, mas se preenchido deve ser válido
            // Não é mais obrigatório já que fica no cliente

            setErrors(newErrors);

            return docsValid && Object.keys(newErrors).length === 0;
        };

        /**
         * Salva os dados do cliente
         */
        const save = async (): Promise<boolean> => {
            if (!clienteId) {
                logger.error('❌ clienteId não fornecido');
                toast.error('ID do cliente não encontrado');
                return false;
            }

            try {
                logger.log('💾 Salvando dados complementares do cliente...');

                // 1. Salvar documentos
                const docsSaved = await documentosRef.current?.save() ?? false;

                // 2. Atualizar aniversário do gestor (se informado)
                if (aniversarioGestor) {
                    const { error } = await supabase
                        .from('clientes')
                        .update({
                            aniversario_gestor: aniversarioGestor.toISOString().split('T')[0], // Apenas data
                        })
                        .eq('id', clienteId);

                    if (error) {
                        // Pode falhar se o campo não existir ainda - não é crítico
                        logger.warn('⚠️ Campo aniversario_gestor pode não existir:', error);
                    }
                }

                if (!docsSaved) {
                    return false;
                }

                logger.log('✅ Dados complementares salvos com sucesso');
                return true;
            } catch (error) {
                logger.error('❌ Erro ao salvar dados complementares:', error);
                toast.error('Erro ao salvar dados do cliente');
                return false;
            }
        };

        // Expor métodos via ref
        useImperativeHandle(ref, () => ({
            validate,
            save,
        }));

        /**
         * Handle para mudança de aniversário
         */
        const handleAniversarioChange = (date: Date | undefined) => {
            setAniversarioGestor(date);
            onAniversarioChange?.(date);
        };

        /**
         * Handle para mudança de documentos
         */
        const handleDocumentosChange = (docs: Record<TipoDocumentoCliente, FileWithComment[]>) => {
            setDocumentos(docs);
            onDocumentosChange?.(Object.values(docs).flat());
        };

        if (!clienteId) {
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Selecione um cliente antes de preencher os documentos
                    </AlertDescription>
                </Alert>
            );
        }

        return (
            <div className="space-y-6">
                {/* Documentos do Cliente */}
                <ClienteDocumentosUpload
                    ref={documentosRef}
                    clienteId={clienteId}
                    tipoCliente={tipoCliente}
                    tipoEmpresa={tipoEmpresa}
                    onDocumentosChange={handleDocumentosChange}
                    readOnly={readOnly}
                />


                {/* Aniversário do Gestor */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Cake className="h-5 w-5" />
                            Dados Adicionais
                        </CardTitle>
                        <CardDescription>
                            Informações opcionais para relacionamento com o cliente
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="aniversarioGestor" className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Aniversário do Gestor/Síndico
                            </Label>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full md:w-[300px] justify-start text-left font-normal',
                                            !aniversarioGestor && 'text-muted-foreground'
                                        )}
                                        disabled={readOnly}
                                    >
                                        <CalendarDays className="mr-2 h-4 w-4" />
                                        {aniversarioGestor
                                            ? format(aniversarioGestor, 'PPP', { locale: ptBR })
                                            : 'Selecione a data de aniversário'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={aniversarioGestor}
                                        onSelect={handleAniversarioChange}
                                        initialFocus
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Alert className="mt-2">
                                <Info className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    Esta data será usada para enviar lembretes automáticos de aniversário
                                </AlertDescription>
                            </Alert>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
);
