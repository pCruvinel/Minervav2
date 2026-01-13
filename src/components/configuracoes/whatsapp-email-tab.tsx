'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    useAppSettings,
    EVOLUTION_API_URL_KEY,
    EVOLUTION_API_KEY_KEY,
    EVOLUTION_INSTANCE_NAME_KEY,
} from '@/lib/hooks/use-app-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';
import {
    Loader2,
    Save,
    RefreshCw,
    QrCode,
    CheckCircle2,
    XCircle,
    LogOut,
    Smartphone,
    Settings,
    Wifi,
    WifiOff,
    Mail,
    MessageSquare,
} from 'lucide-react';
import { EmailSettingsSection } from './email-settings-section';

// ============================================================
// TYPES (WhatsApp Logic)
// ============================================================

interface InstanceStatus {
    instance: {
        instanceName: string;
        state: 'open' | 'close' | 'connecting';
    };
}

interface QrCodeResponse {
    base64?: string;
    code?: string;
    pairingCode?: string;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'unknown';

// ============================================================
// COMPONENT
// ============================================================

export function WhatsAppEmailTab() {
    // Settings from DB
    const { settings, isLoading: isLoadingSettings, setMultipleSettings, refetch } = useAppSettings([
        EVOLUTION_API_URL_KEY,
        EVOLUTION_API_KEY_KEY,
        EVOLUTION_INSTANCE_NAME_KEY,
    ]);

    // Form state (WhatsApp)
    const [apiUrl, setApiUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [instanceName, setInstanceName] = useState('MinervaBot');

    // Connection state
    const [connectionState, setConnectionState] = useState<ConnectionState>('unknown');
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);

    // Loading states
    const [isSaving, setIsSaving] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // Sync form state with DB settings
    useEffect(() => {
        if (!isLoadingSettings) {
            setApiUrl(settings[EVOLUTION_API_URL_KEY] || '');
            setApiKey(settings[EVOLUTION_API_KEY_KEY] || '');
            setInstanceName(settings[EVOLUTION_INSTANCE_NAME_KEY] || 'MinervaBot');
        }
    }, [isLoadingSettings, settings]);

    // ============================================================
    // API HELPERS
    // ============================================================

    const makeApiRequest = useCallback(async (
        endpoint: string,
        method: 'GET' | 'POST' | 'DELETE' = 'GET',
        body?: unknown
    ) => {
        if (!apiUrl || !apiKey) {
            throw new Error('API URL e API Key são obrigatórios');
        }

        const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        const url = `${baseUrl}${endpoint}`;

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        return response.json();
    }, [apiUrl, apiKey]);

    // ============================================================
    // HANDLERS
    // ============================================================

    const handleSaveSettings = async () => {
        if (!apiUrl.trim()) {
            toast.error('URL da API é obrigatória');
            return;
        }

        setIsSaving(true);
        try {
            const success = await setMultipleSettings([
                { key: EVOLUTION_API_URL_KEY, value: apiUrl.trim(), description: 'Evolution API Base URL' },
                { key: EVOLUTION_API_KEY_KEY, value: apiKey.trim(), description: 'Evolution API Global Key', isSecret: true },
                { key: EVOLUTION_INSTANCE_NAME_KEY, value: instanceName.trim(), description: 'Nome da instância WhatsApp' },
            ]);

            if (success) {
                toast.success('Configurações salvas com sucesso!');
            }
        } catch (err) {
            logger.error('[WhatsAppEmailTab] Error saving settings:', err);
            toast.error('Erro ao salvar configurações');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCheckStatus = async () => {
        if (!apiUrl || !apiKey || !instanceName) {
            toast.error('Configure a API antes de verificar status');
            return;
        }

        setIsCheckingStatus(true);
        setQrCodeBase64(null);

        try {
            const status: InstanceStatus = await makeApiRequest(`/instance/connectionState/${instanceName}`);
            logger.log('[WhatsAppEmailTab] Instance status:', status);

            const state = status?.instance?.state;
            if (state === 'open') {
                setConnectionState('connected');
                toast.success('WhatsApp conectado!');
            } else if (state === 'connecting') {
                setConnectionState('connecting');
                toast.info('Aguardando conexão...');
            } else {
                setConnectionState('disconnected');
                toast.info('WhatsApp desconectado');
            }
        } catch (err) {
            logger.error('[WhatsAppEmailTab] Error checking status:', err);

            // Instance might not exist, that's ok
            if (String(err).includes('404') || String(err).includes('not found')) {
                setConnectionState('disconnected');
                toast.info('Instância não encontrada. Clique em "Conectar" para criar.');
            } else {
                setConnectionState('unknown');
                toast.error('Erro ao verificar status da conexão');
            }
        } finally {
            setIsCheckingStatus(false);
        }
    };

    const handleConnect = async () => {
        if (!apiUrl || !apiKey || !instanceName) {
            toast.error('Configure a API antes de conectar');
            return;
        }

        setIsConnecting(true);
        setQrCodeBase64(null);

        try {
            // First, try to create instance (if not exists)
            try {
                await makeApiRequest('/instance/create', 'POST', {
                    instanceName: instanceName,
                    qrcode: true,
                    integration: 'WHATSAPP-BAILEYS',
                });
                logger.log('[WhatsAppEmailTab] Instance created');
            } catch (createErr) {
                // Instance might already exist, continue
                logger.log('[WhatsAppEmailTab] Instance might already exist:', createErr);
            }

            // Get QR Code
            const qrResponse: QrCodeResponse = await makeApiRequest(`/instance/connect/${instanceName}`);
            logger.log('[WhatsAppEmailTab] QR Response:', qrResponse);

            if (qrResponse.base64) {
                setQrCodeBase64(qrResponse.base64);
                setConnectionState('connecting');
                toast.success('QR Code gerado! Escaneie com o WhatsApp.');
            } else if (qrResponse.code) {
                // Already connected or connecting
                setConnectionState('connecting');
                toast.info('Aguardando conexão...');
            } else {
                toast.info('Verificando status...');
                await handleCheckStatus();
            }
        } catch (err) {
            logger.error('[WhatsAppEmailTab] Error connecting:', err);
            toast.error('Erro ao conectar. Verifique as configurações da API.');
            setConnectionState('disconnected');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!apiUrl || !apiKey || !instanceName) {
            return;
        }

        setIsDisconnecting(true);

        try {
            await makeApiRequest(`/instance/logout/${instanceName}`, 'DELETE');
            setConnectionState('disconnected');
            setQrCodeBase64(null);
            toast.success('WhatsApp desconectado');
        } catch (err) {
            logger.error('[WhatsAppEmailTab] Error disconnecting:', err);
            toast.error('Erro ao desconectar');
        } finally {
            setIsDisconnecting(false);
        }
    };

    // ============================================================
    // RENDER HELPERS
    // ============================================================

    const getStatusBadge = () => {
        switch (connectionState) {
            case 'connected':
                return (
                    <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Conectado
                    </Badge>
                );
            case 'connecting':
                return (
                    <Badge className="bg-warning/10 text-warning border-warning/20">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Conectando...
                    </Badge>
                );
            case 'disconnected':
                return (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        <XCircle className="h-3 w-3 mr-1" />
                        Desconectado
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        <WifiOff className="h-3 w-3 mr-1" />
                        Desconhecido
                    </Badge>
                );
        }
    };

    if (isLoadingSettings) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="whatsapp" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
                    <TabsTrigger
                        value="whatsapp"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        WhatsApp
                    </TabsTrigger>
                    <TabsTrigger
                        value="email"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="whatsapp" className="space-y-6 animate-fade-in">
                        {/* Configuration Card */}
                        <Card className="shadow-card">
                            <CardHeader className="bg-muted/40 border-b border-border/50 pb-4">
                                <div className="flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-base font-semibold">Configuração da Evolution API</CardTitle>
                                </div>
                                <CardDescription>
                                    Configure a URL e chave da API para conectar ao WhatsApp via Evolution API.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2.5">
                                        <Label htmlFor="api-url">URL da API</Label>
                                        <Input
                                            id="api-url"
                                            placeholder="https://sua-evolution-api.com"
                                            value={apiUrl}
                                            onChange={(e) => setApiUrl(e.target.value)}
                                        />
                                        <p className="text-caption text-muted-foreground">
                                            Ex: https://api.evolution.exemplo.com
                                        </p>
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label htmlFor="api-key">API Key (Global)</Label>
                                        <Input
                                            id="api-key"
                                            type="password"
                                            placeholder="Sua chave de API"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                        />
                                        <p className="text-caption text-muted-foreground">
                                            Chave global configurada na Evolution API
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="instance-name">Nome da Instância</Label>
                                    <Input
                                        id="instance-name"
                                        placeholder="MinervaBot"
                                        value={instanceName}
                                        onChange={(e) => setInstanceName(e.target.value)}
                                        className="max-w-xs"
                                    />
                                    <p className="text-caption text-muted-foreground">
                                        Identificador único para esta conexão WhatsApp
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        Salvar Configurações
                                    </Button>
                                    <Button variant="outline" onClick={refetch}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Recarregar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Connection Card */}
                        <Card className="shadow-card">
                            <CardHeader className="bg-muted/40 border-b border-border/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="h-5 w-5 text-primary" />
                                        <div>
                                            <CardTitle className="text-base font-semibold">Conexão WhatsApp</CardTitle>
                                            <CardDescription className="hidden md:block">
                                                Conecte sua instância do WhatsApp escaneando o QR Code.
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {getStatusBadge()}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex gap-2 flex-wrap">
                                    <Button
                                        variant="outline"
                                        onClick={handleCheckStatus}
                                        disabled={isCheckingStatus || !apiUrl || !apiKey}
                                    >
                                        {isCheckingStatus ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Wifi className="h-4 w-4 mr-2" />
                                        )}
                                        Verificar Status
                                    </Button>

                                    {connectionState !== 'connected' && (
                                        <Button
                                            onClick={handleConnect}
                                            disabled={isConnecting || !apiUrl || !apiKey}
                                        >
                                            {isConnecting ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <QrCode className="h-4 w-4 mr-2" />
                                            )}
                                            Conectar (QR Code)
                                        </Button>
                                    )}

                                    {connectionState === 'connected' && (
                                        <Button
                                            variant="destructive"
                                            onClick={handleDisconnect}
                                            disabled={isDisconnecting}
                                        >
                                            {isDisconnecting ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <LogOut className="h-4 w-4 mr-2" />
                                            )}
                                            Desconectar
                                        </Button>
                                    )}
                                </div>

                                {/* QR Code Display */}
                                {qrCodeBase64 && connectionState === 'connecting' && (
                                    <div className="mt-6 flex flex-col items-center gap-4 animate-fade-in">
                                        <div className="p-4 bg-white rounded-lg shadow-lg">
                                            <img
                                                src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
                                                alt="QR Code WhatsApp"
                                                className="w-64 h-64"
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground text-center max-w-md">
                                            Abra o WhatsApp no seu celular, vá em <strong>Configurações &gt; Aparelhos Conectados</strong> e escaneie o QR Code acima.
                                        </p>
                                        <Button variant="ghost" size="sm" onClick={handleCheckStatus}>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Verificar se conectou
                                        </Button>
                                    </div>
                                )}

                                {/* Connected Info */}
                                {connectionState === 'connected' && (
                                    <div className="mt-4 p-4 bg-success/5 border border-success/20 rounded-lg animate-fade-in">
                                        <div className="flex items-center gap-2 text-success">
                                            <CheckCircle2 className="h-5 w-5" />
                                            <span className="font-medium">WhatsApp conectado com sucesso!</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 ml-7">
                                            Instância: <code className="bg-muted px-1 rounded">{instanceName}</code>
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="email" className="animate-fade-in">
                        <EmailSettingsSection />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
