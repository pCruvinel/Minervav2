import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CheckCircle2,
    Building2,
    Users,
    Send,
    Loader2,
    AlertCircle,
    Briefcase
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { toast } from '@/lib/utils/safe-toast';
import { logger } from '@/lib/utils/logger';
import { useNavigate } from '@tanstack/react-router';
import { etapa3Schema, getFirstZodError } from '@/lib/validations/os10-schemas';
import type { Etapa1Data, Etapa2Data, Etapa3Data } from '@/lib/validations/os10-schemas';

// Types importados de @/lib/validations/os10-schemas (SSoT)

interface StepRevisaoEnvioProps {
    osId?: string;
    etapa1Data: Etapa1Data;
    etapa2Data: Etapa2Data;
    etapa3Data: Etapa3Data;
    readOnly?: boolean;
}

/**
 * StepRevisaoEnvio - Etapa 4 (Final): Revisão e Envio
 *
 * Exibe resumo de:
 * - Dados da solicitação (Etapa 1)
 * - Centro de Custo selecionado (Etapa 2)
 * - Lista de vagas com totais (Etapa 3)
 *
 * Ao clicar em "Enviar":
 * - Insere vagas em os_vagas_recrutamento vinculadas à OS já existente (criada na Etapa 2)
 * - Atualiza status_geral da OS para 'em_andamento'
 * - Marca todas as os_etapas como 'concluida'
 */
export function StepRevisaoEnvio({
    osId,
    etapa1Data,
    etapa2Data,
    etapa3Data,
    readOnly
}: StepRevisaoEnvioProps) {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const vagas = etapa3Data.vagas || [];
    const totalVagas = vagas.reduce((sum, vaga) => sum + vaga.quantidade, 0);

    const formatUrgencia = (urgencia: string) => {
        const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            baixa: { label: 'Baixa', variant: 'secondary' },
            normal: { label: 'Normal', variant: 'default' },
            alta: { label: 'Alta', variant: 'destructive' },
            critica: { label: 'Crítica', variant: 'destructive' },
        };
        return map[urgencia] || { label: urgencia, variant: 'default' };
    };

    const handleEnviar = async () => {
        if (isSubmitting) return;

        // Validação: osId deve existir (criada na Etapa 2)
        if (!osId) {
            toast.error('Erro interno: OS não encontrada. Volte ao início do formulário.');
            logger.error('[StepRevisaoEnvio] osId ausente — a OS deveria ter sido criada na Etapa 2.');
            return;
        }

        if (vagas.length === 0) {
            toast.error('Adicione pelo menos uma vaga antes de enviar.');
            return;
        }

        // Validação Zod das vagas
        const validation = etapa3Schema.safeParse(etapa3Data);
        if (!validation.success) {
            toast.error(getFirstZodError(validation));
            return;
        }

        setIsSubmitting(true);

        try {
            logger.log(`[StepRevisaoEnvio] 📤 Finalizando OS ${osId} com ${vagas.length} vagas`);

            // 1. Inserir vagas em os_vagas_recrutamento vinculadas à OS já existente
            const vagasParaInserir = vagas.map((vaga) => ({
                os_id: osId,
                cargo_id: vaga.cargo_id || null,
                cargo_funcao: vaga.cargo_nome,
                quantidade: vaga.quantidade,
                habilidades_necessarias: vaga.habilidades_necessarias || null,
                perfil_comportamental: vaga.perfil_comportamental || null,
                experiencia_minima: vaga.experiencia_minima || null,
                escolaridade_minima: vaga.escolaridade_minima || null,
                status: 'aberta' as const,
                urgencia: etapa1Data.urgencia || 'normal',
            }));

            const { error: vagasError } = await supabase
                .from('os_vagas_recrutamento')
                .insert(vagasParaInserir);

            if (vagasError) {
                logger.error('[StepRevisaoEnvio] ❌ Erro ao inserir vagas:', vagasError);
                throw vagasError;
            }

            logger.log(`[StepRevisaoEnvio] ✅ ${vagasParaInserir.length} vagas inseridas`);

            // 2. Atualizar status_geral da OS para 'em_andamento'
            const { error: osUpdateError } = await supabase
                .from('ordens_servico')
                .update({
                    status_geral: 'em_andamento',
                    descricao: `Requisição de Mão de Obra - ${totalVagas} vaga(s)`,
                })
                .eq('id', osId);

            if (osUpdateError) {
                logger.error('[StepRevisaoEnvio] ❌ Erro ao atualizar status da OS:', osUpdateError);
                throw osUpdateError;
            }

            // 3. Marcar todas as etapas como 'concluida'
            const { error: etapasUpdateError } = await supabase
                .from('os_etapas')
                .update({ status: 'concluida', data_conclusao: new Date().toISOString() })
                .eq('os_id', osId);

            if (etapasUpdateError) {
                logger.error('[StepRevisaoEnvio] ⚠️ Erro ao atualizar etapas (não-bloqueante):', etapasUpdateError);
                // Não bloqueia — as vagas já foram inseridas
            }

            // 4. Sucesso — navegar para listagem de OS
            toast.success('Requisição enviada com sucesso!');
            navigate({ to: '/os' });

        } catch (error) {
            logger.error('[StepRevisaoEnvio] ❌ Erro ao finalizar OS-10:', error);
            toast.error('Erro ao enviar requisição. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const urgenciaInfo = formatUrgencia(etapa1Data.urgencia);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Revisão e Envio</h2>
                    <p className="text-sm text-muted-foreground">
                        Confira os dados da requisição antes de enviar
                    </p>
                </div>
            </div>

            {/* Card Dados da Solicitação */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-primary" />
                        Dados da Solicitação
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Solicitante:</span>
                            <p className="font-medium">{etapa1Data.solicitante || '—'}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Departamento:</span>
                            <p className="font-medium">{etapa1Data.departamento || '—'}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Urgência:</span>
                            <p>
                                <Badge variant={urgenciaInfo.variant}>
                                    {urgenciaInfo.label}
                                </Badge>
                            </p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Data de Abertura:</span>
                            <p className="font-medium">
                                {etapa1Data.dataAbertura
                                    ? new Date(etapa1Data.dataAbertura).toLocaleDateString('pt-BR')
                                    : '—'}
                            </p>
                        </div>
                    </div>
                    {etapa1Data.justificativa && (
                        <div className="pt-2 border-t">
                            <span className="text-muted-foreground text-sm">Justificativa:</span>
                            <p className="text-sm mt-1">{etapa1Data.justificativa}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Card Centro de Custo */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        Centro de Custo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{etapa2Data.centroCustoNome || '—'}</p>
                            {etapa2Data.obraVinculada && (
                                <p className="text-sm text-muted-foreground">
                                    Cliente: {etapa2Data.obraVinculada}
                                </p>
                            )}
                        </div>
                        <Badge variant="outline">{etapa2Data.centroCusto ? 'Selecionado' : 'Não selecionado'}</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Card Vagas */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Vagas Solicitadas
                        <Badge variant="secondary" className="ml-2">
                            {totalVagas} {totalVagas === 1 ? 'vaga' : 'vagas'}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {vagas.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Nenhuma vaga adicionada</p>
                    ) : (
                        <div className="space-y-3">
                            {vagas.map((vaga) => (
                                <div
                                    key={vaga.id}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-primary/10 rounded">
                                            <Briefcase className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{vaga.cargo_nome}</p>
                                            {vaga.habilidades_necessarias && (
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {vaga.habilidades_necessarias}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant="secondary">
                                        {vaga.quantidade} {vaga.quantidade === 1 ? 'vaga' : 'vagas'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Alerta e Botão de Envio */}
            {!readOnly && (
                <>
                    <Alert className="bg-primary/5 border-primary/20">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-primary">
                            Ao clicar em "Enviar", a requisição será criada e encaminhada ao RH para processamento.
                        </AlertDescription>
                    </Alert>

                    <div className="flex justify-end">
                        <Button
                            size="lg"
                            onClick={handleEnviar}
                            disabled={isSubmitting || vagas.length === 0}
                            className="min-w-[160px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Enviar
                                </>
                            )}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
