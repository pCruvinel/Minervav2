import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ModalHeaderPadrao } from '@/components/ui/modal-header-padrao';
import { useCargos, Cargo } from '@/lib/hooks/use-os-workflows';
import { Briefcase, Loader2 } from 'lucide-react';
import type { VagaRecrutamento } from './vaga-card';

interface ModalAdicionarVagaProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (vaga: Omit<VagaRecrutamento, 'id'>) => void;
}

// Slugs de cargos a serem filtrados (não devem aparecer no dropdown)
const CARGOS_FILTRADOS = ['admin', 'diretor'];

/**
 * ModalAdicionarVaga - Modal para adicionar uma nova vaga de recrutamento
 *
 * Campos:
 * - Cargo (Select com dados do Supabase, filtrando admin e diretor)
 * - Quantidade de Vagas (Number, min 1)
 * - Habilidades/Requisitos (Textarea)
 * - Perfil Comportamental (Textarea)
 */
export function ModalAdicionarVaga({ open, onOpenChange, onAdd }: ModalAdicionarVagaProps) {
    const { cargos, loading: cargosLoading } = useCargos();

    // Estado do formulário
    const [cargoId, setCargoId] = useState('');
    const [cargoNome, setCargoNome] = useState('');
    const [quantidade, setQuantidade] = useState(1);
    const [habilidades, setHabilidades] = useState('');
    const [perfil, setPerfil] = useState('');

    // Filtrar cargos para remover admin e diretor
    const cargosFiltrados = cargos.filter(
        (cargo: Cargo) => !CARGOS_FILTRADOS.includes(cargo.slug)
    );

    // Reset form quando fecha
    useEffect(() => {
        if (!open) {
            setCargoId('');
            setCargoNome('');
            setQuantidade(1);
            setHabilidades('');
            setPerfil('');
        }
    }, [open]);

    const handleCargoChange = (value: string) => {
        setCargoId(value);
        const cargoSelecionado = cargosFiltrados.find((c: Cargo) => c.id === value);
        if (cargoSelecionado) {
            setCargoNome(cargoSelecionado.nome);
        }
    };

    const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 1) {
            setQuantidade(value);
        }
    };

    const isFormValid = cargoId && quantidade >= 1;

    const handleSubmit = () => {
        if (!isFormValid) return;

        onAdd({
            cargo_id: cargoId,
            cargo_nome: cargoNome,
            quantidade,
            habilidades_necessarias: habilidades.trim(),
            perfil_comportamental: perfil.trim(),
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
                <ModalHeaderPadrao
                    title="Adicionar Nova Vaga"
                    description="Preencha os dados da vaga a ser requisitada"
                    icon={Briefcase}
                    theme="create"
                />

                <div className="space-y-5 p-6">
                    {/* Cargo */}
                    <div className="space-y-2">
                        <Label htmlFor="cargo">
                            Cargo <span className="text-destructive">*</span>
                        </Label>
                        {cargosLoading ? (
                            <div className="flex items-center gap-2 text-muted-foreground py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Carregando cargos...</span>
                            </div>
                        ) : (
                            <Select value={cargoId} onValueChange={handleCargoChange}>
                                <SelectTrigger id="cargo">
                                    <SelectValue placeholder="Selecione o cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cargosFiltrados.map((cargo: Cargo) => (
                                        <SelectItem key={cargo.id} value={cargo.id}>
                                            {cargo.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Quantidade */}
                    <div className="space-y-2">
                        <Label htmlFor="quantidade">
                            Quantidade de Vagas <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="quantidade"
                            type="number"
                            min={1}
                            value={quantidade}
                            onChange={handleQuantidadeChange}
                            placeholder="1"
                        />
                        <p className="text-xs text-muted-foreground">
                            Número de vagas para este cargo
                        </p>
                    </div>

                    {/* Habilidades/Requisitos */}
                    <div className="space-y-2">
                        <Label htmlFor="habilidades">Habilidades / Requisitos</Label>
                        <Textarea
                            id="habilidades"
                            value={habilidades}
                            onChange={(e) => setHabilidades(e.target.value)}
                            placeholder="Ex: Experiência com construção civil, conhecimento em NR-35, disponibilidade para viagens..."
                            rows={3}
                        />
                    </div>

                    {/* Perfil Comportamental */}
                    <div className="space-y-2">
                        <Label htmlFor="perfil">Perfil Comportamental</Label>
                        <Textarea
                            id="perfil"
                            value={perfil}
                            onChange={(e) => setPerfil(e.target.value)}
                            placeholder="Ex: Proativo, trabalho em equipe, boa comunicação, pontualidade..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter className="p-6 bg-muted/30 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isFormValid}>
                        Adicionar Vaga
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
