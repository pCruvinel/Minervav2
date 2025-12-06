import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Briefcase } from 'lucide-react';

export interface VagaRecrutamento {
    id: string;
    cargo_id: string;
    cargo_nome: string;
    quantidade: number;
    habilidades_necessarias: string;
    perfil_comportamental: string;
    experiencia_minima?: string;
    escolaridade_minima?: string;
}

interface VagaCardProps {
    vaga: VagaRecrutamento;
    onRemove: (id: string) => void;
    readOnly?: boolean;
}

/**
 * VagaCard - Card compacto para exibir uma vaga de recrutamento
 *
 * Exibe:
 * - Nome do cargo
 * - Badge com quantidade de vagas
 * - Preview das habilidades (truncado)
 * - Botão de remover (quando não é readOnly)
 */
export function VagaCard({ vaga, onRemove, readOnly }: VagaCardProps) {
    const truncateText = (text: string, maxLength: number = 100) => {
        if (!text) return '—';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    return (
        <Card className="relative group hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    {/* Ícone e Info Principal */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <Briefcase className="w-5 h-5 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-base truncate">
                                    {vaga.cargo_nome}
                                </h4>
                                <Badge variant="secondary" className="flex-shrink-0">
                                    {vaga.quantidade} {vaga.quantidade === 1 ? 'vaga' : 'vagas'}
                                </Badge>
                            </div>

                            {/* Habilidades Preview */}
                            {vaga.habilidades_necessarias && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    <span className="font-medium">Requisitos:</span>{' '}
                                    {truncateText(vaga.habilidades_necessarias)}
                                </p>
                            )}

                            {/* Perfil Preview */}
                            {vaga.perfil_comportamental && (
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                    <span className="font-medium">Perfil:</span>{' '}
                                    {truncateText(vaga.perfil_comportamental, 60)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Botão Remover */}
                    {!readOnly && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onRemove(vaga.id)}
                            title="Remover vaga"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
