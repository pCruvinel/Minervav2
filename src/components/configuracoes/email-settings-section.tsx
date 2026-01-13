import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, Save, AlertCircle } from 'lucide-react';
import { useAppSettings } from '@/lib/hooks/use-app-settings';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EMAIL_KEYS = [
    'smtp_host',
    'smtp_port',
    'smtp_user',
    'smtp_password',
    'smtp_secure',
    'email_sender_name',
    'email_sender_address',
    'email_provider' // 'smtp', 'resend', 'sendgrid'
];

export function EmailSettingsSection() {
    const { settings, isLoading, setMultipleSettings } = useAppSettings(EMAIL_KEYS);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (settings && Array.isArray(settings)) {
            const newFormData: Record<string, string> = {};
            EMAIL_KEYS.forEach(key => {
                const found = settings.find(s => s.key === key);
                newFormData[key] = found?.value || '';
            });
            // Defaults
            if (!newFormData['email_provider']) newFormData['email_provider'] = 'smtp';
            if (!newFormData['smtp_port']) newFormData['smtp_port'] = '587';
            if (!newFormData['smtp_secure']) newFormData['smtp_secure'] = 'true';

            setFormData(newFormData);
        }
    }, [settings]);

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            const settingsToSave = Object.entries(formData)
                .filter(([key]) => EMAIL_KEYS.includes(key))
                .map(([key, value]) => ({
                    key,
                    value,
                    description: getKeyDescription(key),
                    is_secret: key === 'smtp_password'
                }));

            await setMultipleSettings(settingsToSave);
            toast.success('Configurações de email salvas com sucesso');
        } catch (error) {
            console.error('Erro ao salvar email settings:', error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setIsSaving(false);
        }
    };

    const getKeyDescription = (key: string): string => {
        const descriptions: Record<string, string> = {
            'smtp_host': 'Servidor SMTP',
            'smtp_port': 'Porta SMTP',
            'smtp_user': 'Usuário SMTP',
            'smtp_password': 'Senha SMTP',
            'smtp_secure': 'Usar SSL/TLS',
            'email_sender_name': 'Nome do Remetente',
            'email_sender_address': 'Email do Remetente',
            'email_provider': 'Provedor de Email'
        };
        return descriptions[key] || 'Configuração de Email';
    };

    if (isLoading) {
        return (
            <Card className="shadow-card">
                <CardContent className="p-6 flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="shadow-card">
                <CardHeader className="bg-muted/40 border-b border-border/50 pb-4">
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base font-semibold">Configuração de Email (SMTP)</CardTitle>
                    </div>
                    <CardDescription>
                        Configure o servidor de saída para envio de propostas e notificações via email.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                            <Label htmlFor="provider">Provedor</Label>
                            <Select
                                value={formData['email_provider']}
                                onValueChange={(val) => handleChange('email_provider', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o provedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="smtp">SMTP Genérico (Recomendado)</SelectItem>
                                    <SelectItem value="resend">Resend API</SelectItem>
                                    <SelectItem value="sendgrid">SendGrid API</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2.5">
                            <Label htmlFor="sender_name">Nome do Remetente</Label>
                            <Input
                                id="sender_name"
                                value={formData['email_sender_name']}
                                onChange={(e) => handleChange('email_sender_name', e.target.value)}
                                placeholder="Ex: Minerva Engenharia"
                            />
                        </div>

                        <div className="space-y-2.5">
                            <Label htmlFor="sender_email">Email do Remetente</Label>
                            <Input
                                id="sender_email"
                                value={formData['email_sender_address']}
                                onChange={(e) => handleChange('email_sender_address', e.target.value)}
                                placeholder="Ex: contato@minervaengenharia.com"
                            />
                        </div>
                    </div>

                    <div className="border-t border-border/50 pt-6">
                        <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                            Credenciais do Servidor (SMTP)
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-8 space-y-2.5">
                                <Label htmlFor="smtp_host">Host SMTP</Label>
                                <Input
                                    id="smtp_host"
                                    value={formData['smtp_host']}
                                    onChange={(e) => handleChange('smtp_host', e.target.value)}
                                    placeholder="Ex: smtp.gmail.com"
                                />
                            </div>

                            <div className="md:col-span-4 space-y-2.5">
                                <Label htmlFor="smtp_port">Porta</Label>
                                <Input
                                    id="smtp_port"
                                    value={formData['smtp_port']}
                                    onChange={(e) => handleChange('smtp_port', e.target.value)}
                                    placeholder="Ex: 587"
                                />
                            </div>

                            <div className="md:col-span-6 space-y-2.5">
                                <Label htmlFor="smtp_user">Usuário / Email</Label>
                                <Input
                                    id="smtp_user"
                                    value={formData['smtp_user']}
                                    onChange={(e) => handleChange('smtp_user', e.target.value)}
                                    placeholder="usuario@dominio.com"
                                />
                            </div>

                            <div className="md:col-span-6 space-y-2.5">
                                <div className="flex justify-between">
                                    <Label htmlFor="smtp_pass">Senha</Label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        {showPassword ? 'Ocultar' : 'Mostrar'}
                                    </button>
                                </div>
                                <Input
                                    id="smtp_pass"
                                    type={showPassword ? "text" : "password"}
                                    value={formData['smtp_password']}
                                    onChange={(e) => handleChange('smtp_password', e.target.value)}
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar Configurações
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Alert className="bg-info/10 border-info/20 text-info-800">
                <AlertCircle className="h-4 w-4 text-info" />
                <AlertTitle>Dica de Segurança</AlertTitle>
                <AlertDescription>
                    Se estiver usando Gmail, você precisará gerar uma "Senha de App" nas configurações da sua conta Google.
                </AlertDescription>
            </Alert>
        </div>
    );
}
