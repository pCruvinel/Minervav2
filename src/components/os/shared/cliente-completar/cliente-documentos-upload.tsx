"use client";

/**
 * ClienteDocumentosUpload - Upload de documentos obrigatórios do cliente
 * 
 * Documentos:
 * - Documento com Foto (RG/CNH)
 * - Comprovante de Residência
 * - Contrato Social (empresas PJ) OU Ata de Eleição (condomínios)
 * - Logo do Cliente (opcional)
 * 
 * @example
 * ```tsx
 * <ClienteDocumentosUpload
 *   clienteId={clienteId}
 *   tipoCliente="juridica"
 *   tipoEmpresa="condominio"
 *   onDocumentosChange={setDocumentos}
 *   readOnly={false}
 * />
 * ```
 */

import { useState, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileUploadUnificado, type FileWithComment } from '@/components/ui/file-upload-unificado';
import { FileImage, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { logger } from '@/lib/utils/logger';
import { supabase } from '@/lib/supabase-client';
import { toast } from '@/lib/utils/safe-toast';
import type { TipoDocumentoCliente, TipoCliente, TipoEmpresa } from '../lead-cadastro/types';

interface DocumentoConfig {
    tipo: TipoDocumentoCliente;
    label: string;
    descricao: string;
    icon: React.ComponentType<any>;
    obrigatorio: boolean;
    maxFiles: number;
    maxFileSize: number; // MB
    acceptedTypes: string[];
    /** Condição para mostrar este documento */
    showCondition?: (tipoCliente?: TipoCliente, tipoEmpresa?: TipoEmpresa) => boolean;
}

// Configurações dos tipos de documento
const DOCUMENTOS_CONFIG: DocumentoConfig[] = [
    {
        tipo: 'documento_foto',
        label: 'Documento com Foto (RG/CNH)',
        descricao: 'Documento de identificação do representante legal',
        icon: FileImage,
        obrigatorio: true,
        maxFiles: 2,
        maxFileSize: 5,
        acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    },
    {
        tipo: 'comprovante_residencia',
        label: 'Comprovante de Residência',
        descricao: 'Comprovante de residência do representante legal',
        icon: FileText,
        obrigatorio: true,
        maxFiles: 2,
        maxFileSize: 5,
        acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    },
    {
        tipo: 'contrato_social',
        label: 'Contrato Social',
        descricao: 'Contrato social da empresa (obrigatório para Pessoa Jurídica)',
        icon: FileText,
        obrigatorio: true,
        maxFiles: 3,
        maxFileSize: 10,
        acceptedTypes: ['application/pdf'],
        // Mostrar para PJ que NÃO é condomínio
        showCondition: (tipoCliente, tipoEmpresa) =>
            tipoCliente === 'juridica' && tipoEmpresa !== 'condominio',
    },
    {
        tipo: 'ata_eleicao',
        label: 'Ata de Eleição do Síndico',
        descricao: 'Ata de eleição do síndico (obrigatório para condomínios)',
        icon: FileText,
        obrigatorio: true,
        maxFiles: 3,
        maxFileSize: 10,
        acceptedTypes: ['application/pdf'],
        // Mostrar APENAS para PJ + Condomínio
        showCondition: (tipoCliente, tipoEmpresa) =>
            tipoCliente === 'juridica' && tipoEmpresa === 'condominio',
    },
    {
        tipo: 'logo_cliente',
        label: 'Logo do Cliente',
        descricao: 'Logotipo ou imagem do cliente (opcional)',
        icon: FileImage,
        obrigatorio: false,
        maxFiles: 1,
        maxFileSize: 2,
        acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'],
    },
];

interface ClienteDocumentosUploadProps {
    /** ID do cliente */
    clienteId: string;

    /** Tipo de cliente (fisica ou juridica) */
    tipoCliente?: TipoCliente;

    /** Tipo de empresa (condominio, empresa_privada, etc.) */
    tipoEmpresa?: TipoEmpresa;

    /** Callback quando os documentos são atualizados */
    onDocumentosChange?: (documentos: Record<TipoDocumentoCliente, FileWithComment[]>) => void;

    /** Se está em modo somente leitura */
    readOnly?: boolean;

    /** OS ID para salvar os arquivos em pasta específica */
    osId?: string;
}

export interface ClienteDocumentosUploadHandle {
    validate: () => boolean;
    save: () => Promise<boolean>;
    getDocumentos: () => Record<TipoDocumentoCliente, FileWithComment[]>;
}

export const ClienteDocumentosUpload = forwardRef<ClienteDocumentosUploadHandle, ClienteDocumentosUploadProps>(
    function ClienteDocumentosUpload(
        { clienteId, tipoCliente, tipoEmpresa, onDocumentosChange, readOnly = false, osId },
        ref
    ) {
        // Estados de documentos por tipo
        const [documentos, setDocumentos] = useState<Record<TipoDocumentoCliente, FileWithComment[]>>({
            documento_foto: [],
            comprovante_residencia: [],
            contrato_social: [],
            ata_eleicao: [],
            logo_cliente: [],
        });

        const [errors, setErrors] = useState<Record<string, string>>({});
        const [isSaving, setIsSaving] = useState(false);

        // Filtrar documentos visíveis baseado no tipo de cliente/empresa
        const documentosVisiveis = useMemo(() => {
            return DOCUMENTOS_CONFIG.filter(config => {
                // Se não tem condição, sempre mostrar
                if (!config.showCondition) return true;
                // Avaliar condição
                return config.showCondition(tipoCliente, tipoEmpresa);
            });
        }, [tipoCliente, tipoEmpresa]);

        // Carregar documentos existentes do cliente
        useEffect(() => {
            if (!clienteId) return;

            const loadDocumentos = async () => {
                try {
                    logger.log('📁 Carregando documentos do cliente:', clienteId);

                    const { data, error } = await supabase
                        .from('clientes_documentos')
                        .select('*')
                        .eq('cliente_id', clienteId);

                    if (error) throw error;

                    if (data && data.length > 0) {
                        const docsByType: Record<TipoDocumentoCliente, FileWithComment[]> = {
                            documento_foto: [],
                            comprovante_residencia: [],
                            contrato_social: [],
                            ata_eleicao: [],
                            logo_cliente: [],
                        };

                        for (const doc of data) {
                            const tipo = doc.tipo_documento as TipoDocumentoCliente;
                            if (docsByType[tipo]) {
                                // Gerar URL pública do Storage
                                const { data: publicUrlData } = supabase.storage
                                    .from('documentos')
                                    .getPublicUrl(doc.caminho_storage);

                                docsByType[tipo].push({
                                    id: doc.id,
                                    name: doc.nome_arquivo,
                                    size: doc.tamanho_bytes || 0,
                                    type: doc.mime_type || 'application/octet-stream',
                                    url: publicUrlData?.publicUrl || '',
                                    path: doc.caminho_storage,
                                    comment: '',
                                });
                            }
                        }

                        setDocumentos(docsByType);
                        logger.log('✅ Documentos carregados:', Object.keys(docsByType).map(k => `${k}: ${docsByType[k as TipoDocumentoCliente].length}`));
                    }
                } catch (error) {
                    logger.error('❌ Erro ao carregar documentos:', error);
                }
            };

            loadDocumentos();
        }, [clienteId]);

        // Notificar parent quando documentos mudam
        useEffect(() => {
            onDocumentosChange?.(documentos);
        }, [documentos, onDocumentosChange]);

        /**
         * Atualiza documentos de um tipo específico
         */
        const handleDocumentosChange = (tipo: TipoDocumentoCliente, files: FileWithComment[]) => {
            setDocumentos(prev => ({
                ...prev,
                [tipo]: files,
            }));

            // Limpar erro se houver arquivos
            if (files.length > 0 && errors[tipo]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[tipo];
                    return newErrors;
                });
            }
        };

        /**
         * Valida se todos os documentos obrigatórios foram enviados
         */
        const validate = (): boolean => {
            const newErrors: Record<string, string> = {};

            // Validar apenas documentos visíveis
            for (const config of documentosVisiveis) {
                if (config.obrigatorio && documentos[config.tipo].length === 0) {
                    newErrors[config.tipo] = `${config.label} é obrigatório`;
                }
            }

            setErrors(newErrors);

            if (Object.keys(newErrors).length > 0) {
                logger.warn('⚠️ Documentos obrigatórios faltando:', newErrors);
                return false;
            }

            return true;
        };

        /**
         * Salva os documentos no banco
         */
        const save = async (): Promise<boolean> => {
            if (!clienteId) {
                logger.error('❌ clienteId não fornecido');
                return false;
            }

            setIsSaving(true);

            try {
                logger.log('💾 Salvando documentos do cliente...');

                for (const [tipo, files] of Object.entries(documentos)) {
                    if (files.length === 0) continue;

                    for (const file of files) {
                        // Se já tem ID do banco, pular (já está salvo)
                        if (file.id) continue;

                        // Verificar se tem path (upload já feito pelo FileUploadUnificado)
                        if (!file.path) {
                            logger.warn(`⚠️ Arquivo ${file.name} não tem path, pulando...`);
                            continue;
                        }

                        // Registrar no banco
                        const { error } = await supabase
                            .from('clientes_documentos')
                            .insert({
                                cliente_id: clienteId,
                                tipo_documento: tipo,
                                nome_arquivo: file.name,
                                caminho_storage: file.path,
                                mime_type: file.type,
                                tamanho_bytes: file.size,
                            });

                        if (error) {
                            // Ignorar erro de duplicata
                            if (error.code !== '23505') {
                                logger.error(`❌ Erro ao salvar ${file.name}:`, error);
                            }
                        }
                    }
                }

                logger.log('✅ Documentos salvos com sucesso');
                toast.success('Documentos salvos com sucesso!');
                return true;
            } catch (error) {
                logger.error('❌ Erro ao salvar documentos:', error);
                toast.error('Erro ao salvar documentos');
                return false;
            } finally {
                setIsSaving(false);
            }
        };

        /**
         * Retorna os documentos atuais
         */
        const getDocumentos = () => documentos;

        // Expor métodos via ref
        useImperativeHandle(ref, () => ({
            validate,
            save,
            getDocumentos,
        }));

        // Calcular status geral (apenas documentos visíveis)
        const totalObrigatorios = documentosVisiveis.filter(c => c.obrigatorio).length;
        const completosObrigatorios = documentosVisiveis.filter(
            c => c.obrigatorio && documentos[c.tipo].length > 0
        ).length;
        const isComplete = completosObrigatorios === totalObrigatorios;

        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Documentos do Cliente
                            </CardTitle>
                            <CardDescription>
                                Documentos obrigatórios para formalização do contrato
                            </CardDescription>
                        </div>

                        <Badge variant={isComplete ? 'default' : 'outline'} className={isComplete ? 'bg-success' : ''}>
                            {completosObrigatorios}/{totalObrigatorios} obrigatórios
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Alerta de documentos pendentes */}
                    {!isComplete && !readOnly && (
                        <Alert variant="default" className="bg-warning/10 border-warning/30">
                            <AlertCircle className="h-4 w-4 text-warning" />
                            <AlertDescription className="text-warning-foreground">
                                Envie todos os documentos obrigatórios para continuar
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Lista de uploads (apenas documentos visíveis) */}
                    {documentosVisiveis.map((config) => (
                        <div key={config.tipo} className="space-y-2">
                            <FileUploadUnificado
                                label={
                                    <span className="flex items-center gap-2">
                                        <config.icon className="h-4 w-4" />
                                        {config.label}
                                        {config.obrigatorio && <span className="text-destructive">*</span>}
                                        {documentos[config.tipo].length > 0 && (
                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                        )}
                                    </span>
                                }
                                files={documentos[config.tipo]}
                                onFilesChange={(files) => handleDocumentosChange(config.tipo, files)}
                                disabled={readOnly}
                                osId={osId}
                                maxFiles={config.maxFiles}
                                maxFileSize={config.maxFileSize}
                                acceptedTypes={config.acceptedTypes}
                            />

                            <p className="text-xs text-muted-foreground ml-1">
                                {config.descricao}
                            </p>

                            {errors[config.tipo] && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors[config.tipo]}
                                </p>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }
);
