import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VagaCard, VagaRecrutamento } from '../components/vaga-card';
import { ModalAdicionarVaga } from '../components/modal-adicionar-vaga';
import { Plus, Users, AlertCircle } from 'lucide-react';

/* eslint-disable no-unused-vars */
interface StepGerenciadorVagasProps {
    data: {
        vagas: VagaRecrutamento[];
    };
    onDataChange: (data: { vagas: VagaRecrutamento[] }) => void;
    readOnly?: boolean;
}
/* eslint-enable no-unused-vars */

/**
 * StepGerenciadorVagas - Etapa 3 (Nova): Gerenciador de Vagas
 *
 * Interface Master-Detail para gerenciar múltiplas vagas:
 * - Lista de cards com vagas adicionadas
 * - Modal para adicionar nova vaga
 * - Edição de vagas existentes via mesmo modal
 * - Total de vagas calculado automaticamente
 * - Validação: mínimo 1 vaga para avançar
 */
export function StepGerenciadorVagas({ data, onDataChange, readOnly }: StepGerenciadorVagasProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [vagaEmEdicao, setVagaEmEdicao] = useState<VagaRecrutamento | undefined>(undefined);

    const vagas = data.vagas || [];
    const totalVagas = vagas.reduce((sum, vaga) => sum + vaga.quantidade, 0);

    const handleAddVaga = (novaVaga: Omit<VagaRecrutamento, 'id'>) => {
        const vagaComId: VagaRecrutamento = {
            ...novaVaga,
            id: window.crypto.randomUUID(),
        };
        onDataChange({
            vagas: [...vagas, vagaComId],
        });
    };

    const handleEditVaga = (vagaEditada: VagaRecrutamento) => {
        onDataChange({
            vagas: vagas.map((v) => v.id === vagaEditada.id ? vagaEditada : v),
        });
        setVagaEmEdicao(undefined);
    };

    const handleRemoveVaga = (id: string) => {
        onDataChange({
            vagas: vagas.filter((v) => v.id !== id),
        });
    };

    const handleOpenEdit = (vaga: VagaRecrutamento) => {
        setVagaEmEdicao(vaga);
        setModalOpen(true);
    };

    const handleOpenAdd = () => {
        setVagaEmEdicao(undefined);
        setModalOpen(true);
    };

    const handleModalClose = (open: boolean) => {
        setModalOpen(open);
        if (!open) {
            setVagaEmEdicao(undefined);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Gerenciador de Vagas</h2>
                    <p className="text-sm text-muted-foreground">
                        Adicione as vagas que deseja solicitar nesta requisição
                    </p>
                </div>
            </div>

            {/* Lista de Vagas */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base border-b border-border pb-2 flex-1" style={{ color: 'var(--primary)' }}>
                        Vagas Solicitadas
                    </h3>
                    {!readOnly && (
                        <Button
                            onClick={handleOpenAdd}
                            className="ml-4"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Nova Vaga
                        </Button>
                    )}
                </div>

                {vagas.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground mb-2">
                            Nenhuma vaga adicionada ainda
                        </p>
                        {!readOnly && (
                            <Button
                                variant="outline"
                                onClick={handleOpenAdd}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Primeira Vaga
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {vagas.map((vaga) => (
                            <VagaCard
                                key={vaga.id}
                                vaga={vaga}
                                onRemove={handleRemoveVaga}
                                onEdit={readOnly ? undefined : handleOpenEdit}
                                readOnly={readOnly}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Resumo Total */}
            {vagas.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Total de Vagas</span>
                        <span className="text-sm text-muted-foreground">
                            ({vagas.length} {vagas.length === 1 ? 'cargo' : 'cargos'})
                        </span>
                    </div>
                    <Badge variant="default" className="text-base px-4 py-1">
                        {totalVagas} {totalVagas === 1 ? 'vaga' : 'vagas'}
                    </Badge>
                </div>
            )}

            {/* Alerta de validação */}
            {vagas.length === 0 && !readOnly && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Adicione pelo menos uma vaga para continuar.
                    </AlertDescription>
                </Alert>
            )}

            {/* Modal de Adicionar/Editar Vaga */}
            <ModalAdicionarVaga
                open={modalOpen}
                onOpenChange={handleModalClose}
                onAdd={handleAddVaga}
                vagaParaEditar={vagaEmEdicao}
                onEdit={handleEditVaga}
            />
        </div>
    );
}
