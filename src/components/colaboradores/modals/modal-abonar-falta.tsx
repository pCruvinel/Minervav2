import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface ModalAbonarFaltaProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line no-unused-vars
    onConfirm: (motivo: string, anexo: File | null) => void;
    isLoading?: boolean;
}

export function ModalAbonarFalta({
    isOpen,
    onClose,
    onConfirm,
    isLoading
}: ModalAbonarFaltaProps) {
    const [motivoSelecionado, setMotivoSelecionado] = useState<string>('');
    const [outroMotivo, setOutroMotivo] = useState('');
    const [anexo, setAnexo] = useState<File | null>(null);

    const handleSubmit = () => {
        const motivoFinal = motivoSelecionado === 'OUTROS' ? outroMotivo : motivoSelecionado;
        if (!motivoFinal) return;
        onConfirm(motivoFinal, anexo);
    };

    // Reseta estado ao abrir/fechar
    React.useEffect(() => {
        if (isOpen) {
            setMotivoSelecionado('');
            setOutroMotivo('');
            setAnexo(null);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Abonar Falta</DialogTitle>
                    <DialogDescription>
                        Selecione o motivo para abonar esta falta. A falta ainda será contabilizada, mas marcada como justificada/abonada.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="motivo">Motivo do Abono</Label>
                        <Select
                            value={motivoSelecionado}
                            onValueChange={setMotivoSelecionado}
                        >
                            <SelectTrigger id="motivo">
                                <SelectValue placeholder="Selecione um motivo..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Atestado Médico">Atestado Médico</SelectItem>
                                <SelectItem value="Doação de Sangue">Doação de Sangue</SelectItem>
                                <SelectItem value="Casamento">Casamento</SelectItem>
                                <SelectItem value="Luto">Luto (Morte em Família)</SelectItem>
                                <SelectItem value="Alistamento Eleitoral">Alistamento Eleitoral</SelectItem>
                                <SelectItem value="Acompanhamento Médico (Filho)">Acompanhamento Médico (Filho)</SelectItem>
                                <SelectItem value="Licença Maternidade/Paternidade">Licença Maternidade/Paternidade</SelectItem>
                                <SelectItem value="Acidente de Trabalho">Acidente de Trabalho</SelectItem>
                                <SelectItem value="OUTROS">Outros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {motivoSelecionado === 'OUTROS' && (
                        <div className="space-y-2">
                            <Label htmlFor="outro_motivo">Especifique o motivo</Label>
                            <Textarea
                                id="outro_motivo"
                                placeholder="Digite o motivo do abono..."
                                value={outroMotivo}
                                onChange={(e) => setOutroMotivo(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="anexo_abono">Anexo (Atestado/Comprovante)</Label>
                        <Input
                            id="anexo_abono"
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => setAnexo(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Anexe o arquivo que comprova o motivo do abono (opcional).
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!motivoSelecionado || (motivoSelecionado === 'OUTROS' && !outroMotivo) || isLoading}
                    >
                        Confirmar Abono
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
