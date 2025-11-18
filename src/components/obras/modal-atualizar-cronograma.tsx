import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Upload, CheckCircle } from 'lucide-react';
import { ObraAtiva } from '../../lib/mock-data-gestores';
import { toast } from 'sonner@2.0.3';

/**
 * MODAL DE ATUALIZAÇÃO DE CRONOGRAMA
 * Permite atualizar percentual de conclusão e anexar medição
 */

interface ModalAtualizarCronogramaProps {
  obra: ObraAtiva;
  aberto: boolean;
  onFechar: () => void;
  onAtualizar: (obraAtualizada: ObraAtiva) => void;
}

export function ModalAtualizarCronograma({
  obra,
  aberto,
  onFechar,
  onAtualizar,
}: ModalAtualizarCronogramaProps) {
  const [novoPercentual, setNovoPercentual] = useState(obra.percentualConcluido.toString());
  const [novoStatus, setNovoStatus] = useState(obra.statusCronograma);
  const [observacoes, setObservacoes] = useState('');
  const [arquivoMedicao, setArquivoMedicao] = useState<File | null>(null);

  const handleSalvar = () => {
    const percentual = parseFloat(novoPercentual);

    if (isNaN(percentual) || percentual < 0 || percentual > 100) {
      toast.error('Percentual inválido', {
        description: 'Digite um valor entre 0 e 100',
      });
      return;
    }

    const obraAtualizada: ObraAtiva = {
      ...obra,
      percentualConcluido: percentual,
      statusCronograma: novoStatus as any,
      ultimoDiarioObra: new Date().toISOString().split('T')[0],
    };

    onAtualizar(obraAtualizada);

    toast.success('Cronograma atualizado com sucesso!', {
      description: `${obra.cliente} - ${percentual}% concluído`,
    });
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Atualizar Cronograma da Obra</DialogTitle>
          <DialogDescription>
            Registre o avanço físico e anexe documentos de medição
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações da Obra */}
          <Card>
            <CardHeader>
              <CardTitle>Dados da Obra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Código</Label>
                  <p className="font-mono">{obra.codigo}</p>
                </div>
                <div>
                  <Label>Cliente</Label>
                  <p>{obra.cliente}</p>
                </div>
                <div className="md:col-span-2">
                  <Label>Descrição da Obra</Label>
                  <p>{obra.tituloObra}</p>
                </div>
                <div>
                  <Label>Data Início</Label>
                  <p>{new Date(obra.dataInicio).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label>Previsão Término</Label>
                  <p>{new Date(obra.dataPrevistaTermino).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label>Percentual Atual</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={obra.percentualConcluido} className="flex-1" />
                    <span className="font-mono">{obra.percentualConcluido}%</span>
                  </div>
                </div>
                <div>
                  <Label>Status Atual</Label>
                  <div>
                    {obra.statusCronograma === 'NO_PRAZO' && (
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        No Prazo
                      </Badge>
                    )}
                    {obra.statusCronograma === 'ATENCAO' && (
                      <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                        Atenção
                      </Badge>
                    )}
                    {obra.statusCronograma === 'ATRASADO' && (
                      <Badge variant="destructive">Atrasado</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Atualização */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Novo Percentual */}
            <div className="space-y-2">
              <Label htmlFor="percentual">Novo Percentual de Conclusão (%) *</Label>
              <Input
                id="percentual"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={novoPercentual}
                onChange={(e) => setNovoPercentual(e.target.value)}
                placeholder="Ex: 75.5"
              />
              <p className="text-muted-foreground">
                Digite um valor entre 0 e 100
              </p>
            </div>

            {/* Novo Status do Cronograma */}
            <div className="space-y-2">
              <Label htmlFor="status">Status do Cronograma *</Label>
              <Select value={novoStatus} onValueChange={setNovoStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_PRAZO">No Prazo</SelectItem>
                  <SelectItem value="ATENCAO">Atenção</SelectItem>
                  <SelectItem value="ATRASADO">Atrasado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground">
                Situação atual do cronograma
              </p>
            </div>
          </div>

          {/* Upload de Medição */}
          <div className="space-y-2">
            <Label htmlFor="arquivo">Anexar Medição (Opcional)</Label>
            <div className="border-2 border-dashed rounded-lg p-6">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground text-center">
                  Arraste um arquivo ou clique para selecionar
                </p>
                <Input
                  id="arquivo"
                  type="file"
                  accept=".pdf,.xlsx,.xls,.doc,.docx"
                  onChange={(e) => setArquivoMedicao(e.target.files?.[0] || null)}
                  className="max-w-xs"
                />
                {arquivoMedicao && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>{arquivoMedicao.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações / Resumo do Avanço</Label>
            <Textarea
              id="observacoes"
              placeholder="Descreva o avanço realizado, atividades concluídas, etc..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Preview do Novo Status */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Preview da Atualização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Percentual anterior:</span>
                  <span className="font-mono">{obra.percentualConcluido}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Novo percentual:</span>
                  <span className="font-mono text-[#D3AF37]">
                    {parseFloat(novoPercentual) || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Variação:</span>
                  <span className="font-mono">
                    {((parseFloat(novoPercentual) || 0) - obra.percentualConcluido).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            className="bg-[#D3AF37] hover:bg-[#D3AF37]/90"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Salvar Atualização
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
